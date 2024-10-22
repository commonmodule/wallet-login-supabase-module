CREATE OR REPLACE FUNCTION "public"."get_login_wallet_address"()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN ("auth"."jwt"() ->> 'wallet_address'::"text");
END;
$$;

ALTER FUNCTION "public"."get_login_wallet_address"() OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_login_wallet_address"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_login_wallet_address"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_login_wallet_address"() TO "service_role";
