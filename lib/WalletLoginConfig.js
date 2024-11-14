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
}
export default new WalletLoginConfig();
//# sourceMappingURL=WalletLoginConfig.js.map