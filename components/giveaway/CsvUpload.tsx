'use client';

import { useRef, useState } from 'react';
import Papa from 'papaparse';
import type { ParticipantInput } from '@/types';

interface CsvUploadProps {
  onImport: (participants: ParticipantInput[]) => void;
}

export function CsvUpload({ onImport }: CsvUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Array<{ input: string; weight: number }> | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setError(null);
    setPreview(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data as Array<Record<string, string>>;

          // Try to detect the address/input column
          const possibleAddressColumns = ['address', 'wallet', 'input', 'user', 'account', 'eth_address'];
          const possibleWeightColumns = ['weight', 'amount', 'points', 'score'];

          let addressColumn = '';
          let weightColumn = '';

          const headers = Object.keys(data[0] || {}).map(h => h.toLowerCase());

          for (const col of possibleAddressColumns) {
            const found = headers.find(h => h.includes(col));
            if (found) {
              addressColumn = Object.keys(data[0] || {}).find(k => k.toLowerCase() === found) || '';
              break;
            }
          }

          for (const col of possibleWeightColumns) {
            const found = headers.find(h => h.includes(col));
            if (found) {
              weightColumn = Object.keys(data[0] || {}).find(k => k.toLowerCase() === found) || '';
              break;
            }
          }

          // Fall back to first column if no address column found
          if (!addressColumn && data[0]) {
            addressColumn = Object.keys(data[0])[0];
          }

          const participants = data
            .filter(row => row[addressColumn]?.trim())
            .map(row => ({
              input: row[addressColumn].trim(),
              weight: weightColumn ? parseInt(row[weightColumn]) || 1 : 1,
            }));

          if (participants.length === 0) {
            setError('No valid entries found in CSV');
            setProcessing(false);
            return;
          }

          setPreview(participants);
          setProcessing(false);
        } catch (err) {
          setError('Failed to parse CSV file');
          setProcessing(false);
        }
      },
      error: () => {
        setError('Failed to read CSV file');
        setProcessing(false);
      },
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!preview) return;

    setProcessing(true);
    setError(null);

    try {
      // Batch resolve addresses
      const res = await fetch('/api/resolve/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: preview.map(p => p.input) }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setProcessing(false);
        return;
      }

      const resolvedParticipants: ParticipantInput[] = [];
      const results = data.results as Array<{
        input: string;
        address: string | null;
        inputType: 'address' | 'basename' | 'ens' | 'farcaster';
      }>;

      for (let i = 0; i < preview.length; i++) {
        const result = results[i];
        if (result?.address) {
          resolvedParticipants.push({
            input: preview[i].input,
            inputType: result.inputType,
            weight: preview[i].weight,
            resolvedAddress: result.address,
          });
        }
      }

      if (resolvedParticipants.length === 0) {
        setError('No addresses could be resolved');
        setProcessing(false);
        return;
      }

      onImport(resolvedParticipants);
      setPreview(null);
    } catch (err) {
      setError('Failed to resolve addresses');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-base-gray-600 rounded-xl p-6 text-center hover:border-base-gray-500 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        <svg className="w-12 h-12 mx-auto mb-4 text-base-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={processing}
          className="btn-secondary"
        >
          {processing ? 'Processing...' : 'Upload CSV'}
        </button>

        <p className="text-sm text-base-gray-500 mt-3">
          CSV with columns: address (or wallet, user), weight (optional)
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {preview && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-medium">Preview ({preview.length} entries)</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPreview(null)}
                className="text-sm text-base-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={processing}
                className="btn-primary py-1 px-3 text-sm"
              >
                {processing ? 'Importing...' : 'Import All'}
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-auto bg-base-gray-800 rounded-lg p-2 space-y-1">
            {preview.slice(0, 10).map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-base-gray-300 truncate">{item.input}</span>
                <span className="text-base-gray-500 ml-2">w:{item.weight}</span>
              </div>
            ))}
            {preview.length > 10 && (
              <p className="text-xs text-base-gray-500 text-center pt-2">
                +{preview.length - 10} more entries
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
