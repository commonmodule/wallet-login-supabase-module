import { Store } from "@common-module/app";
import { AuthTokenManager } from "@common-module/supabase";
declare class WalletLoginManager extends AuthTokenManager<{
    loginStatusChanged: (loggedIn: boolean) => void;
}> {
    protected store: Store<"wallet-login-manager">;
    get loggedInWallet(): string | undefined;
    get loggedInAddress(): string | undefined;
    get isLoggedIn(): boolean;
    addLoginInfo(walletId: string, walletAddress: string, token: string): void;
    logout(): void;
}
declare const _default: WalletLoginManager;
export default _default;
//# sourceMappingURL=WalletLoginManager.d.ts.map