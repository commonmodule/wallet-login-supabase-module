import { WalletConnectionManager } from "@common-module/wallet";
class WalletLoginManager {
    init(projectId, metadata, networks, siweConfig) {
        WalletConnectionManager.init(projectId, metadata, networks, siweConfig);
    }
}
export default new WalletLoginManager();
//# sourceMappingURL=WalletLoginManager.js.map