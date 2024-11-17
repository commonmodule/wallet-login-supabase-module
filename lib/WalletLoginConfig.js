import { WalletModuleConfig } from "@common-module/wallet";
class WalletLoginConfig {
    messageForWalletLogin = "Login with Crypto Wallet";
    executeAfterLogin = async (token) => { };
    _supabaesConnector;
    get supabaseConnector() {
        if (!this._supabaesConnector)
            throw new Error("Supabase connector not set");
        return this._supabaesConnector;
    }
    set supabaseConnector(connector) {
        this._supabaesConnector = connector;
    }
    init(options) {
        this.supabaseConnector = options.supabaseConnector;
        WalletModuleConfig.init(options);
    }
}
export default new WalletLoginConfig();
//# sourceMappingURL=WalletLoginConfig.js.map