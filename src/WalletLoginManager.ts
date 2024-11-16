import { AuthTokenManager } from "@common-module/supabase";
import { WalletSessionManager } from "@common-module/wallet";
import { createAppKit, Metadata } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
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
  private sessionManager!: WalletSessionManager;

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
    this.siweConfig = createSIWEConfig({
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
      getNonce: () =>
        WalletLoginConfig.supabaseConnector.callEdgeFunction<string>(
          "siwe/nonce",
        ),
      verifyMessage: async ({ message, signature }) => {
        const token = await WalletLoginConfig.supabaseConnector
          .callEdgeFunction<string>(
            "siwe/verify",
            {
              message,
              signature,
              projectId: options.projectId,
            },
          );
        this.token = token;
        return true;
      },
      getSession: async () => {
        const result = await WalletLoginConfig.supabaseConnector
          .callEdgeFunction<{ address: string; chainId: number }>(
            "siwe/session",
          );
        return (result.address && result.chainId) ? result : null;
      },
      signOut: async () => true,
    });

    const wagmiAdapter = new WagmiAdapter(options);

    this.sessionManager = new WalletSessionManager(createAppKit({
      ...options,
      adapters: [wagmiAdapter],
      siweConfig: this.siweConfig,
    }));
  }

  public openWallet() {
    this.sessionManager.openWallet();
  }

  public async login() {
    await this.getSiewConfig().signIn();
  }

  public async logout() {
    this.token = undefined;
    const result = await this.getSiewConfig().signOut();
    console.log(result);
  }

  public async readContract<
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, "pure" | "view">,
    args extends ContractFunctionArgs<abi, "pure" | "view", functionName>,
  >(parameters: ReadContractParameters<abi, functionName, args, Config>) {
    return await this.sessionManager.readContract(parameters as any);
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
    if (this.sessionManager.getWalletAddress() !== this.getWalletAddress()) {
      throw new Error("Wallet address mismatch");
    }
    return await this.sessionManager.writeContract(parameters as any);
  }
}

export default new WalletLoginManager();
