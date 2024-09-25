import { el } from "@common-module/app";
import {
  Button,
  ButtonType,
  StructuredModal,
} from "@common-module/app-components";
import { SupabaseConnector } from "@common-module/supabase";
import { UniversalWalletConnector } from "@common-module/wallet";

export default class WalletLoginPopup extends StructuredModal {
  private resolveLogin:
    | ((
      result: { walletId: string; walletAddress: string; token: string },
    ) => void)
    | undefined;
  private rejectLogin: ((reason: Error) => void) | undefined;

  constructor(private message: string) {
    super(".wallet-login-popup");
    this
      .appendToHeader(el("h1", "Login with Crypto Wallet"))
      .appendToMain(
        el(
          "section",
          el("h2", "WalletConnect - Recommended"),
          new Button({
            type: ButtonType.Contained,
            icon: el("img", { src: "/images/wallet-icons/walletconnect.svg" }),
            title: "Login with WalletConnect",
            onClick: () => this.handleLogin("walletconnect"),
          }),
        ),
        el(
          "section",
          el("h2", "Direct Login"),
          el(
            "p",
            "These options are available when WalletConnect is not working properly. Direct login requires re-authentication each time you start the app, which may be less convenient compared to WalletConnect.",
          ),
          new Button({
            type: ButtonType.Contained,
            icon: el("img", { src: "/images/wallet-icons/metamask.svg" }),
            title: "Login with MetaMask",
            onClick: () => this.handleLogin("metamask"),
          }),
          new Button({
            type: ButtonType.Contained,
            icon: el("img", {
              src: "/images/wallet-icons/coinbase-wallet.svg",
            }),
            title: "Login with Coinbase Wallet",
            onClick: () => this.handleLogin("coinbase-wallet"),
          }),
        ),
      )
      .appendToFooter(
        new Button(".cancel", {
          title: "Cancel",
          onClick: () => this.remove(),
        }),
      )
      .on(
        "remove",
        () => this.rejectLogin?.(new Error("Login canceled by user")),
      );
  }

  private async handleLogin(walletId: string) {
    // Temporarily close the popup while the wallet connection process is underway.
    if (UniversalWalletConnector.checkDisplayMode(walletId) === "modal") {
      this.offDom("close", this.closeListener).htmlElement.close();
    }

    try {
      const walletAddress = await UniversalWalletConnector.connectAndGetAddress(
        walletId,
      );

      const nonce = await SupabaseConnector.callFunction(
        "api/wallet/new-nonce",
        { walletAddress },
      );

      const signedMessage = await UniversalWalletConnector
        .connectAndSignMessage(walletId, `${this.message}\n\nNonce: ${nonce}`);

      const token = await SupabaseConnector.callFunction("api/wallet/sign-in", {
        walletAddress,
        signedMessage,
      });

      this.resolveLogin?.({ walletId, walletAddress, token });
      this.remove();
    } catch (error) {
      console.error(error);

      if (UniversalWalletConnector.checkDisplayMode(walletId) === "modal") {
        this.onDom("close", this.closeListener).htmlElement.showModal();
      }
    }
  }

  public async waitForLogin(): Promise<
    { walletId: string; walletAddress: string; token: string }
  > {
    return new Promise((resolve, reject) => {
      this.resolveLogin = resolve;
      this.rejectLogin = reject;
    });
  }
}
