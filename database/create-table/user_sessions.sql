CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "wallet_address" text NOT NULL,
    "token" text NOT NULL,
    "ip" text,
    "real_ip" text,
    "forwarded_for" text,
    "user_agent" text,
    "origin" text,
    "referer" text, 
    "accept_language" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "last_used_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "public"."user_sessions" OWNER TO "postgres";

ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("wallet_address", "token");

ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."user_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sessions" TO "service_role";
