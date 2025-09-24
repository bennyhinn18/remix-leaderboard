create sequence "public"."notification_preferences_id_seq";

create table "public"."notification_preferences" (
    "id" bigint not null default nextval('notification_preferences_id_seq'::regclass),
    "member_id" bigint not null,
    "push_enabled" boolean default true,
    "email_enabled" boolean default true,
    "in_app_enabled" boolean default true,
    "announcement_notifications" boolean default true,
    "event_notifications" boolean default true,
    "points_notifications" boolean default true,
    "system_notifications" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."notification_preferences" enable row level security;

alter table "public"."member_stats" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."push_subscriptions" alter column "id" set default extensions.uuid_generate_v4();

alter sequence "public"."notification_preferences_id_seq" owned by "public"."notification_preferences"."id";

CREATE INDEX idx_notification_preferences_member_id ON public.notification_preferences USING btree (member_id);

CREATE UNIQUE INDEX notification_preferences_pkey ON public.notification_preferences USING btree (id);

CREATE UNIQUE INDEX unique_member_preferences ON public.notification_preferences USING btree (member_id);

alter table "public"."notification_preferences" add constraint "notification_preferences_pkey" PRIMARY KEY using index "notification_preferences_pkey";

alter table "public"."notification_preferences" add constraint "fk_notification_preferences_member" FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE not valid;

alter table "public"."notification_preferences" validate constraint "fk_notification_preferences_member";

alter table "public"."notification_preferences" add constraint "unique_member_preferences" UNIQUE using index "unique_member_preferences";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_notification_preferences_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.award_clan_points(p_clan_id bigint, p_points integer, p_event_date date)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
    v_member_id bigint;
    v_desc      text;
begin
    -- Build description string: CG-BC{clanId}-{DDMonYY}
    v_desc := concat('CG-BC', p_clan_id::text, '-', to_char(p_event_date, 'DDMonYY'));

    -- Insert points for each member of the clan
    for v_member_id in
        select id
        from members
        where clan_id = p_clan_id
          and title = any (ARRAY['Basher','Captain Bash','Organiser']::title_type[])

    loop
        insert into points (member_id, points, description, updated_at)
        values (v_member_id, p_points, v_desc, now());
    end loop;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.award_clan_points(p_clan_id uuid, p_points integer, p_event_date date)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
    v_member_id uuid;
    v_desc      text;
begin
    -- Build description string: CG-BC{clanId}-{DDMonYY}
    v_desc := concat('CG-BC', p_clan_id::text, '-', to_char(p_event_date, 'DDMonYY'));

    -- Insert points for each member of the clan
    for v_member_id in
        select id
        from members
        where clan_id = p_clan_id
          and title = any( array['Basher','Captain Bash','Organiser'] )
    loop
        insert into points (member_id, points, description, awarded_at)
        values (v_member_id, p_points, v_desc, now());
    end loop;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.award_credits(p_member_id uuid, p_credit_type credit_type, p_amount integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_next_month_credits()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_monthly_stats(p_month date DEFAULT CURRENT_DATE)
 RETURNS TABLE(total_credits_awarded bigint, unique_earners integer, top_credit_type credit_type, top_earner_id uuid, top_earner_amount integer)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.record_attendance_points()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.sync_bash_points()
 RETURNS void
 LANGUAGE sql
AS $function$ UPDATE public.members m SET bash_points = pt.total_points FROM ( SELECT member_id, SUM(points) AS total_points FROM public.points GROUP BY member_id ) AS pt WHERE m.id = pt.member_id; $function$
;

CREATE OR REPLACE FUNCTION public.update_clan_scores()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_member_points()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_project_showcase_events_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_project_showcase_slots_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

create policy "Organisers can view all notification preferences"
on "public"."notification_preferences"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM members
  WHERE ((members.user_id = auth.uid()) AND (members.title = 'Organiser'::title_type)))));


create policy "Users can manage their own notification preferences"
on "public"."notification_preferences"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM members
  WHERE ((members.id = notification_preferences.member_id) AND (members.user_id = auth.uid())))));


CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION update_notification_preferences_updated_at();



