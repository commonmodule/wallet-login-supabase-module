import { AuthTokenManager } from "@common-module/supabase";
declare class WalletLoginManager extends AuthTokenManager<{
    loginStatusChanged: (loggedIn: boolean) => void;
}> {
    get loggedInWallet(): string | undefined;
    get loggedInAddress(): string | undefined;
    get loggedInUser(): string | undefined;
    get isLoggedIn(): boolean;
    constructor();
    init(): void;
    login(): Promise<string>;
    logout(): void;
}
declare const _default: WalletLoginManager;
export default _default;
//# sourceMappingURL=WalletLoginManager.d.ts.map