import { AuthTokenManager } from "@common-module/supabase";
import { Metadata } from "@reown/appkit";
import { AppKitNetwork } from "@reown/appkit/networks";
import { Config, ReadContractParameters, WriteContractParameters } from "@wagmi/core";
import type { Abi, ContractFunctionArgs, ContractFunctionName } from "viem";
import WalletLoginConfig from "./WalletLoginConfig.js";
interface WalletLoginConfig {
    projectId: string;
    metadata: Metadata;
    networks: [AppKitNetwork, ...AppKitNetwork[]];
}
declare class WalletLoginManager extends AuthTokenManager<{
    loginStatusChanged: (loggedIn: boolean) => void;
}> {
    getWalletAddress(): string | undefined;
    get isLoggedIn(): boolean;
    private siweConfig;
    private getSiewConfig;
    constructor();
    init(options: WalletLoginConfig): void;
    openWallet(): void;
    login(): Promise<void>;
    logout(): Promise<void>;
    readContract<const abi extends Abi | readonly unknown[], functionName extends ContractFunctionName<abi, "pure" | "view">, args extends ContractFunctionArgs<abi, "pure" | "view", functionName>>(parameters: ReadContractParameters<abi, functionName, args, Config>): Promise<import("viem").ContractFunctionReturnType<abi, "pure" | "view", functionName, args>>;
    writeContract<const abi extends Abi | readonly unknown[], functionName extends ContractFunctionName<abi, "nonpayable" | "payable">, args extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>, chainId extends Config["chains"][number]["id"]>(parameters: WriteContractParameters<abi, functionName, args, Config, chainId>): Promise<`0x${string}`>;
}
declare const _default: WalletLoginManager;
export default _default;
//# sourceMappingURL=WalletLoginManager.d.ts.map