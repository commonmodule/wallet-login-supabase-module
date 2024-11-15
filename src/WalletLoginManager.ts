import { WalletConnectionManager } from "@common-module/wallet";
import { Metadata } from "@reown/appkit";
import { AppKitSIWEClient } from "@reown/appkit-siwe";
import { AppKitNetwork } from "@reown/appkit/networks";

class WalletLoginManager {
  public init(
    projectId: string,
    metadata: Metadata,
    networks: [AppKitNetwork, ...AppKitNetwork[]],
    siweConfig: AppKitSIWEClient,
  ) {
    WalletConnectionManager.init(projectId, metadata, networks, siweConfig);
  }
}

export default new WalletLoginManager();
