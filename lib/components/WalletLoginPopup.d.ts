import { WalletPopupBase } from "@common-module/wallet";
export default class WalletLoginPopup extends WalletPopupBase {
    private message;
    private resolveLogin;
    private rejectLogin;
    constructor(message: string);
    private handleLogin;
    waitForLogin(): Promise<{
        walletId: string;
        walletAddress: string;
        token: string;
    }>;
}
//# sourceMappingURL=WalletLoginPopup.d.ts.map