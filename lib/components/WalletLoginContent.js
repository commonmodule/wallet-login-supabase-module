import { DomNode, el } from "@common-module/app";
import { Button, ButtonGroup, ButtonType, Confirm, } from "@common-module/app-components";
import { SupabaseConnector } from "@common-module/supabase";
import { UniversalWalletConnector } from "@common-module/wallet";
import WalletLoginManager from "../WalletLoginManager.js";
export default class WalletLoginContent extends DomNode {
    message;
    onLoggedIn;
    onError;
    onBeforeLogin;
    constructor(message, onLoggedIn, onError, onBeforeLogin) {
        super(".wallet-login-content");
        this.message = message;
        this.onLoggedIn = onLoggedIn;
        this.onError = onError;
        this.onBeforeLogin = onBeforeLogin;
        this.append(el("section", el("h2", "WalletConnect - Recommended"), new ButtonGroup(new Button({
            type: ButtonType.Outlined,
            icon: el("img", {
                src: "/images/wallet-icons/walletconnect.svg",
            }),
            title: "Login with WalletConnect",
            onClick: () => this.handleLogin("walletconnect"),
        }))), el("section", el("h2", "Direct Login"), el("p", "These options are available when WalletConnect is not working properly. Direct login requires re-authentication each time you start the app, which may be less convenient compared to WalletConnect."), new ButtonGroup(new Button({
            type: ButtonType.Outlined,
            icon: el("img", { src: "/images/wallet-icons/metamask.svg" }),
            title: "Login with MetaMask",
            onClick: () => this.handleLogin("metamask"),
        }), new Button({
            type: ButtonType.Outlined,
            icon: el("img", {
                src: "/images/wallet-icons/coinbase-wallet.svg",
            }),
            title: "Login with Coinbase Wallet",
            onClick: () => this.handleLogin("coinbase-wallet"),
        }))));
    }
    async handleLogin(walletId) {
        try {
            if (this.onBeforeLogin)
                this.onBeforeLogin(walletId);
            await UniversalWalletConnector.disconnect(walletId);
            const provider = await UniversalWalletConnector.connect(walletId);
            const accounts = await provider.listAccounts();
            if (accounts.length === 0)
                throw new Error("No accounts found");
            const walletAddress = accounts[0].address;
            const nonce = await SupabaseConnector.callFunction("api/wallet/new-nonce", { walletAddress });
            const signer = await provider.getSigner();
            await new Confirm({
                title: "Sign Message",
                message: "To complete the login process, please sign the message in your wallet. This signature verifies your ownership of the wallet address.",
                confirmButtonTitle: "Sign Message",
            }).waitForConfirmation();
            const signedMessage = await signer.signMessage(`${this.message}\n\nNonce: ${nonce}`);
            const token = await SupabaseConnector.callFunction("api/wallet/sign-in", {
                walletAddress,
                signedMessage,
            });
            WalletLoginManager.addLoginInfo(walletId, walletAddress, token);
            this.onLoggedIn();
        }
        catch (error) {
            console.error(error);
            this.onError(error instanceof Error ? error : new Error("Unknown error occurred"));
        }
    }
}
//# sourceMappingURL=WalletLoginContent.js.map