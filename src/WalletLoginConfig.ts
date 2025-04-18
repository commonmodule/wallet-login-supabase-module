import { SupabaseConnector } from "@commonmodule/supabase";
import { IWalletModuleConfig, WalletModuleConfig } from "@commonmodule/wallet";

class WalletLoginConfig {
  public messageForWalletLogin = "Login with Crypto Wallet";
  public executeAfterLogin = async (token: string) => {};

  private _supabaesConnector: SupabaseConnector | undefined;
  public get supabaseConnector() {
    if (!this._supabaesConnector) throw new Error("Supabase connector not set");
    return this._supabaesConnector;
  }
  public set supabaseConnector(connector: SupabaseConnector) {
    this._supabaesConnector = connector;
  }

  public init(
    options: IWalletModuleConfig & { supabaseConnector: SupabaseConnector },
  ) {
    this.supabaseConnector = options.supabaseConnector;

    WalletModuleConfig.init(options);
  }
}

export default new WalletLoginConfig();
