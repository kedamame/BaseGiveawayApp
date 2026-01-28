import { createConnector } from 'wagmi';
import { type EIP1193Provider } from 'viem';

// Lazy load the SDK to avoid issues during initial load
async function getSDK() {
  const { default: sdk } = await import('@farcaster/frame-sdk');
  return sdk;
}

export function farcasterFrame() {
  type Provider = EIP1193Provider;

  return createConnector<Provider>((config) => ({
    id: 'farcaster-frame',
    name: 'Farcaster',
    type: 'farcaster-frame',

    async setup() {
      // Don't throw during setup
    },

    async connect() {
      const sdk = await getSDK();
      const provider = sdk.wallet.ethProvider;
      if (!provider) {
        throw new Error('Farcaster provider not available');
      }
      const accounts = (await provider.request({
        method: 'eth_requestAccounts',
      })) as string[];
      const chainId = await this.getChainId();

      return {
        accounts: accounts as `0x${string}`[],
        chainId,
      };
    },

    async disconnect() {
      // Farcaster doesn't have a disconnect method
    },

    async getAccounts() {
      try {
        const sdk = await getSDK();
        const provider = sdk.wallet.ethProvider;
        if (!provider) return [];
        const accounts = (await provider.request({
          method: 'eth_accounts',
        })) as string[];
        return accounts as `0x${string}`[];
      } catch {
        return [];
      }
    },

    async getChainId() {
      try {
        const sdk = await getSDK();
        const provider = sdk.wallet.ethProvider;
        if (!provider) return config.chains[0].id;
        const chainId = (await provider.request({
          method: 'eth_chainId',
        })) as string;
        return Number(chainId);
      } catch {
        return config.chains[0].id;
      }
    },

    async getProvider() {
      const sdk = await getSDK();
      const provider = sdk.wallet.ethProvider;
      if (!provider) {
        throw new Error('Farcaster provider not available');
      }
      return provider as Provider;
    },

    async isAuthorized() {
      try {
        const sdk = await getSDK();
        const provider = sdk.wallet.ethProvider;
        if (!provider) return false;

        const accounts = (await provider.request({
          method: 'eth_accounts',
        })) as string[];
        return accounts.length > 0;
      } catch {
        return false;
      }
    },

    async switchChain({ chainId }) {
      const sdk = await getSDK();
      const provider = sdk.wallet.ethProvider;
      if (!provider) {
        throw new Error('Farcaster provider not available');
      }
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      return config.chains.find((c) => c.id === chainId) ?? config.chains[0];
    },

    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        config.emitter.emit('disconnect');
      } else {
        config.emitter.emit('change', {
          accounts: accounts as `0x${string}`[],
        });
      }
    },

    onChainChanged(chainId) {
      config.emitter.emit('change', { chainId: Number(chainId) });
    },

    onDisconnect() {
      config.emitter.emit('disconnect');
    },
  }));
}
