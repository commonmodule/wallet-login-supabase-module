import { AuthTokenManager } from "@commonmodule/app";
import { Config, EstimateGasParameters, ReadContractParameters, WriteContractParameters } from "@wagmi/core";
import type { Abi, ContractFunctionArgs, ContractFunctionName, DecodeEventLogReturnType } from "viem";
declare class WalletLoginManager extends AuthTokenManager<{
    loginStatusChanged: (loggedIn: boolean) => void;
}> {
    getLoggedInWallet(): string | undefined;
    getLoggedInAddress(): `0x${string}` | undefined;
    getLoggedInUser(): `0x${string}` | undefined;
    isLoggedIn(): boolean;
    constructor();
    login(): Promise<`0x${string}`>;
    logout(): void;
    getBalance(chainId: number): Promise<void>;
    readContract<const abi extends Abi | readonly unknown[], functionName extends ContractFunctionName<abi, "pure" | "view">, args extends ContractFunctionArgs<abi, "pure" | "view", functionName>>(parameters: ReadContractParameters<abi, functionName, args, Config>): Promise<unknown>;
    estimateGas<chainId extends Config["chains"][number]["id"]>(parameters: EstimateGasParameters<Config, chainId>): Promise<bigint>;
    writeContract<const abi extends Abi | readonly unknown[], functionName extends ContractFunctionName<abi, "nonpayable" | "payable">, args extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>, chainId extends Config["chains"][number]["id"]>(parameters: WriteContractParameters<abi, functionName, args, Config, chainId>): Promise<DecodeEventLogReturnType[]>;
    private showLoginDialog;
    private showWalletMismatchDialog;
}
declare const _default: WalletLoginManager;
export default _default;
//# sourceMappingURL=WalletLoginManager.d.ts.map