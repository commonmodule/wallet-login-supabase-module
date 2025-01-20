import { verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;
const key = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(JWT_SECRET),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["verify"],
);

export async function extractWalletAddressFromRequest(
  req: Request,
): Promise<`0x${string}`> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("Missing token");

  // Verify the token using the secret
  const decoded = await verify(token, key) as
    | { wallet_address?: `0x${string}` }
    | undefined;
  if (!decoded?.wallet_address) throw new Error("Invalid token");

  return decoded.wallet_address;
}
