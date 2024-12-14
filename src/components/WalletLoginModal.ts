import { el } from "@common-module/app";
import {
  Button,
  ConfirmDialog,
  InfoAlert,
  StructuredModal,
} from "@common-module/app-components";
import { WalletButtonGroup, WalletConnector } from "@common-module/wallet";
import { createSiweMessage } from "viem/siwe";
import WalletLoginConfig from "../WalletLoginConfig.js";

interface LoginResult {
  walletId: string;
  walletAddress: `0x${string}`;
  token: string;
}

export default class WalletLoginModal extends StructuredModal {
  private resolveLogin?: (result: LoginResult) => void;
  private rejectLogin?: (reason: Error) => void;

  constructor() {
    super(".wallet-login-modal", false);

    this.appendToHeader(el("h1", "Login with Crypto Wallet"));
    this.appendToMain(
      new WalletButtonGroup(
        "Login",
        (walletConnector) => this.handleLogin(walletConnector),
      ),
    );
    this.appendToFooter(
      new Button(".cancel", {
        title: "Cancel",
        onClick: () => this.remove(),
      }),
    );

    this.on(
      "remove",
      () => this.rejectLogin?.(new Error("Login canceled by user")),
    );
  }

  private async handleLogin(walletConnector: WalletConnector) {
    const result = await walletConnector.connect();
    const walletAddress = result.accounts[0];
    if (!walletAddress) throw new Error("No accounts found");

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

    const message = createSiweMessage({
      domain: window.location.host,
      address: walletAddress,
      statement: WalletLoginConfig.messageForWalletLogin,
      uri: window.location.origin,
      version: "1",
      chainId: 1,
      nonce,
      issuedAt: new Date(issuedAt),
    });

    const signedMessage = await walletConnector.signMessage(
      walletAddress,
      message,
    );

    const token = await WalletLoginConfig.supabaseConnector.callEdgeFunction<
      string
    >("wallet-login", { walletAddress, signedMessage });

    await WalletLoginConfig.executeAfterLogin(token);

    this.resolveLogin?.({
      walletId: walletConnector.walletId,
      walletAddress,
      token,
    });

    this.rejectLogin = undefined;
    this.remove();
  }

  public async waitForLogin(): Promise<LoginResult> {
    return new Promise((resolve, reject) => {
      this.resolveLogin = resolve;
      this.rejectLogin = reject;
    });
  }
}
