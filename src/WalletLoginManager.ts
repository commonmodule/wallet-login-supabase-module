import { AuthTokenManager } from "@commonmodule/app";
import { AppCompConfig, ConfirmDialog } from "@commonmodule/app-components";
import { WalletSessionManager } from "@commonmodule/wallet";
import {
  Config,
  EstimateGasParameters,
  ReadContractParameters,
  WriteContractParameters,
} from "@wagmi/core";
import type {
  Abi,
  ContractFunctionArgs,
  ContractFunctionName,
  DecodeEventLogReturnType,
} from "viem";
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

  public async login() {
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

  public logout() {
    WalletSessionManager.disconnect();

    const currentIsLoggedIn = this.isLoggedIn();

    this.token = undefined;
    this.store.remove("loggedInWallet");
    this.store.remove("loggedInAddress");

    if (currentIsLoggedIn !== this.isLoggedIn()) {
      this.emit("loginStatusChanged", this.isLoggedIn());
    }
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
    return await WalletSessionManager.readContract(parameters as any);
  }

  public async estimateGas<chainId extends Config["chains"][number]["id"]>(
    parameters: EstimateGasParameters<Config, chainId>,
  ) {
    return await WalletSessionManager.estimateGas(parameters as any);
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
  ): Promise<DecodeEventLogReturnType[]> {
    if (!this.getLoggedInAddress() || !this.getLoggedInWallet()) {
      this.showLoginDialog();
      throw new Error("Not logged in");
    }

    if (
      WalletSessionManager.getConnectedAddress() &&
      WalletSessionManager.getConnectedAddress() !== this.getLoggedInAddress()
    ) {
      this.showWalletMismatchDialog();
      throw new Error("Wallet address mismatch");
    }

    return await WalletSessionManager.writeContract(parameters as any);
  }

  private showLoginDialog() {
    new ConfirmDialog(".login-wallet", {
      icon: new AppCompConfig.WarningIcon(),
      title: "Login Required",
      message:
        "You need to log in with your wallet to execute this transaction. Would you like to log in now?",
      confirmButtonTitle: "Log in",
      onConfirm: () => {
        this.login();
      },
    });
  }

  private showWalletMismatchDialog() {
    const currentWalletAddress = WalletSessionManager.getConnectedAddress();
    const requiredWalletAddress = this.getLoggedInAddress();

    new ConfirmDialog(".wallet-mismatch", {
      icon: new AppCompConfig.WarningIcon(),
      title: "Wallet Address Mismatch",
      message:
        `Your current wallet address (${currentWalletAddress}) differs from the logged-in wallet address (${requiredWalletAddress}). Would you like to log in again with the correct wallet?`,
      confirmButtonTitle: "Log in Again",
      onConfirm: () => {
        this.login();
      },
    });
  }
}

export default new WalletLoginManager();
