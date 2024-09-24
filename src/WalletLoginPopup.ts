import { el } from "@common-module/app";
import { Button, ButtonType, Modal } from "@common-module/app-components";
import { UniversalWalletConnector } from "@common-module/wallet";

export default class WalletLoginPopup extends Modal {
  private resolve:
    | ((result: { walletId: string; walletAddress: string }) => void)
    | undefined;
  private reject: ((reason: Error) => void) | undefined;

  constructor() {
    super(".wallet-login-popup");

    this.append(
      el("header", el("h1", "Login with Crypto Wallet")),
      el(
        "main",
        el(
          "section",
          el("h2", "WalletConnect - Recommended"),
          new Button({
            type: ButtonType.Contained,
            icon: el("img", { src: "/images/wallet-icons/walletconnect.svg" }),
            title: "Login with WalletConnect",
            onClick: async () => await this.login("walletconnect"),
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
            onClick: async () => await this.login("metamask"),
          }),
          new Button({
            type: ButtonType.Contained,
            icon: el("img", {
              src: "/images/wallet-icons/coinbase-wallet.svg",
            }),
            title: "Login with Coinbase Wallet",
            onClick: async () => await this.login("coinbase-wallet"),
          }),
        ),
      ),
      el(
        "footer",
        new Button(".cancel", {
          title: "Cancel",
          onClick: () => this.remove(),
        }),
      ),
    );

    this.on("remove", () => this.reject?.(new Error("Login canceled by user")));
  }

  private async login(walletId: string) {
    // Temporarily close the popup while the wallet connection process is underway.
    this.offDom("close", this.closeListener).htmlElement.close();
    try {
      const walletAddress = await UniversalWalletConnector.connectAndGetAddress(
        walletId,
      );
      this.resolve?.({ walletId, walletAddress });
      this.remove();
    } catch (error) {
      console.error(error);
      this.onDom("close", this.closeListener).htmlElement.showModal();
    }
  }

  public async wait(): Promise<{ walletId: string; walletAddress: string }> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
