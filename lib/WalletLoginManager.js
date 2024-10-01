import { Store } from "@common-module/app";
import { AuthTokenManager } from "@common-module/supabase";
import { WalletConnectionManager } from "@common-module/wallet";
class WalletLoginManager extends AuthTokenManager {
    store = new Store("wallet-login-manager");
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
        WalletConnectionManager.disconnect();
        this.emit("loginStatusChanged", this.isLoggedIn);
    }
}
export default new WalletLoginManager();
//# sourceMappingURL=WalletLoginManager.js.map