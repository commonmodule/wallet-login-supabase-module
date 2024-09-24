import { Store } from "@common-module/app";
import { AuthTokenManager } from "@common-module/supabase";

class WalletTokenManager extends AuthTokenManager {
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
