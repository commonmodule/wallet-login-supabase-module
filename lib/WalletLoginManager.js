import { AuthTokenManager } from "@common-module/supabase";
import { UniversalWalletConnector } from "@common-module/wallet";
class WalletLoginManager extends AuthTokenManager {
    constructor() {
        super("wallet-login-manager");
    }
    get loggedInWallet() {
        return this.store.get("loggedInWallet");
    }
    get loggedInAddress() {
        return this.store.get("loggedInAddress");
    }
    get isLoggedIn() {
        return !!this.token && !!this.loggedInWallet && !!this.loggedInAddress;
    }
    addLoginInfo(walletId, walletAddress, token) {
        this.token = token;
        this.store.setPermanent("loggedInWallet", walletId);
        this.store.setPermanent("loggedInAddress", walletAddress);
        this.emit("loginStatusChanged", this.isLoggedIn);
    }
    logout() {
        this.token = undefined;
        this.store.remove("loggedInWallet");
        this.store.remove("loggedInAddress");
        this.emit("loginStatusChanged", this.isLoggedIn);
    }
    async getSigner() {
        if (!this.isLoggedIn)
            throw new Error("Not logged in");
        const provider = await UniversalWalletConnector.connect(this.loggedInWallet);
        const accounts = await provider.listAccounts();
        if (accounts.length === 0)
            throw new Error("No accounts found");
        const walletAddress = accounts[0].address;
        if (!this.loggedInAddress || walletAddress !== this.loggedInAddress) {
            throw new Error("Logged in wallet address does not match");
        }
        return await provider.getSigner();
    }
}
export default new WalletLoginManager();
//# sourceMappingURL=WalletLoginManager.js.map