import { EventContainer } from "@common-module/ts";
import { WalletConnectionManager } from "@common-module/wallet";
import WalletLoginPopup from "./WalletLoginPopup.js";
import WalletTokenManager from "./WalletTokenManager.js";
class WalletLoginManager extends EventContainer {
    get loggedIn() {
        return WalletTokenManager.token !== undefined &&
            WalletConnectionManager.connectedAddress !== undefined &&
            WalletConnectionManager.connectedWallet !== undefined;
    }
    async login() {
        const { walletId, walletAddress } = await new WalletLoginPopup().wait();
        console.log(walletId, walletAddress);
    }
    logout() {
        console.log("logout");
    }
}
export default new WalletLoginManager();
//# sourceMappingURL=WalletLoginManager.js.map