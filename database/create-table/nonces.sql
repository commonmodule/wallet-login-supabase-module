CREATE TABLE IF NOT EXISTS "public"."nonces" (
    "wallet_address" "text" NOT NULL,
    "nonce" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."nonces" OWNER TO "postgres";

ALTER TABLE ONLY "public"."nonces"
    ADD CONSTRAINT "nonces_pkey" PRIMARY KEY ("wallet_address");

ALTER TABLE "public"."nonces" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."nonces" TO "anon";
GRANT ALL ON TABLE "public"."nonces" TO "authenticated";
GRANT ALL ON TABLE "public"."nonces" TO "service_role";
