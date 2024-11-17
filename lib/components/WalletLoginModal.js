import { el } from "@common-module/app";
import { Button, ButtonGroup, ButtonType, ConfirmDialog, InfoAlert, StructuredModal, } from "@common-module/app-components";
import { CoinbaseWalletConnector, CoinbaseWalletIcon, MetaMaskConnector, MetaMaskIcon, WalletConnectConnector, WalletConnectIcon, } from "@common-module/wallet";
import { createSiweMessage } from "viem/siwe";
import WalletLoginConfig from "../WalletLoginConfig.js";
export default class WalletLoginModal extends StructuredModal {
    resolveLogin;
    rejectLogin;
    constructor() {
        super(".wallet-login-modal", false);
        this.appendToHeader(el("h1", "Login with Crypto Wallet"));
        this.appendToMain(new ButtonGroup(new Button({
            type: ButtonType.Outlined,
            icon: new MetaMaskIcon(),
            title: "Login with MetaMask",
            onClick: () => this.handleLogin(MetaMaskConnector),
        }), new Button({
            type: ButtonType.Outlined,
            icon: new CoinbaseWalletIcon(),
            title: "Login with Coinbase Wallet",
            onClick: () => this.handleLogin(CoinbaseWalletConnector),
        }), new Button({
            type: ButtonType.Outlined,
            icon: new WalletConnectIcon(),
            title: "Login with WalletConnect",
            onClick: () => this.handleLogin(WalletConnectConnector),
        })));
        this.appendToFooter(new Button(".cancel", {
            title: "Cancel",
            onClick: () => this.remove(),
        }));
        this.on("remove", () => this.rejectLogin?.(new Error("Login canceled by user")));
    }
    async handleLogin(walletConnector) {
        const result = await walletConnector.connect();
        const walletAddress = result.accounts[0];
        if (!walletAddress)
            throw new Error("No accounts found");
        const { nonce, issuedAt } = await WalletLoginConfig.supabaseConnector
            .callEdgeFunction("generate-wallet-login-nonce", {
            walletAddress,
            domain: window.location.host,
            uri: window.location.origin,
        });
        await new ConfirmDialog(".sign-message", {
            title: "Sign Message",
            message: [
                "To complete the login process, please sign the message in your wallet. This signature verifies your ownership of the wallet address.",
                new InfoAlert("No gas fees will be charged for this signature request."),
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
        const signedMessage = await walletConnector.signMessage(walletAddress, message);
        const token = await WalletLoginConfig.supabaseConnector.callEdgeFunction("wallet-login", { walletAddress, signedMessage });
        await WalletLoginConfig.executeAfterLogin(token);
        this.resolveLogin?.({
            walletId: walletConnector.walletId,
            walletAddress,
            token,
        });
        this.rejectLogin = undefined;
        this.remove();
    }
    async waitForLogin() {
        return new Promise((resolve, reject) => {
            this.resolveLogin = resolve;
            this.rejectLogin = reject;
        });
    }
}
//# sourceMappingURL=WalletLoginModal.js.map