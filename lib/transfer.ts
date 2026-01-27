import { type Address, encodeFunctionData, parseUnits } from 'viem';

// ERC20 ABI for transfer
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

// ERC721 ABI for transfer
const ERC721_ABI = [
  {
    name: 'safeTransferFrom',
    type: 'function',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'transferFrom',
    type: 'function',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'ownerOf',
    type: 'function',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

// ERC1155 ABI for transfer
const ERC1155_ABI = [
  {
    name: 'safeTransferFrom',
    type: 'function',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'id', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// Encode ERC20 transfer
export function encodeERC20Transfer(
  to: Address,
  amount: string,
  decimals: number
): `0x${string}` {
  const parsedAmount = parseUnits(amount, decimals);
  return encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [to, parsedAmount],
  });
}

// Encode ERC721 transfer
export function encodeERC721Transfer(
  from: Address,
  to: Address,
  tokenId: string
): `0x${string}` {
  return encodeFunctionData({
    abi: ERC721_ABI,
    functionName: 'safeTransferFrom',
    args: [from, to, BigInt(tokenId)],
  });
}

// Encode ERC1155 transfer
export function encodeERC1155Transfer(
  from: Address,
  to: Address,
  tokenId: string,
  amount: number
): `0x${string}` {
  return encodeFunctionData({
    abi: ERC1155_ABI,
    functionName: 'safeTransferFrom',
    args: [from, to, BigInt(tokenId), BigInt(amount), '0x'],
  });
}

// Build transaction for token transfer
export function buildTokenTransferTx(
  contractAddress: Address,
  to: Address,
  amount: string,
  decimals: number
) {
  return {
    to: contractAddress,
    data: encodeERC20Transfer(to, amount, decimals),
    value: BigInt(0),
  };
}

// Build transaction for NFT transfer
export function buildNftTransferTx(
  contractAddress: Address,
  from: Address,
  to: Address,
  tokenId: string,
  tokenType: 'ERC721' | 'ERC1155',
  amount?: number
) {
  const data = tokenType === 'ERC721'
    ? encodeERC721Transfer(from, to, tokenId)
    : encodeERC1155Transfer(from, to, tokenId, amount || 1);

  return {
    to: contractAddress,
    data,
    value: BigInt(0),
  };
}

// Distribute tokens equally among winners
export function calculateDistribution(
  totalAmount: string,
  decimals: number,
  winnerCount: number
): string {
  const total = parseUnits(totalAmount, decimals);
  const perWinner = total / BigInt(winnerCount);

  // Convert back to human-readable format
  const divisor = BigInt(10 ** decimals);
  const whole = perWinner / divisor;
  const fraction = perWinner % divisor;

  if (fraction === BigInt(0)) {
    return whole.toString();
  }

  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole}.${fractionStr}`;
}
