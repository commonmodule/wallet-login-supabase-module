import { Modal } from "@common-module/app-components";
export default class WalletLoginPopup extends Modal {
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