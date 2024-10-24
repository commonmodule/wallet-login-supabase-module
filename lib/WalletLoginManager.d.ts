import { AuthTokenManager } from "@common-module/supabase";
import { JsonRpcSigner } from "ethers";
declare class WalletLoginManager extends AuthTokenManager<{
    loginStatusChanged: (loggedIn: boolean) => void;
}> {
    constructor();
    get loggedInWallet(): string | undefined;
    get loggedInAddress(): string | undefined;
    get loggedInUser(): string | undefined;
    get isLoggedIn(): boolean;
    addLoginInfo(walletId: string, walletAddress: string, token: string): void;
    logout(): void;
    getSigner(): Promise<JsonRpcSigner>;
}
declare const _default: WalletLoginManager;
export default _default;
//# sourceMappingURL=WalletLoginManager.d.ts.map