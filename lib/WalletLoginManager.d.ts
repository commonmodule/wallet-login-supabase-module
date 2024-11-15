import { Metadata } from "@reown/appkit";
import { AppKitSIWEClient } from "@reown/appkit-siwe";
import { AppKitNetwork } from "@reown/appkit/networks";
declare class WalletLoginManager {
    init(projectId: string, metadata: Metadata, networks: [AppKitNetwork, ...AppKitNetwork[]], siweConfig: AppKitSIWEClient): void;
}
declare const _default: WalletLoginManager;
export default _default;
//# sourceMappingURL=WalletLoginManager.d.ts.map