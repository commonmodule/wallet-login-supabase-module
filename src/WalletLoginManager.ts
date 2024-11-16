import { AuthTokenManager } from "@common-module/supabase";
import { WalletSessionManager } from "@common-module/wallet";
import { Metadata } from "@reown/appkit";
import {
  AppKitSIWEClient,
  createSIWEConfig,
  formatMessage,
  type SIWECreateMessageArgs,
} from "@reown/appkit-siwe";
import { AppKitNetwork } from "@reown/appkit/networks";
import {
  Config,
  ReadContractParameters,
  WriteContractParameters,
} from "@wagmi/core";
import type { Abi, ContractFunctionArgs, ContractFunctionName } from "viem";
import WalletLoginConfig from "./WalletLoginConfig.js";

interface WalletLoginConfig {
  projectId: string;
  metadata: Metadata;
  networks: [AppKitNetwork, ...AppKitNetwork[]];
}

class WalletLoginManager extends AuthTokenManager<{
  loginStatusChanged: (loggedIn: boolean) => void;
}> {
  public getWalletAddress() {
    return this.store.get<string>("walletAddress");
  }
  public get isLoggedIn() {
    return !!this.token && !!this.getWalletAddress();
  }

  private siweConfig: AppKitSIWEClient | undefined;
  private getSiewConfig() {
    if (!this.siweConfig) throw new Error("SIWE config not initialized");
    return this.siweConfig;
  }

  constructor() {
    super("wallet-login-manager");
  }

  public init(options: WalletLoginConfig) {
    WalletSessionManager.init({
      ...options,
      siweConfig: createSIWEConfig({
        getMessageParams: async () => ({
          domain: window.location.host,
          uri: window.location.origin,
          chains: options.networks.filter((n) => typeof n.id === "number").map((
            n,
          ) => n.id as number),
          statement: WalletLoginConfig.messageForWalletLogin,
        }),
        createMessage: ({ address, ...args }: SIWECreateMessageArgs) =>
          formatMessage(args, address),
        getNonce: async (walletAddress) => {
          const { nonce } = await WalletLoginConfig.supabaseConnector
            .callEdgeFunction<{ nonce: string; issuedAt: string }>(
              "generate-wallet-login-nonce",
              {
                walletAddress,
                domain: window.location.host,
                uri: window.location.origin,
              },
            );
          return nonce;
        },
        getSession: async () => {
          throw new Error("Not implemented");
        },
        verifyMessage: async ({ message, signature }) => {
          throw new Error("Not implemented");
        },
        signOut: async () => true,
      }),
    });
  }

  public openWallet() {
    WalletSessionManager.openWallet();
  }

  public async login() {
    await this.getSiewConfig().signIn();
  }

  public async logout() {
    await this.getSiewConfig().signOut();
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
    if (!this.getWalletAddress()) throw new Error("Not connected");
    if (WalletSessionManager.getWalletAddress() !== this.getWalletAddress()) {
      throw new Error("Wallet address mismatch");
    }
    return await WalletSessionManager.writeContract(parameters);
  }
}

export default new WalletLoginManager();
