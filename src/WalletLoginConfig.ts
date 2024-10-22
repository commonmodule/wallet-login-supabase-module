import { SupabaseConnector } from "@common-module/supabase";

class WalletLoginConfig {
  public messageForWalletLogin = "Login with Crypto Wallet";

  private _supabaesConnector: SupabaseConnector | undefined;

  public get supabaseConnector() {
    if (!this._supabaesConnector) throw new Error("Supabase connector not set");
    return this._supabaesConnector;
  }

  public set supabaseConnector(connector: SupabaseConnector) {
    this._supabaesConnector = connector;
  }
}

export default new WalletLoginConfig();
