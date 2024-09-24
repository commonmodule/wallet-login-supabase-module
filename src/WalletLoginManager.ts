import { Store } from "@common-module/app";
import { AuthTokenManager } from "@common-module/supabase";
import { WalletConnectionManager } from "@common-module/wallet";
import WalletLoginPopup from "./WalletLoginPopup.js";

class WalletLoginManager extends AuthTokenManager<{
  loginStatusChanged: (loggedIn: boolean) => void;
}> {
  protected store = new Store("wallet-login-manager");

  public get loggedInWallet() {
    return this.store.get<string>("loggedInWallet");
  }

  public get loggedInAddress() {
    return this.store.get<string>("loggedInAddress");
  }

  public get isLoggedIn() {
    return !!this.token && !!this.loggedInWallet && !!this.loggedInAddress;
  }

  public async login(message: string): Promise<void> {
    const { walletId, walletAddress, token } = await new WalletLoginPopup(
      message,
    ).waitForLogin();

    this.token = token;
    this.store.set("loggedInWallet", walletId);
    this.store.set("loggedInAddress", walletAddress);

    this.emit("loginStatusChanged", this.isLoggedIn);
  }

  public logout(): void {
    this.token = undefined;
    this.store.remove("loggedInWallet");
    this.store.remove("loggedInAddress");

    WalletConnectionManager.disconnect();
    this.emit("loginStatusChanged", this.isLoggedIn);
  }
}

export default new WalletLoginManager();
