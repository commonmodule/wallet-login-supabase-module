import { DomNode } from "@common-module/app";
import { SupabaseConnector } from "@common-module/supabase";
type DomNodeConstructor = new () => DomNode;
declare class WalletLoginConfig {
    NoteIcon: DomNodeConstructor;
    messageForWalletLogin: string;
    executeAfterLogin: (token: string) => Promise<void>;
    private _supabaesConnector;
    get supabaseConnector(): SupabaseConnector;
    set supabaseConnector(connector: SupabaseConnector);
}
declare const _default: WalletLoginConfig;
export default _default;
//# sourceMappingURL=WalletLoginConfig.d.ts.map