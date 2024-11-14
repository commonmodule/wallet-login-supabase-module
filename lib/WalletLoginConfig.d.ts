import { SupabaseConnector } from "@common-module/supabase";
declare class WalletLoginConfig {
    messageForWalletLogin: string;
    executeAfterLogin: (token: string) => Promise<void>;
    private _supabaesConnector;
    get supabaseConnector(): SupabaseConnector;
    set supabaseConnector(connector: SupabaseConnector);
}
declare const _default: WalletLoginConfig;
export default _default;
//# sourceMappingURL=WalletLoginConfig.d.ts.map