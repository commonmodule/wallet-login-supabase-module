import { DomNode } from "@common-module/app";
import { SupabaseConnector } from "@common-module/supabase";

type DomNodeConstructor = new () => DomNode;

class DefaultNoteIcon extends DomNode {
  constructor() {
    super("span.icon.edit", "📝");
  }
}

class WalletLoginConfig {
  public NoteIcon: DomNodeConstructor = DefaultNoteIcon;

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
}

export default new WalletLoginConfig();
