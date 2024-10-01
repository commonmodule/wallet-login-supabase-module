import { BodyNode, el, View } from "@common-module/app";
import WalletLoginContent from "../components/WalletLoginContent.js";
export default class WalletLoginView extends View {
    constructor() {
        super();
        this.container = el(".wallet-login-view", el("h1", "Login with Crypto Wallet"), new WalletLoginContent(message, (walletId) => this.temporarilyCloseModal(walletId), (result) => {
            this.resolveLogin?.(result);
            this.remove();
        }, (error) => {
            console.error(error);
            this.restoreModal(error.message);
        })).appendTo(BodyNode);
    }
}
//# sourceMappingURL=WalletLoginView.js.map