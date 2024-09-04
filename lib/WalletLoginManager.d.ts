import { EventContainer } from "@common-module/ts";
declare class WalletLoginManager extends EventContainer<{
    loginStatusChanged: () => void;
}> {
    get loggedIn(): boolean;
    login(): Promise<void>;
    logout(): void;
}
declare const _default: WalletLoginManager;
export default _default;
//# sourceMappingURL=WalletLoginManager.d.ts.map