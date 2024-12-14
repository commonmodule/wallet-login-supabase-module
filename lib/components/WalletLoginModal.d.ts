import { StructuredModal } from "@common-module/app-components";
interface LoginResult {
    walletId: string;
    walletAddress: `0x${string}`;
    token: string;
}
export default class WalletLoginModal extends StructuredModal {
    private resolveLogin?;
    private rejectLogin?;
    constructor();
    private handleLogin;
    waitForLogin(): Promise<LoginResult>;
}
export {};
//# sourceMappingURL=WalletLoginModal.d.ts.map