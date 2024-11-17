import { AuthTokenManager } from "@common-module/supabase";
import { WalletSessionManager } from "@common-module/wallet";
import WalletLoginModal from "./components/WalletLoginModal.js";
class WalletLoginManager extends AuthTokenManager {
    getLoggedInWallet() {
        return this.store.get("loggedInWallet");
    }
    getLoggedInAddress() {
        return this.store.get("loggedInAddress");
    }
    getLoggedInUser() {
        return this.getLoggedInAddress();
    }
    isLoggedIn() {
        return !!this.token && !!this.getLoggedInWallet() &&
            !!this.getLoggedInAddress();
    }
    constructor() {
        super("wallet-login-manager");
    }
    init() {
        WalletSessionManager.init();
    }
    async login() {
        const { walletId, walletAddress, token } = await new WalletLoginModal()
            .waitForLogin();
        this.token = token;
        this.store.setPermanent("loggedInWallet", walletId);
        this.store.setPermanent("loggedInAddress", walletAddress);
        this.emit("loginStatusChanged", this.isLoggedIn());
        return walletAddress;
    }
    logout() {
        WalletSessionManager.disconnect();
        this.token = undefined;
        this.store.remove("loggedInWallet");
        this.store.remove("loggedInAddress");
        this.emit("loginStatusChanged", this.isLoggedIn());
    }
    async getBalance(chainId) {
        const walletAddress = this.getLoggedInAddress();
        if (!walletAddress)
            throw new Error("Not logged in");
        await WalletSessionManager.getBalance(chainId, walletAddress);
    }
    async readContract(parameters) {
        return await WalletSessionManager.readContract(parameters);
    }
    async writeContract(parameters) {
        if (!this.getLoggedInAddress())
            throw new Error("Not connected");
        if (WalletSessionManager.getConnectedAddress() !== this.getLoggedInAddress()) {
            throw new Error("Wallet address mismatch");
        }
        return await WalletSessionManager.writeContract(parameters);
    }
}
export default new WalletLoginManager();
//# sourceMappingURL=WalletLoginManager.js.map