import { TokenManager } from "@common-module/ts";
declare class WalletTokenManager extends TokenManager {
    private store;
    get token(): string | undefined;
    set token(token: string | undefined);
}
declare const _default: WalletTokenManager;
export default _default;
//# sourceMappingURL=WalletTokenManager.d.ts.map