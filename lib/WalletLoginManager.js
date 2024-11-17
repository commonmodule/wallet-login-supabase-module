import { AuthTokenManager } from "@common-module/supabase";
import { WalletSessionManager } from "@common-module/wallet";
import WalletLoginModal from "./components/WalletLoginModal.js";
class WalletLoginManager extends AuthTokenManager {
    get loggedInWallet() {
        return this.store.get("loggedInWallet");
    }
    get loggedInAddress() {
        return this.store.get("loggedInAddress");
    }
    get loggedInUser() {
        return this.loggedInAddress;
    }
    get isLoggedIn() {
        return !!this.token && !!this.loggedInWallet && !!this.loggedInAddress;
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
        this.emit("loginStatusChanged", this.isLoggedIn);
        return walletAddress;
    }
    logout() {
        WalletSessionManager.disconnect();
        this.token = undefined;
        this.store.remove("loggedInWallet");
        this.store.remove("loggedInAddress");
        this.emit("loginStatusChanged", this.isLoggedIn);
    }
}
export default new WalletLoginManager();
//# sourceMappingURL=WalletLoginManager.js.map