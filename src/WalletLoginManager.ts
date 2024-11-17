import { AuthTokenManager } from "@common-module/supabase";
import { WalletSessionManager } from "@common-module/wallet";
import {
  Config,
  ReadContractParameters,
  WriteContractParameters,
} from "@wagmi/core";
import type { Abi, ContractFunctionArgs, ContractFunctionName } from "viem";
import WalletLoginModal from "./components/WalletLoginModal.js";

class WalletLoginManager extends AuthTokenManager<{
  loginStatusChanged: (loggedIn: boolean) => void;
}> {
  public getLoggedInWallet() {
    return this.store.get<string>("loggedInWallet");
  }
  public getLoggedInAddress() {
    return this.store.get<`0x${string}`>("loggedInAddress");
  }
  public getLoggedInUser() {
    return this.getLoggedInAddress();
  }
  public isLoggedIn() {
    return !!this.token && !!this.getLoggedInWallet() &&
      !!this.getLoggedInAddress();
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

    this.emit("loginStatusChanged", this.isLoggedIn());

    return walletAddress;
  }

  public logout() {
    WalletSessionManager.disconnect();

    this.token = undefined;
    this.store.remove("loggedInWallet");
    this.store.remove("loggedInAddress");

    this.emit("loginStatusChanged", this.isLoggedIn());
  }

  public async getBalance(chainId: number) {
    const walletAddress = this.getLoggedInAddress();
    if (!walletAddress) throw new Error("Not logged in");
    await WalletSessionManager.getBalance(chainId, walletAddress);
  }

  public async readContract<
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, "pure" | "view">,
    args extends ContractFunctionArgs<abi, "pure" | "view", functionName>,
  >(parameters: ReadContractParameters<abi, functionName, args, Config>) {
    return await WalletSessionManager.readContract(parameters);
  }

  public async writeContract<
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, "nonpayable" | "payable">,
    args extends ContractFunctionArgs<
      abi,
      "nonpayable" | "payable",
      functionName
    >,
    chainId extends Config["chains"][number]["id"],
  >(
    parameters: WriteContractParameters<
      abi,
      functionName,
      args,
      Config,
      chainId
    >,
  ) {
    if (!this.getLoggedInAddress()) throw new Error("Not connected");
    if (
      WalletSessionManager.getConnectedAddress() !== this.getLoggedInAddress()
    ) {
      throw new Error("Wallet address mismatch");
    }
    return await WalletSessionManager.writeContract(parameters as any);
  }
}

export default new WalletLoginManager();
