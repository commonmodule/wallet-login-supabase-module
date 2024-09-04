import {
  Context,
  response,
} from "https://raw.githubusercontent.com/yjgaia/deno-module/main/api.ts";
import {
  safeFetch,
  supabase,
} from "https://raw.githubusercontent.com/yjgaia/deno-module/main/supabase.ts";

export async function serveWalletApi(context: Context) {
  const url = new URL(context.request.url);
  const uri = url.pathname.replace("/api/wallet/", "");

  if (uri === "new-nonce") {
    const { walletAddress } = await context.request.json();
    if (!walletAddress) throw new Error("Missing wallet address");

    // delete old nonce
    await supabase.from("nonce").delete().eq("wallet_address", walletAddress);

    const data = await safeFetch<{ nonce: string }>(
      "nonce",
      (b) => b.insert({ wallet_address: walletAddress }).select().single(),
    );

    context.response = response(data.nonce);
  }

  if (uri === "login") {
    //TODO:
  }

  if (uri === "test") {
    context.response = response("test");
  }
}
