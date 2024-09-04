import { TokenManager } from "@common-module/ts";
import { Store } from "../../app-module/lib/index.js";
class WalletTokenManager extends TokenManager {
    store = new Store("wallet-token-manager");
    get token() {
        return this.store.get("token");
    }
    set token(token) {
        token ? this.store.set("token", token) : this.store.remove("token");
        this.emit("tokenChanged", token);
    }
}
export default new WalletTokenManager();
//# sourceMappingURL=WalletTokenManager.js.map