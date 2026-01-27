import { Alchemy, Network } from 'alchemy-sdk';

const API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const BASE_URL = `https://base-mainnet.g.alchemy.com/v2/${API_KEY}`;

const settings = {
  apiKey: API_KEY,
  network: Network.BASE_MAINNET,
};

export const alchemy = new Alchemy(settings);

// Native ETH address constant (used for identification)
export const NATIVE_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

// Get all ERC20 tokens for an address using REST API directly
export async function getTokenBalances(address: string) {
  // Get ETH balance and ERC20 token balances in parallel
  const [ethBalanceRes, balancesRes] = await Promise.all([
    // Get native ETH balance
    fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }),
    }),
    // Get ERC20 token balances
    fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'alchemy_getTokenBalances',
        params: [address, 'erc20'],
      }),
    }),
  ]);

  const [ethBalanceData, balancesData] = await Promise.all([
    ethBalanceRes.json(),
    balancesRes.json(),
  ]);

  const tokens = [];

  // Add ETH as the first token if balance > 0
  if (ethBalanceData.result && ethBalanceData.result !== '0x0') {
    tokens.push({
      contractAddress: NATIVE_ETH_ADDRESS,
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      balance: ethBalanceData.result,
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    });
  }

  if (balancesData.error) {
    throw new Error(balancesData.error.message);
  }

  const tokenBalances = balancesData.result?.tokenBalances || [];

  // Filter out zero balances
  const nonZeroBalances = tokenBalances.filter(
    (token: { tokenBalance: string }) =>
      token.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000'
  );

  // Get metadata for each token
  const erc20Tokens = await Promise.all(
    nonZeroBalances.map(async (token: { contractAddress: string; tokenBalance: string }) => {
      const metadataRes = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getTokenMetadata',
          params: [token.contractAddress],
        }),
      });

      const metadataData = await metadataRes.json();
      const metadata = metadataData.result || {};

      return {
        contractAddress: token.contractAddress,
        name: metadata.name || 'Unknown',
        symbol: metadata.symbol || 'UNKNOWN',
        decimals: metadata.decimals || 18,
        balance: token.tokenBalance || '0',
        logo: metadata.logo,
      };
    })
  );

  return [...tokens, ...erc20Tokens];
}

// Get all NFTs for an address
export async function getNftsForOwner(address: string) {
  const nfts = await alchemy.nft.getNftsForOwner(address);

  return nfts.ownedNfts.map((nft) => ({
    contractAddress: nft.contract.address,
    tokenId: nft.tokenId,
    name: nft.name || nft.contract.name || 'Unknown NFT',
    description: nft.description,
    image: nft.image?.cachedUrl || nft.image?.originalUrl,
    tokenType: nft.tokenType as 'ERC721' | 'ERC1155',
    balance: nft.balance ? parseInt(nft.balance) : 1,
  }));
}

// Get specific token metadata
export async function getTokenMetadata(contractAddress: string) {
  return await alchemy.core.getTokenMetadata(contractAddress);
}

// Get specific NFT metadata
export async function getNftMetadata(contractAddress: string, tokenId: string) {
  return await alchemy.nft.getNftMetadata(contractAddress, tokenId);
}
