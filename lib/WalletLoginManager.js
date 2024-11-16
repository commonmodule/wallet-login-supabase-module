import { AuthTokenManager } from "@common-module/supabase";
import { WalletSessionManager } from "@common-module/wallet";
import { createSIWEConfig, formatMessage, } from "@reown/appkit-siwe";
import WalletLoginConfig from "./WalletLoginConfig.js";
class WalletLoginManager extends AuthTokenManager {
    getWalletAddress() {
        return this.store.get("walletAddress");
    }
    get isLoggedIn() {
        return !!this.token && !!this.getWalletAddress();
    }
    siweConfig;
    getSiewConfig() {
        if (!this.siweConfig)
            throw new Error("SIWE config not initialized");
        return this.siweConfig;
    }
    constructor() {
        super("wallet-login-manager");
    }
    init(options) {
        WalletSessionManager.init({
            ...options,
            siweConfig: createSIWEConfig({
                getMessageParams: async () => ({
                    domain: window.location.host,
                    uri: window.location.origin,
                    chains: options.networks.filter((n) => typeof n.id === "number").map((n) => n.id),
                    statement: WalletLoginConfig.messageForWalletLogin,
                }),
                createMessage: ({ address, ...args }) => formatMessage(args, address),
                getNonce: async () => {
                    throw new Error("Not implemented");
                },
                getSession: async () => {
                    throw new Error("Not implemented");
                },
                verifyMessage: async () => {
                    throw new Error("Not implemented");
                },
                signOut: async () => true,
            }),
        });
    }
    openWallet() {
        WalletSessionManager.openWallet();
    }
    async login() {
        await this.getSiewConfig().signIn();
    }
    async logout() {
        await this.getSiewConfig().signOut();
    }
    async readContract(parameters) {
        return await WalletSessionManager.readContract(parameters);
    }
    async writeContract(parameters) {
        if (!this.getWalletAddress())
            throw new Error("Not connected");
        if (WalletSessionManager.getWalletAddress() !== this.getWalletAddress()) {
            throw new Error("Wallet address mismatch");
        }
        return await WalletSessionManager.writeContract(parameters);
    }
}
export default new WalletLoginManager();
//# sourceMappingURL=WalletLoginManager.js.map