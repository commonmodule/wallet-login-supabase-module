import { SupabaseConnector } from "@common-module/supabase";
import { IWalletModuleConfig } from "@common-module/wallet";
declare class WalletLoginConfig {
    messageForWalletLogin: string;
    executeAfterLogin: (token: string) => Promise<void>;
    private _supabaesConnector;
    get supabaseConnector(): SupabaseConnector;
    set supabaseConnector(connector: SupabaseConnector);
    init(options: IWalletModuleConfig & {
        supabaseConnector: SupabaseConnector;
    }): void;
}
declare const _default: WalletLoginConfig;
export default _default;
//# sourceMappingURL=WalletLoginConfig.d.ts.map