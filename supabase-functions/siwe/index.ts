import { hashMessage } from "https://esm.sh/@ethersproject/hash@5.7.0";
import { recoverAddress } from "https://esm.sh/@ethersproject/transactions@5.7.0";
import { sign, verify } from "https://esm.sh/jsonwebtoken@8.5.1";
import { generateNonce } from "https://esm.sh/siwe@2.3.2";
import { serve } from "https://raw.githubusercontent.com/yjgaia/deno-module/refs/heads/main/api.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;

const ETH_ADDRESS_PATTERN = /0x[a-fA-F0-9]{40}/u;
const ETH_CHAIN_ID_IN_SIWE_PATTERN = /Chain ID: (?<temp1>\d+)/u;

function getAddressFromMessage(message: string) {
  return message.match(ETH_ADDRESS_PATTERN)?.[0] || "";
}

function getChainIdFromMessage(message: string) {
  return `eip155:${message.match(ETH_CHAIN_ID_IN_SIWE_PATTERN)?.[1] || 1}`;
}

function isValidEip191Signature(
  address: string,
  message: string,
  signature: string,
): boolean {
  const recoveredAddress = recoverAddress(hashMessage(message), signature);
  return recoveredAddress.toLowerCase() === address.toLowerCase();
}

const DEFAULT_RPC_URL = "https://rpc.walletconnect.org/v1";

export function parseChainId(chain: string): {
  namespace: string;
  reference: string;
} {
  const [namespace, reference] = chain.split(":");
  return { namespace, reference };
}

function generateJsonRpcId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

async function isValidEip1271Signature(
  address: string,
  reconstructedMessage: string,
  signature: string,
  chainId: string,
  projectId: string,
  baseRpcUrl?: string,
) {
  const parsedChain = parseChainId(chainId);
  if (!parsedChain.namespace || !parsedChain.reference) {
    throw new Error(
      `isValidEip1271Signature failed: chainId must be in CAIP-2 format, received: ${chainId}`,
    );
  }
  try {
    const eip1271MagicValue = "0x1626ba7e";
    const dynamicTypeOffset =
      "0000000000000000000000000000000000000000000000000000000000000040";
    const dynamicTypeLength =
      "0000000000000000000000000000000000000000000000000000000000000041";
    const nonPrefixedSignature = signature.substring(2);
    const nonPrefixedHashedMessage = hashMessage(reconstructedMessage)
      .substring(2);

    const data = eip1271MagicValue +
      nonPrefixedHashedMessage +
      dynamicTypeOffset +
      dynamicTypeLength +
      nonPrefixedSignature;
    const response = await fetch(
      `${
        baseRpcUrl || DEFAULT_RPC_URL
      }/?chainId=${chainId}&projectId=${projectId}`,
      {
        method: "POST",
        body: JSON.stringify({
          id: generateJsonRpcId(),
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ to: address, data }, "latest"],
        }),
      },
    );
    const { result } = await response.json();
    if (!result) return false;

    // Remove right-padded zeros from result to get only the concrete recovered value.
    const recoveredValue = result.slice(0, eip1271MagicValue.length);
    return recoveredValue.toLowerCase() === eip1271MagicValue.toLowerCase();
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("isValidEip1271Signature: ", error);
    return false;
  }
}

async function verifySignature({
  address,
  message,
  signature,
  chainId,
  projectId,
}: {
  address: string;
  message: string;
  signature: string;
  chainId: string;
  projectId: string;
}) {
  let isValid = isValidEip191Signature(address, message, signature);
  if (!isValid) {
    isValid = await isValidEip1271Signature(
      address,
      message,
      signature,
      chainId,
      projectId,
    );
  }

  return isValid;
}

serve(async (req) => {
  const url = new URL(req.url);
  const uri = url.pathname.replace("/siwe/", "");

  if (uri === "nonce") {
    return generateNonce();
  } else if (uri === "verify") {
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

    return sign({ address, chainId: parseInt(chainId) }, JWT_SECRET);
  } else if (uri === "session") {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Missing token");

    const decoded = verify(token, JWT_SECRET) as
      | { address?: string; chainId?: number }
      | undefined;
    if (!decoded?.address || !decoded?.chainId) {
      return undefined;
    } else {
      return decoded;
    }
  } else {
    throw new Error("Invalid URI");
  }
});
