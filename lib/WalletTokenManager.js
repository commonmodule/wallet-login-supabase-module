import { Store } from "@common-module/app";
import { AuthTokenManager } from "@common-module/supabase";
class WalletTokenManager extends AuthTokenManager {
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