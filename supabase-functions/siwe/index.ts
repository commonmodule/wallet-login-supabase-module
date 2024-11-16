import { sign, verify } from "https://esm.sh/jsonwebtoken@8.5.1";
import {
  getAddressFromMessage,
  getChainIdFromMessage,
  verifySignature,
} from "https://esm.sh/v135/@reown/appkit-siwe@1.4.1";
import { generateNonce } from "https://esm.sh/v135/siwe@2.3.2";
import { serve } from "https://raw.githubusercontent.com/yjgaia/deno-module/refs/heads/main/api.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;

serve(async (req) => {
  const url = new URL(req.url);
  const uri = url.pathname.replace("/siwe/", "");

  if (uri === "nonce") {
    return generateNonce();
  }

  if (uri === "verify") {
    const { message, signature, projectId } = await req.json();

    if (!message || !signature || !projectId) {
      throw new Error("Missing parameters");
    }

    const address = getAddressFromMessage(message);
    const chainId = getChainIdFromMessage(message);

    const isValid = await verifySignature({
      address,
      message,
      signature,
      chainId,
      projectId,
    });
    if (!isValid) throw new Error("Invalid signature");

    return sign({ address, chainId }, JWT_SECRET);
  }

  if (uri === "session") {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Missing token");

    const decoded = verify(token, JWT_SECRET) as
      | { address?: string; chainId?: string }
      | undefined;
    if (!decoded?.address || !decoded?.chainId) {
      throw new Error("Invalid token");
    }

    return decoded;
  }
});
