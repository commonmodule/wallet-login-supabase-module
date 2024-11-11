import { AuthTokenManager } from "@common-module/supabase";
import { UniversalWalletConnector } from "@common-module/wallet";
import { JsonRpcSigner } from "ethers";
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
    get loggedInUser() {
        return this.loggedInAddress;
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
        UniversalWalletConnector.disconnectAll();
        this.token = undefined;
        this.store.remove("loggedInWallet");
        this.store.remove("loggedInAddress");
        this.emit("loginStatusChanged", this.isLoggedIn);
    }
    async getSigner() {
        if (!this.isLoggedIn)
            throw new Error("Not logged in");
        const walletAddress = await UniversalWalletConnector.connect(this.loggedInWallet);
        if (walletAddress === undefined)
            throw new Error("No accounts found");
        if (!this.loggedInAddress || walletAddress !== this.loggedInAddress) {
            throw new Error("Logged in wallet address does not match");
        }
        const provider = UniversalWalletConnector.getProvider(this.loggedInWallet);
        return new JsonRpcSigner(provider, walletAddress);
    }
}
export default new WalletLoginManager();
//# sourceMappingURL=WalletLoginManager.js.map