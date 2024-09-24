import { AuthTokenManager } from "@common-module/supabase";
declare class WalletTokenManager extends AuthTokenManager {
    private store;
    get token(): string | undefined;
    set token(token: string | undefined);
}
declare const _default: WalletTokenManager;
export default _default;
//# sourceMappingURL=WalletTokenManager.d.ts.map