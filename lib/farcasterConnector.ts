import { createConnector } from 'wagmi';
import { type EIP1193Provider } from 'viem';

// Get Farcaster provider from window object
function getFarcasterProvider(): EIP1193Provider | null {
  if (typeof window !== 'undefined' && window.farcaster?.wallet?.ethProvider) {
    return window.farcaster.wallet.ethProvider as EIP1193Provider;
  }
  return null;
}

export function farcasterFrame() {
  type Provider = EIP1193Provider;

  return createConnector<Provider>((config) => ({
    id: 'farcaster-frame',
    name: 'Farcaster',
    type: 'farcaster-frame',

    async setup() {},

    async connect() {
      const provider = await this.getProvider();
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
      const provider = await this.getProvider();
      const accounts = (await provider.request({
        method: 'eth_accounts',
      })) as string[];
      return accounts as `0x${string}`[];
    },

    async getChainId() {
      const provider = await this.getProvider();
      const chainId = (await provider.request({
        method: 'eth_chainId',
      })) as string;
      return Number(chainId);
    },

    async getProvider() {
      const provider = getFarcasterProvider();
      if (!provider) {
        throw new Error('Farcaster provider not available. Make sure you are running inside Farcaster.');
      }
      return provider;
    },

    async isAuthorized() {
      try {
        const provider = getFarcasterProvider();
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
      const provider = await this.getProvider();
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
