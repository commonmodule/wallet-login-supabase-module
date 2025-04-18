import { AuthTokenManager } from "@commonmodule/app";
import { AppCompConfig, ConfirmDialog } from "@commonmodule/app-components";
import { WalletSessionManager } from "@commonmodule/wallet";
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
    async login() {
        this.logout();
        const { walletId, walletAddress, token } = await new WalletLoginModal()
            .waitForLogin();
        WalletSessionManager.setConnectedWalletInfo(walletId, walletAddress);
        const currentIsLoggedIn = this.isLoggedIn();
        this.token = token;
        this.store.setPermanent("loggedInWallet", walletId);
        this.store.setPermanent("loggedInAddress", walletAddress);
        if (currentIsLoggedIn !== this.isLoggedIn()) {
            this.emit("loginStatusChanged", this.isLoggedIn());
        }
        return walletAddress;
    }
    logout() {
        WalletSessionManager.disconnect();
        const currentIsLoggedIn = this.isLoggedIn();
        this.token = undefined;
        this.store.remove("loggedInWallet");
        this.store.remove("loggedInAddress");
        if (currentIsLoggedIn !== this.isLoggedIn()) {
            this.emit("loginStatusChanged", this.isLoggedIn());
        }
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
    async estimateGas(parameters) {
        return await WalletSessionManager.estimateGas(parameters);
    }
    async writeContract(parameters) {
        if (!this.getLoggedInAddress() || !this.getLoggedInWallet()) {
            this.showLoginDialog();
            throw new Error("Not logged in");
        }
        if (WalletSessionManager.getConnectedAddress() &&
            WalletSessionManager.getConnectedAddress() !== this.getLoggedInAddress()) {
            this.showWalletMismatchDialog();
            throw new Error("Wallet address mismatch");
        }
        return await WalletSessionManager.writeContract(parameters);
    }
    showLoginDialog() {
        new ConfirmDialog(".login-wallet", {
            icon: new AppCompConfig.WarningIcon(),
            title: "Login Required",
            message: "You need to log in with your wallet to execute this transaction. Would you like to log in now?",
            confirmButtonTitle: "Log in",
            onConfirm: () => {
                this.login();
            },
        });
    }
    showWalletMismatchDialog() {
        const currentWalletAddress = WalletSessionManager.getConnectedAddress();
        const requiredWalletAddress = this.getLoggedInAddress();
        new ConfirmDialog(".wallet-mismatch", {
            icon: new AppCompConfig.WarningIcon(),
            title: "Wallet Address Mismatch",
            message: `Your current wallet address (${currentWalletAddress}) differs from the logged-in wallet address (${requiredWalletAddress}). Would you like to log in again with the correct wallet?`,
            confirmButtonTitle: "Log in Again",
            onConfirm: () => {
                this.login();
            },
        });
    }
}
export default new WalletLoginManager();
//# sourceMappingURL=WalletLoginManager.js.map