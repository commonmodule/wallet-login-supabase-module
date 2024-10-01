import { WalletPopupBase } from "@common-module/wallet";
export default class WalletLoginPopup extends WalletPopupBase {
    private resolveLogin;
    private rejectLogin;
    constructor(message: string);
    waitForLogin(): Promise<void>;
}
//# sourceMappingURL=WalletLoginPopup.d.ts.map