import { AuthTokenManager } from "@common-module/supabase";
import { WalletSessionManager } from "@common-module/wallet";
import WalletLoginModal from "./components/WalletLoginModal.js";

class WalletLoginManager extends AuthTokenManager<{
  loginStatusChanged: (loggedIn: boolean) => void;
}> {
  public get loggedInWallet() {
    return this.store.get<string>("loggedInWallet");
  }
  public get loggedInAddress() {
    return this.store.get<string>("loggedInAddress");
  }
  public get loggedInUser() {
    return this.loggedInAddress;
  }
  public get isLoggedIn() {
    return !!this.token && !!this.loggedInWallet && !!this.loggedInAddress;
  }

  constructor() {
    super("wallet-login-manager");
  }

  public init() {
    WalletSessionManager.init();
  }

  public async login() {
    const { walletId, walletAddress, token } = await new WalletLoginModal()
      .waitForLogin();

    this.token = token;
    this.store.setPermanent("loggedInWallet", walletId);
    this.store.setPermanent("loggedInAddress", walletAddress);

    this.emit("loginStatusChanged", this.isLoggedIn);
  }

  public logout() {
    WalletSessionManager.disconnect();

    this.token = undefined;
    this.store.remove("loggedInWallet");
    this.store.remove("loggedInAddress");

    this.emit("loginStatusChanged", this.isLoggedIn);
  }
}

export default new WalletLoginManager();
