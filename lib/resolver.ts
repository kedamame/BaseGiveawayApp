import { createPublicClient, http } from 'viem';
import { base, mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import { getUserByUsername } from './neynar';

// Mainnet client for ENS resolution
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// Base client for Basename resolution
const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

// L2 Resolver contract address for Basenames
const L2_RESOLVER_ADDRESS = '0xC6d566A56A1aFf6508b41D6c757E4f8c9d2dC2D6';

// Resolve ENS name to address
export async function resolveEns(name: string): Promise<string | null> {
  try {
    const normalizedName = normalize(name);
    const address = await mainnetClient.getEnsAddress({
      name: normalizedName,
    });
    return address;
  } catch (error) {
    console.error('Error resolving ENS:', error);
    return null;
  }
}

// Resolve Basename to address
export async function resolveBasename(name: string): Promise<string | null> {
  try {
    // Basenames are resolved on Base L2
    // Format: name.base.eth
    const fullName = name.endsWith('.base.eth') ? name : `${name}.base.eth`;
    const normalizedName = normalize(fullName);

    // Use the L2 resolver for Basenames
    const address = await baseClient.getEnsAddress({
      name: normalizedName,
      universalResolverAddress: L2_RESOLVER_ADDRESS,
    });

    return address;
  } catch (error) {
    console.error('Error resolving Basename:', error);
    return null;
  }
}

// Resolve Farcaster username to address
export async function resolveFarcaster(username: string): Promise<string | null> {
  try {
    // Remove @ prefix if present
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

    const user = await getUserByUsername(cleanUsername);
    if (!user) return null;

    // Return the first verified ETH address
    return user.verified_addresses?.eth_addresses?.[0] || null;
  } catch (error) {
    console.error('Error resolving Farcaster username:', error);
    return null;
  }
}

// Detect input type and resolve to address
export async function resolveAddress(input: string): Promise<{
  address: string | null;
  inputType: 'address' | 'basename' | 'ens' | 'farcaster';
}> {
  const trimmedInput = input.trim().toLowerCase();

  // Check if it's already a valid Ethereum address
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmedInput)) {
    return { address: trimmedInput, inputType: 'address' };
  }

  // Check if it's a Farcaster username (starts with @)
  if (trimmedInput.startsWith('@')) {
    const address = await resolveFarcaster(trimmedInput);
    return { address, inputType: 'farcaster' };
  }

  // Check if it's a Basename (ends with .base.eth or just the name)
  if (trimmedInput.endsWith('.base.eth') || (!trimmedInput.includes('.') && !trimmedInput.startsWith('0x'))) {
    // Try Basename first
    const basenameAddress = await resolveBasename(trimmedInput);
    if (basenameAddress) {
      return { address: basenameAddress, inputType: 'basename' };
    }

    // If not a basename and looks like a username, try Farcaster
    if (!trimmedInput.includes('.')) {
      const farcasterAddress = await resolveFarcaster(trimmedInput);
      if (farcasterAddress) {
        return { address: farcasterAddress, inputType: 'farcaster' };
      }
    }
  }

  // Check if it's an ENS name (ends with .eth)
  if (trimmedInput.endsWith('.eth')) {
    const address = await resolveEns(trimmedInput);
    return { address, inputType: 'ens' };
  }

  // Default: try as Farcaster username
  const address = await resolveFarcaster(trimmedInput);
  return { address, inputType: 'farcaster' };
}

// Batch resolve multiple inputs
export async function batchResolveAddresses(inputs: string[]): Promise<Array<{
  input: string;
  address: string | null;
  inputType: 'address' | 'basename' | 'ens' | 'farcaster';
}>> {
  const results = await Promise.all(
    inputs.map(async (input) => {
      const result = await resolveAddress(input);
      return { input, ...result };
    })
  );

  return results;
}
