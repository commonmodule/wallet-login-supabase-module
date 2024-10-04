import { verifyMessage } from "https://esm.sh/ethers@6.7.0";
import { sign, verify } from "https://esm.sh/jsonwebtoken@8.5.1";
import {
  Context,
  response,
} from "https://raw.githubusercontent.com/yjgaia/deno-module/main/api.ts";
import {
  safeFetch,
  supabase,
} from "https://raw.githubusercontent.com/yjgaia/deno-module/main/supabase.ts";

const MESSAGE_FOR_LOGIN = Deno.env.get("MESSAGE_FOR_LOGIN")!;
const JWT_SECRET = Deno.env.get("JWT_SECRET")!;

export async function serveWalletApi(context: Context) {
  const url = new URL(context.request.url);
  const uri = url.pathname.replace("/api/wallet/", "");

  if (uri === "new-nonce") {
    const { walletAddress } = await context.request.json();
    if (!walletAddress) throw new Error("Missing wallet address");

    // Delete any existing nonce for this wallet address
    await supabase.from("nonces").delete().eq("wallet_address", walletAddress);

    // Generate a new nonce and insert it into the database
    const data = await safeFetch<{ nonce: string }>(
      "nonces",
      (b) => b.insert({ wallet_address: walletAddress }).select().single(),
    );

    context.response = response(data.nonce);
  }

  if (uri === "login") {
    const { walletAddress, signedMessage } = await context.request.json();
    if (!walletAddress || !signedMessage) throw new Error("Missing parameters");

    // Retrieve the nonce associated with the wallet address
    const data = await safeFetch<{ nonce: string }>(
      "nonces",
      (b) => b.select().eq("wallet_address", walletAddress).single(),
    );

    // Verify the signed message
    const verifiedAddress = verifyMessage(
      `${MESSAGE_FOR_LOGIN}\n\nNonce: ${data.nonce}`,
      signedMessage,
    );

    if (walletAddress !== verifiedAddress) throw new Error("Invalid signature");

    // Delete the used nonce to prevent replay attacks
    await supabase.from("nonces").delete().eq("wallet_address", walletAddress);

    // Generate a JWT token for the authenticated user
    const token = sign({ wallet_address: walletAddress }, JWT_SECRET);

    context.response = response(token);
  }

  if (uri === "verify-token") {
    const { token } = await context.request.json();
    if (!token) throw new Error("Missing token");

    // Verify the token using the secret
    const decoded = verify(token, JWT_SECRET) as
      | { wallet_address?: string }
      | undefined;
    if (!decoded?.wallet_address) throw new Error("Invalid token");

    context.response = response(decoded.wallet_address);
  }

  if (uri === "test") {
    context.response = response("ok");
  }
}
