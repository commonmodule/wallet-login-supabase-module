import { DomNode } from "@common-module/app";
export default class WalletLoginContent extends DomNode {
    private onLoggedIn;
    private onError;
    private onBeforeLogin?;
    constructor(onLoggedIn: () => void, onError: (error: Error) => void, onBeforeLogin?: ((walletId: string) => void) | undefined);
    private handleLogin;
}
//# sourceMappingURL=WalletLoginContent.d.ts.map