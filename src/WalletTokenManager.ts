import { TokenManager } from "@common-module/ts";
import { Store } from "../../app-module/lib/index.js";

class WalletTokenManager extends TokenManager {
  private store = new Store("wallet-token-manager");

  public get token(): string | undefined {
    return this.store.get("token");
  }

  public set token(token: string | undefined) {
    token ? this.store.set("token", token) : this.store.remove("token");
    this.emit("tokenChanged", token);
  }
}

export default new WalletTokenManager();
