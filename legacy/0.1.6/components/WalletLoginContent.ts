import { DomNode, el } from "@common-module/app";
import {
  Button,
  ButtonGroup,
  ButtonType,
  ConfirmDialog,
  InfoAlert,
} from "@common-module/app-components";
import {
  CoinbaseWalletLogo,
  MetaMaskLogo,
  UniversalWalletConnector,
  WalletConnectLogo,
} from "@common-module/wallet";
import { JsonRpcSigner } from "ethers";
import { SiweMessage } from "siwe";
import WalletLoginConfig from "../WalletLoginConfig.js";
import WalletLoginManager from "../WalletLoginManager.js";

export default class WalletLoginContent extends DomNode {
  constructor(
    private onLoggedIn: () => void,
    private onError: (error: Error) => void,
    private onBeforeLogin?: (walletId: string) => void,
  ) {
    super(".wallet-login-content");

    this.append(
      el(
        "section",
        el("h2", "WalletConnect - Recommended"),
        new ButtonGroup(
          new Button({
            type: ButtonType.Outlined,
            icon: new WalletConnectLogo(".icon"),
            title: "Login with WalletConnect",
            onClick: () => this.handleLogin("walletconnect"),
          }),
        ),
      ),
      el(
        "section",
        el("h2", "Direct Login"),
        el(
          "p",
          "These options are available when WalletConnect is not working properly. Direct login requires re-authentication each time you start the app, which may be less convenient compared to WalletConnect.",
        ),
        new ButtonGroup(
          new Button({
            type: ButtonType.Outlined,
            icon: new MetaMaskLogo(".icon"),
            title: "Login with MetaMask",
            onClick: () => this.handleLogin("metamask"),
          }),
          new Button({
            type: ButtonType.Outlined,
            icon: new CoinbaseWalletLogo(".icon"),
            title: "Login with Coinbase Wallet",
            onClick: () => this.handleLogin("coinbase-wallet"),
          }),
        ),
      ),
    );

    UniversalWalletConnector.disconnectAll();
  }

  private async handleLogin(walletId: string) {
    try {
      if (this.onBeforeLogin) this.onBeforeLogin(walletId);

      const walletAddress = await UniversalWalletConnector.connect(walletId);
      if (walletAddress === undefined) throw new Error("No accounts found");

      const { nonce, issuedAt } = await WalletLoginConfig.supabaseConnector
        .callEdgeFunction<{ nonce: string; issuedAt: string }>(
          "generate-wallet-login-nonce",
          {
            walletAddress,
            domain: window.location.host,
            uri: window.location.origin,
          },
        );

      await new ConfirmDialog(".sign-message", {
        title: "Sign Message",
        message: [
          "To complete the login process, please sign the message in your wallet. This signature verifies your ownership of the wallet address.",
          new InfoAlert(
            "No gas fees will be charged for this signature request.",
          ),
        ],
        confirmButtonTitle: "Sign Message",
      }).waitForConfirmation();

      const message = new SiweMessage({
        domain: window.location.host,
        address: walletAddress,
        statement: WalletLoginConfig.messageForWalletLogin,
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce,
        issuedAt,
      });

      const provider = UniversalWalletConnector.getConnectedProvider(walletId);
      if (!provider) throw new Error("Provider not found");

      const signer = new JsonRpcSigner(provider, walletAddress);
      const signedMessage = await signer.signMessage(message.prepareMessage());

      const token = await WalletLoginConfig.supabaseConnector.callEdgeFunction<
        string
      >("wallet-login", { walletAddress, signedMessage });

      await WalletLoginConfig.executeAfterLogin(token);

      WalletLoginManager.addLoginInfo(walletId, walletAddress, token);

      this.onLoggedIn();
    } catch (error) {
      console.error(error);
      this.onError(
        error instanceof Error ? error : new Error("Unknown error occurred"),
      );
    }
  }
}
