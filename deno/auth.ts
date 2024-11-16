import { verify } from "https://esm.sh/jsonwebtoken@8.5.1";

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;

export function extractWalletAddressFromRequest(req: Request): string {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("Missing token");

  // Verify the token using the secret
  const decoded = verify(token, JWT_SECRET) as
    | { address?: string }
    | undefined;
  if (!decoded?.address) throw new Error("Invalid token");

  return decoded.address;
}
