import { AuthTokenManager } from "@common-module/supabase";
import { UniversalWalletConnector } from "@common-module/wallet";
import { JsonRpcSigner } from "ethers";

class WalletLoginManager extends AuthTokenManager<{
  loginStatusChanged: (loggedIn: boolean) => void;
}> {
  constructor() {
    super("wallet-login-manager");
  }

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

  public addLoginInfo(walletId: string, walletAddress: string, token: string) {
    this.token = token;

    this.store.setPermanent("loggedInWallet", walletId);
    this.store.setPermanent("loggedInAddress", walletAddress);

    this.emit("loginStatusChanged", this.isLoggedIn);
  }

  public logout(): void {
    if (this.loggedInWallet) {
      UniversalWalletConnector.disconnect(this.loggedInWallet);
    }

    this.token = undefined;

    this.store.remove("loggedInWallet");
    this.store.remove("loggedInAddress");

    this.emit("loginStatusChanged", this.isLoggedIn);
  }

  public async getSigner(): Promise<JsonRpcSigner> {
    if (!this.isLoggedIn) throw new Error("Not logged in");

    const provider = await UniversalWalletConnector.connect(
      this.loggedInWallet!,
    );

    const accounts = await provider.listAccounts();
    if (accounts.length === 0) throw new Error("No accounts found");
    const walletAddress = accounts[0].address;

    if (!this.loggedInAddress || walletAddress !== this.loggedInAddress) {
      throw new Error("Logged in wallet address does not match");
    }

    return await provider.getSigner();
  }
}

export default new WalletLoginManager();
