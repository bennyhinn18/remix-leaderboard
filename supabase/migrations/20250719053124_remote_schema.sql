

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."credit_type" AS ENUM (
    'participation',
    'contribution',
    'achievement',
    'bonus'
);


ALTER TYPE "public"."credit_type" OWNER TO "postgres";


CREATE TYPE "public"."event_status" AS ENUM (
    'upcoming',
    'ongoing',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."event_status" OWNER TO "postgres";


CREATE TYPE "public"."event_type" AS ENUM (
    'dailyGathering',
    'weeklyBash',
    'custom'
);


ALTER TYPE "public"."event_type" OWNER TO "postgres";


CREATE TYPE "public"."title_type" AS ENUM (
    'Basher',
    'Captain Bash',
    'Organiser',
    'Mentor',
    'Legacy Basher',
    'Rookie',
    'Null Basher'
);


ALTER TYPE "public"."title_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."award_credits"("p_member_id" "uuid", "p_credit_type" "public"."credit_type", "p_amount" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_month_record monthly_credits;
  v_award_data JSONB;
  v_member_credits JSONB;
  v_updated_categories JSONB;
BEGIN
  -- Get current month's record
  SELECT * INTO v_month_record
  FROM monthly_credits
  WHERE month = date_trunc('month', CURRENT_DATE);

  -- Create award data
  v_award_data = jsonb_build_object(
    'id', uuid_generate_v4(),
    'memberId', p_member_id,
    'creditType', p_credit_type,
    'amount', p_amount,
    'awardedAt', CURRENT_TIMESTAMP
  );

  -- Update credit awards array
  UPDATE monthly_credits
  SET credit_awards = credit_awards || v_award_data,
      -- Update member credits
      member_credits = jsonb_set(
        member_credits,
        array[p_member_id::text],
        COALESCE(member_credits->p_member_id::text, '0')::jsonb + p_amount
      ),
      -- Update credit category current amount
      credit_categories = (
        SELECT jsonb_agg(
          CASE 
            WHEN (cat->>'id')::text = p_credit_type::text 
            THEN jsonb_set(cat, '{currentAmount}', ((cat->>'currentAmount')::int + p_amount)::text::jsonb)
            ELSE cat 
          END
        )
        FROM jsonb_array_elements(credit_categories) cat
      )
  WHERE id = v_month_record.id
  RETURNING credit_categories INTO v_updated_categories;

  RETURN v_updated_categories;
END;
$$;


ALTER FUNCTION "public"."award_credits"("p_member_id" "uuid", "p_credit_type" "public"."credit_type", "p_amount" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_next_month_credits"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Check if next month's row exists
  IF NOT EXISTS (
    SELECT 1 FROM monthly_credits 
    WHERE month = date_trunc('month', NOW() + interval '1 month')
  ) THEN
    -- Create next month's row
    INSERT INTO monthly_credits (month)
    VALUES (date_trunc('month', NOW() + interval '1 month'));
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_next_month_credits"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_monthly_stats"("p_month" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("total_credits_awarded" bigint, "unique_earners" integer, "top_credit_type" "public"."credit_type", "top_earner_id" "uuid", "top_earner_amount" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      (SELECT SUM((award->>'amount')::int)
       FROM monthly_credits,
       jsonb_array_elements(credit_awards) award
       WHERE month = date_trunc('month', p_month)) as total_awarded,
      
      (SELECT COUNT(DISTINCT award->>'memberId')
       FROM monthly_credits,
       jsonb_array_elements(credit_awards) award
       WHERE month = date_trunc('month', p_month)) as unique_earners,
      
      (SELECT award->>'creditType'
       FROM monthly_credits,
       jsonb_array_elements(credit_awards) award
       WHERE month = date_trunc('month', p_month)
       GROUP BY award->>'creditType'
       ORDER BY SUM((award->>'amount')::int) DESC
       LIMIT 1) as top_type,
       
      (SELECT award->>'memberId'
       FROM monthly_credits,
       jsonb_array_elements(credit_awards) award
       WHERE month = date_trunc('month', p_month)
       GROUP BY award->>'memberId'
       ORDER BY SUM((award->>'amount')::int) DESC
       LIMIT 1) as top_member_id,
       
      (SELECT SUM((award->>'amount')::int)
       FROM monthly_credits,
       jsonb_array_elements(credit_awards) award
       WHERE month = date_trunc('month', p_month)
       GROUP BY award->>'memberId'
       ORDER BY SUM((award->>'amount')::int) DESC
       LIMIT 1) as top_amount
  )
  SELECT
    COALESCE(total_awarded, 0),
    COALESCE(unique_earners, 0),
    top_type::credit_type,
    top_member_id::UUID,
    COALESCE(top_amount, 0)
  FROM stats;
END;
$$;


ALTER FUNCTION "public"."get_monthly_stats"("p_month" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_attendance_points"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  event_points INT;
  event_name TEXT;
BEGIN
  -- Get the event points and name
  SELECT point_value, name INTO event_points, event_name FROM events WHERE id = NEW.event_id;
  
  -- Insert a new points history record
  INSERT INTO points_history (
    member_id, 
    event_id, 
    points,
    description
  ) VALUES (
    NEW.member_id,
    NEW.event_id,
    event_points,
    'Attendance at: ' || event_name
  );
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."record_attendance_points"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_clan_scores"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    clan_record RECORD;
    avg_points NUMERIC;
BEGIN
    FOR clan_record IN SELECT id FROM public.clans LOOP
        SELECT ROUND(AVG(COALESCE(bash_points, 0))::numeric, 2)  -- round to 2 decimals
        INTO avg_points
        FROM public.members
        WHERE clan_id = clan_record.id;

        UPDATE public.clans
        SET clan_score = COALESCE(avg_points, 0)
        WHERE id = clan_record.id;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."update_clan_scores"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_member_points"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update the bash points for the member based on the new points record
        UPDATE public.members
        SET bash_points = bash_points + NEW.points
        WHERE id = NEW.member_id;  -- Assuming member_id is a foreign key in points table

    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement the bash points for the member based on the deleted points record
        UPDATE public.members
        SET bash_points = bash_points - OLD.points
        WHERE id = OLD.member_id;  -- Assuming member_id is a foreign key in points table
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_member_points"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_project_showcase_slots_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_project_showcase_slots_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."announcements" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text",
    "content" "text",
    "catagory" "text",
    "created_by" "text",
    "status" "text" DEFAULT 'hot'::"text"
);


ALTER TABLE "public"."announcements" OWNER TO "postgres";


ALTER TABLE "public"."announcements" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."announcements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."attendance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "member_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "roll_number" "text" NOT NULL,
    "type" "text" NOT NULL,
    "member_name" "text",
    "name" "text"
);


ALTER TABLE "public"."attendance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clans" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "clan_name" character varying NOT NULL,
    "quotes" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "projects" integer DEFAULT 0 NOT NULL,
    "hackathons_won" integer DEFAULT 0 NOT NULL,
    "workshops" integer DEFAULT 0 NOT NULL,
    "avg_attendance" numeric(5,2) DEFAULT 0.00 NOT NULL,
    "activities" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "description" "text",
    "logo_url" "text",
    "banner_url" "text",
    "clan_score" bigint NOT NULL
);


ALTER TABLE "public"."clans" OWNER TO "postgres";


COMMENT ON TABLE "public"."clans" IS 'Stores information about developer clans including their achievements and activities';



COMMENT ON COLUMN "public"."clans"."quotes" IS 'Array of inspiring quotes associated with the clan';



COMMENT ON COLUMN "public"."clans"."projects" IS 'Number of projects completed by the clan';



COMMENT ON COLUMN "public"."clans"."hackathons_won" IS 'Number of hackathons won by the clan';



COMMENT ON COLUMN "public"."clans"."workshops" IS 'Number of workshops conducted by the clan';



COMMENT ON COLUMN "public"."clans"."avg_attendance" IS 'Average attendance percentage in clan activities';



COMMENT ON COLUMN "public"."clans"."activities" IS 'JSON array of clan activities including hackathons, workshops, and other events';



ALTER TABLE "public"."clans" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."clans_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."credits" (
    "id" bigint NOT NULL,
    "month_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "best_basher" "text",
    "best_leader" "text",
    "best_clan" "text",
    "best_profile" "text",
    "month" "text",
    "basher_clan_name" character varying,
    "leader_clan_name" "text"
);


ALTER TABLE "public"."credits" OWNER TO "postgres";


ALTER TABLE "public"."credits" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."credits_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."domains" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "focus" "text" NOT NULL
);


ALTER TABLE "public"."domains" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."domains_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."domains_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."domains_id_seq" OWNED BY "public"."domains"."id";



CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "date" "date" NOT NULL,
    "time" "text" NOT NULL,
    "venue" "text" NOT NULL,
    "leading_clan" "jsonb" NOT NULL,
    "agenda" "jsonb" NOT NULL,
    "status" "public"."event_status" DEFAULT 'upcoming'::"public"."event_status",
    "attendees" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "absentees" integer,
    "clan_id" bigint,
    "type" "text",
    "description" "text",
    "is_active" boolean DEFAULT false,
    "point_value" integer DEFAULT 10
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "id" bigint NOT NULL,
    "event_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "positives" "text" NOT NULL,
    "negatives" "text" NOT NULL,
    "improvements" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "fullname" character varying,
    CONSTRAINT "feedback_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."feedback" OWNER TO "postgres";


ALTER TABLE "public"."feedback" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."feedback_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."member_notifications" (
    "id" bigint NOT NULL,
    "notification_id" bigint NOT NULL,
    "member_id" bigint NOT NULL,
    "read_at" timestamp with time zone,
    "dismissed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."member_notifications" OWNER TO "postgres";


ALTER TABLE "public"."member_notifications" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."member_notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."member_stats" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "member_id" bigint NOT NULL,
    "github_streak" integer DEFAULT 0,
    "leetcode_streak" integer DEFAULT 0,
    "duolingo_streak" integer DEFAULT 0,
    "discord_points" integer DEFAULT 0,
    "books_read" integer DEFAULT 0,
    "last_updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."member_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."members" (
    "id" bigint NOT NULL,
    "name" character varying(255) NOT NULL,
    "personal_email" character varying(255),
    "academic_email" character varying(255),
    "mobile_number" character varying(20),
    "whatsapp_number" character varying(20),
    "discord_username" character varying(255),
    "github_username" character varying(255),
    "hackerrank_username" character varying(255),
    "instagram_username" character varying(255),
    "personal_website" character varying(255),
    "linkedin_url" character varying(255),
    "avatar_url" "text",
    "title" "public"."title_type" DEFAULT 'Basher'::"public"."title_type",
    "basher_level" character varying(50),
    "bash_points" integer DEFAULT 0,
    "clan_name" character varying(255),
    "basher_no" character varying(50),
    "joined_date" "date",
    "portfolio_url" character varying(255),
    "resume_url" character varying(255),
    "primary_domain" character varying[],
    "secondary_domain" character varying[],
    "stats" "jsonb" DEFAULT '{"courses": 0, "projects": 0, "hackathons": 0, "internships": 0, "certifications": 0}'::"jsonb",
    "gpa" numeric(3,2),
    "weekly_bash_attendance" integer,
    "testimony" "text",
    "hobbies" "text"[],
    "clan_id" bigint NOT NULL,
    "duolingo_username" "text" DEFAULT '0'::"text",
    "user_id" "uuid",
    "roll_number" "text" DEFAULT 'roll'::"text" NOT NULL,
    "leetcode_username" "text"
);


ALTER TABLE "public"."members" OWNER TO "postgres";


ALTER TABLE "public"."members" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."members_copy_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "category" "text" NOT NULL,
    "priority" "text" DEFAULT 'normal'::"text" NOT NULL,
    "image_url" "text",
    "action_url" "text",
    "created_by" "text",
    "is_broadcast" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


ALTER TABLE "public"."notifications" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."points" (
    "id" bigint NOT NULL,
    "member_id" bigint NOT NULL,
    "organiser_id" bigint DEFAULT '1'::bigint NOT NULL,
    "points" integer NOT NULL,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "description" "text" NOT NULL,
    "event_id" "text"
);


ALTER TABLE "public"."points" OWNER TO "postgres";


ALTER TABLE "public"."points" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."points_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "email" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_showcase_slots" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "member_id" bigint NOT NULL,
    "member_name" "text" NOT NULL,
    "member_github_username" "text" NOT NULL,
    "member_title" "text" NOT NULL,
    "slot_number" integer NOT NULL,
    "allocated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "event_id" "text" DEFAULT 'project-showcase-2025'::"text" NOT NULL,
    "event_name" "text" DEFAULT 'Project Showcase Event 2025'::"text" NOT NULL,
    "status" "text" DEFAULT 'allocated'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    CONSTRAINT "project_showcase_slots_slot_number_check" CHECK ((("slot_number" >= 1) AND ("slot_number" <= 25))),
    CONSTRAINT "project_showcase_slots_status_check" CHECK (("status" = ANY (ARRAY['allocated'::"text", 'confirmed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."project_showcase_slots" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_showcase_slots" IS 'Stores slot allocations for project showcase events';



COMMENT ON COLUMN "public"."project_showcase_slots"."member_id" IS 'Reference to the member who got the slot';



COMMENT ON COLUMN "public"."project_showcase_slots"."slot_number" IS 'Unique slot number (1-25) for the event';



COMMENT ON COLUMN "public"."project_showcase_slots"."event_id" IS 'Identifier for the specific event';



COMMENT ON COLUMN "public"."project_showcase_slots"."status" IS 'Current status of the slot allocation';



COMMENT ON COLUMN "public"."project_showcase_slots"."metadata" IS 'Additional metadata in JSON format';



ALTER TABLE "public"."project_showcase_slots" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."project_showcase_slots_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE OR REPLACE VIEW "public"."project_showcase_slots_with_members" AS
 SELECT "pss"."id",
    "pss"."created_at",
    "pss"."updated_at",
    "pss"."member_id",
    "pss"."member_name",
    "pss"."member_github_username",
    "pss"."member_title",
    "pss"."slot_number",
    "pss"."allocated_at",
    "pss"."event_id",
    "pss"."event_name",
    "pss"."status",
    "pss"."metadata",
    "m"."avatar_url",
    "m"."bash_points",
    "m"."clan_name",
    "m"."basher_no"
   FROM ("public"."project_showcase_slots" "pss"
     JOIN "public"."members" "m" ON (("pss"."member_id" = "m"."id")))
  ORDER BY "pss"."slot_number";


ALTER TABLE "public"."project_showcase_slots_with_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" integer NOT NULL,
    "title" character varying(200) NOT NULL,
    "description" "text" NOT NULL,
    "domain_id" integer NOT NULL,
    "difficulty_level" character varying(20) NOT NULL,
    "member_id" integer NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "status" "text"
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."projects_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."projects_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."projects_id_seq" OWNED BY "public"."projects"."id";



CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "endpoint" "text" NOT NULL,
    "p256dh" "text" NOT NULL,
    "auth" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."push_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resources" (
    "id" integer NOT NULL,
    "domain_id" integer NOT NULL,
    "website_name" character varying(200) NOT NULL,
    "website_url" character varying(500) NOT NULL,
    "member_id" integer NOT NULL,
    "added_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."resources" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."resources_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."resources_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."resources_id_seq" OWNED BY "public"."resources"."id";



ALTER TABLE ONLY "public"."domains" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."domains_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."projects" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."projects_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."resources" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."resources_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attendance"
    ADD CONSTRAINT "attendance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clans"
    ADD CONSTRAINT "clans_clan_name_key" UNIQUE ("clan_name");



ALTER TABLE ONLY "public"."clans"
    ADD CONSTRAINT "clans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."credits"
    ADD CONSTRAINT "credits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."domains"
    ADD CONSTRAINT "domains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."member_notifications"
    ADD CONSTRAINT "member_notifications_notification_id_member_id_key" UNIQUE ("notification_id", "member_id");



ALTER TABLE ONLY "public"."member_notifications"
    ADD CONSTRAINT "member_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."member_stats"
    ADD CONSTRAINT "member_stats_member_id_key" UNIQUE ("member_id");



ALTER TABLE ONLY "public"."member_stats"
    ADD CONSTRAINT "member_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_copy_basher_no_key" UNIQUE ("basher_no");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_pkey1" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_roll_number_key" UNIQUE ("roll_number");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_roll_number_unique" UNIQUE ("roll_number");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."points"
    ADD CONSTRAINT "points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."project_showcase_slots"
    ADD CONSTRAINT "project_showcase_slots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_showcase_slots"
    ADD CONSTRAINT "project_showcase_slots_slot_number_key" UNIQUE ("slot_number");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_endpoint_key" UNIQUE ("endpoint");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "unique_member_id" UNIQUE ("id");



CREATE INDEX "clans_avg_attendance_idx" ON "public"."clans" USING "btree" ("avg_attendance" DESC);



CREATE INDEX "clans_hackathons_won_idx" ON "public"."clans" USING "btree" ("hackathons_won" DESC);



CREATE INDEX "clans_name_idx" ON "public"."clans" USING "btree" ("clan_name");



CREATE INDEX "clans_projects_idx" ON "public"."clans" USING "btree" ("projects" DESC);



CREATE INDEX "idx_events_agenda" ON "public"."events" USING "gin" ("agenda" "jsonb_path_ops");



CREATE INDEX "idx_events_date" ON "public"."events" USING "btree" ("date");



CREATE INDEX "idx_events_leading_clan" ON "public"."events" USING "gin" ("leading_clan" "jsonb_path_ops");



CREATE INDEX "idx_events_status" ON "public"."events" USING "btree" ("status");



CREATE INDEX "members_copy_basher_no_idx" ON "public"."members" USING "btree" ("basher_no");



CREATE INDEX "members_copy_clan_name_idx" ON "public"."members" USING "btree" ("clan_name");



CREATE INDEX "project_showcase_slots_event_id_idx" ON "public"."project_showcase_slots" USING "btree" ("event_id");



CREATE INDEX "project_showcase_slots_member_id_idx" ON "public"."project_showcase_slots" USING "btree" ("member_id");



CREATE INDEX "project_showcase_slots_slot_number_idx" ON "public"."project_showcase_slots" USING "btree" ("slot_number");



CREATE INDEX "project_showcase_slots_status_idx" ON "public"."project_showcase_slots" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."push_subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "project_showcase_slots_updated_at_trigger" BEFORE UPDATE ON "public"."project_showcase_slots" FOR EACH ROW EXECUTE FUNCTION "public"."update_project_showcase_slots_updated_at"();



CREATE OR REPLACE TRIGGER "update_events_updated_at" BEFORE UPDATE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_member_points_trigger" AFTER INSERT OR DELETE ON "public"."points" FOR EACH ROW EXECUTE FUNCTION "public"."update_member_points"();



ALTER TABLE ONLY "public"."attendance"
    ADD CONSTRAINT "attendance_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_clan_id_fkey" FOREIGN KEY ("clan_id") REFERENCES "public"."clans"("id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id");



ALTER TABLE ONLY "public"."attendance"
    ADD CONSTRAINT "fk_event" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."member_notifications"
    ADD CONSTRAINT "member_notifications_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."member_notifications"
    ADD CONSTRAINT "member_notifications_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."member_stats"
    ADD CONSTRAINT "member_stats_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_clan_id_fkey1" FOREIGN KEY ("clan_id") REFERENCES "public"."clans"("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."points"
    ADD CONSTRAINT "points_giver_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."points"
    ADD CONSTRAINT "points_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."points"
    ADD CONSTRAINT "points_organiser_id_fkey" FOREIGN KEY ("organiser_id") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_showcase_slots"
    ADD CONSTRAINT "project_showcase_slots_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id");



CREATE POLICY "Allow all operations" ON "public"."clans" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to update members" ON "public"."members" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow delete for organisers" ON "public"."project_showcase_slots" FOR DELETE USING (true);



CREATE POLICY "Allow insert for authenticated users" ON "public"."project_showcase_slots" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow insert/update for authenticated users" ON "public"."attendance" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow read access to authenticated users" ON "public"."attendance" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access to project_showcase_slots" ON "public"."project_showcase_slots" FOR SELECT USING (true);



CREATE POLICY "Allow update for authenticated users" ON "public"."attendance" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow update for organisers" ON "public"."project_showcase_slots" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Enable delete for authenticated users only" ON "public"."push_subscriptions" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."members" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."members" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."clans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."credits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_showcase_slots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."award_credits"("p_member_id" "uuid", "p_credit_type" "public"."credit_type", "p_amount" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."award_credits"("p_member_id" "uuid", "p_credit_type" "public"."credit_type", "p_amount" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."award_credits"("p_member_id" "uuid", "p_credit_type" "public"."credit_type", "p_amount" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_next_month_credits"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_next_month_credits"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_next_month_credits"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_monthly_stats"("p_month" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_monthly_stats"("p_month" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_monthly_stats"("p_month" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."record_attendance_points"() TO "anon";
GRANT ALL ON FUNCTION "public"."record_attendance_points"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_attendance_points"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_clan_scores"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_clan_scores"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_clan_scores"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_member_points"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_member_points"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_member_points"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_project_showcase_slots_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_project_showcase_slots_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_project_showcase_slots_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."announcements" TO "anon";
GRANT ALL ON TABLE "public"."announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."announcements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."announcements_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."announcements_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."announcements_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."attendance" TO "anon";
GRANT ALL ON TABLE "public"."attendance" TO "authenticated";
GRANT ALL ON TABLE "public"."attendance" TO "service_role";



GRANT ALL ON TABLE "public"."clans" TO "anon";
GRANT ALL ON TABLE "public"."clans" TO "authenticated";
GRANT ALL ON TABLE "public"."clans" TO "service_role";



GRANT ALL ON SEQUENCE "public"."clans_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."clans_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."clans_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."credits" TO "anon";
GRANT ALL ON TABLE "public"."credits" TO "authenticated";
GRANT ALL ON TABLE "public"."credits" TO "service_role";



GRANT ALL ON SEQUENCE "public"."credits_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."credits_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."credits_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."domains" TO "anon";
GRANT ALL ON TABLE "public"."domains" TO "authenticated";
GRANT ALL ON TABLE "public"."domains" TO "service_role";



GRANT ALL ON SEQUENCE "public"."domains_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."domains_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."domains_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."feedback" TO "anon";
GRANT ALL ON TABLE "public"."feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback" TO "service_role";



GRANT ALL ON SEQUENCE "public"."feedback_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."feedback_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."feedback_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."member_notifications" TO "anon";
GRANT ALL ON TABLE "public"."member_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."member_notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."member_notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."member_notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."member_notifications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."member_stats" TO "anon";
GRANT ALL ON TABLE "public"."member_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."member_stats" TO "service_role";



GRANT ALL ON TABLE "public"."members" TO "anon";
GRANT ALL ON TABLE "public"."members" TO "authenticated";
GRANT ALL ON TABLE "public"."members" TO "service_role";



GRANT ALL ON SEQUENCE "public"."members_copy_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."members_copy_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."members_copy_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."points" TO "anon";
GRANT ALL ON TABLE "public"."points" TO "authenticated";
GRANT ALL ON TABLE "public"."points" TO "service_role";



GRANT ALL ON SEQUENCE "public"."points_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."points_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."points_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."project_showcase_slots" TO "anon";
GRANT ALL ON TABLE "public"."project_showcase_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."project_showcase_slots" TO "service_role";



GRANT ALL ON SEQUENCE "public"."project_showcase_slots_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."project_showcase_slots_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."project_showcase_slots_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."project_showcase_slots_with_members" TO "anon";
GRANT ALL ON TABLE "public"."project_showcase_slots_with_members" TO "authenticated";
GRANT ALL ON TABLE "public"."project_showcase_slots_with_members" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."push_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."resources" TO "anon";
GRANT ALL ON TABLE "public"."resources" TO "authenticated";
GRANT ALL ON TABLE "public"."resources" TO "service_role";



GRANT ALL ON SEQUENCE "public"."resources_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."resources_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."resources_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
