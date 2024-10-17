import { el } from "@common-module/app";
import { Button } from "@common-module/app-components";
import { WalletPopupBase } from "@common-module/wallet";
import WalletLoginContent from "./WalletLoginContent.js";
export default class WalletLoginPopup extends WalletPopupBase {
    resolveLogin;
    rejectLogin;
    constructor(message) {
        super(".wallet-login-popup");
        this
            .on("remove", () => this.rejectLogin?.(new Error("Login canceled by user")))
            .appendToHeader(el("h1", "Login with Crypto Wallet"))
            .appendToMain(new WalletLoginContent(message, () => {
            this.resolveLogin?.();
            this.rejectLogin = undefined;
            this.remove();
        }, (error) => {
            console.error(error);
            this.restoreModal(error.message);
        }, (walletId) => this.temporarilyCloseModal(walletId)))
            .appendToFooter(new Button(".cancel", {
            title: "Cancel",
            onClick: () => this.remove(),
        }));
    }
    async waitForLogin() {
        return new Promise((resolve, reject) => {
            this.resolveLogin = resolve;
            this.rejectLogin = reject;
        });
    }
}
//# sourceMappingURL=WalletLoginPopup.js.map