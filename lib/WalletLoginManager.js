import { AuthTokenManager } from "@common-module/supabase";
import { WalletSessionManager } from "@common-module/wallet";
import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createSIWEConfig, formatMessage, } from "@reown/appkit-siwe";
import WalletLoginConfig from "./WalletLoginConfig.js";
class WalletLoginManager extends AuthTokenManager {
    sessionManager;
    getWalletAddress() {
        return this.store.get("walletAddress");
    }
    isLoggedIn = !!this.token && !!this.getWalletAddress();
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
        this.siweConfig = createSIWEConfig({
            getMessageParams: async () => ({
                domain: window.location.host,
                uri: window.location.origin,
                chains: options.networks.filter((n) => typeof n.id === "number").map((n) => n.id),
                statement: WalletLoginConfig.messageForWalletLogin,
            }),
            createMessage: ({ address, ...args }) => formatMessage(args, address),
            getNonce: () => WalletLoginConfig.supabaseConnector.callEdgeFunction("siwe/nonce"),
            verifyMessage: async ({ message, signature }) => {
                const token = await WalletLoginConfig.supabaseConnector
                    .callEdgeFunction("siwe/verify", {
                    message,
                    signature,
                    projectId: options.projectId,
                });
                this.token = token;
                this.checkLoginStatusChanged();
                return true;
            },
            getSession: async () => {
                const result = await WalletLoginConfig.supabaseConnector
                    .callEdgeFunction("siwe/session");
                return (result.address && result.chainId) ? result : null;
            },
            signOut: async () => true,
        });
        this.sessionManager = new WalletSessionManager(createAppKit({
            ...options,
            adapters: [new WagmiAdapter(options)],
            siweConfig: this.siweConfig,
        })).on("sessionChanged", (walletAddress) => {
            if (this.getWalletAddress()) {
                if (walletAddress === undefined) {
                    this.store.remove("walletAddress");
                    this.checkLoginStatusChanged();
                }
                else if (walletAddress !== this.getWalletAddress()) {
                    this.sessionManager.disconnect();
                }
            }
            else if (walletAddress !== undefined) {
                this.store.setPermanent("walletAddress", walletAddress);
                this.checkLoginStatusChanged();
            }
        });
    }
    checkLoginStatusChanged() {
        if (this.isLoggedIn !== (!!this.token && !!this.getWalletAddress())) {
            this.isLoggedIn = !!this.token && !!this.getWalletAddress();
            this.emit("loginStatusChanged", this.isLoggedIn);
        }
    }
    openWallet() {
        this.sessionManager.openWallet();
    }
    async signIn() {
        await this.signOut();
        if (!this.sessionManager.appKit.getAddress()) {
            this.sessionManager.appKit.open();
        }
        else {
            await this.getSiewConfig().signIn();
            this.checkLoginStatusChanged();
        }
    }
    async signOut() {
        this.token = undefined;
        this.store.remove("walletAddress");
        await this.getSiewConfig().signOut();
        await this.sessionManager.disconnect();
        this.checkLoginStatusChanged();
    }
    async readContract(parameters) {
        return await this.sessionManager.readContract(parameters);
    }
    async writeContract(parameters) {
        if (!this.getWalletAddress())
            throw new Error("Not connected");
        if (this.sessionManager.getWalletAddress() !== this.getWalletAddress()) {
            throw new Error("Wallet address mismatch");
        }
        return await this.sessionManager.writeContract(parameters);
    }
}
export default new WalletLoginManager();
//# sourceMappingURL=WalletLoginManager.js.map