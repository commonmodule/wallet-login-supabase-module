CREATE TABLE IF NOT EXISTS "public"."wallet_login_nonces" (
    "wallet_address" "text" NOT NULL,
    "nonce" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."wallet_login_nonces" OWNER TO "postgres";

ALTER TABLE ONLY "public"."wallet_login_nonces"
    ADD CONSTRAINT "wallet_login_nonces_pkey" PRIMARY KEY ("wallet_address");

ALTER TABLE "public"."wallet_login_nonces" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."wallet_login_nonces" TO "anon";
GRANT ALL ON TABLE "public"."wallet_login_nonces" TO "authenticated";
GRANT ALL ON TABLE "public"."wallet_login_nonces" TO "service_role";
