drop trigger if exists "update_notification_preferences_updated_at" on "public"."notification_preferences";

drop policy "Organisers can view all notification preferences" on "public"."notification_preferences";

drop policy "Users can manage their own notification preferences" on "public"."notification_preferences";

drop policy "Organisers can manage showcase events" on "public"."project_showcase_events";

drop policy "Enable delete for authenticated users only" on "public"."push_subscriptions";

revoke delete on table "public"."achievements" from "anon";

revoke insert on table "public"."achievements" from "anon";

revoke references on table "public"."achievements" from "anon";

revoke select on table "public"."achievements" from "anon";

revoke trigger on table "public"."achievements" from "anon";

revoke truncate on table "public"."achievements" from "anon";

revoke update on table "public"."achievements" from "anon";

revoke delete on table "public"."achievements" from "authenticated";

revoke insert on table "public"."achievements" from "authenticated";

revoke references on table "public"."achievements" from "authenticated";

revoke select on table "public"."achievements" from "authenticated";

revoke trigger on table "public"."achievements" from "authenticated";

revoke truncate on table "public"."achievements" from "authenticated";

revoke update on table "public"."achievements" from "authenticated";

revoke delete on table "public"."achievements" from "service_role";

revoke insert on table "public"."achievements" from "service_role";

revoke references on table "public"."achievements" from "service_role";

revoke select on table "public"."achievements" from "service_role";

revoke trigger on table "public"."achievements" from "service_role";

revoke truncate on table "public"."achievements" from "service_role";

revoke update on table "public"."achievements" from "service_role";

revoke delete on table "public"."announcements" from "anon";

revoke insert on table "public"."announcements" from "anon";

revoke references on table "public"."announcements" from "anon";

revoke select on table "public"."announcements" from "anon";

revoke trigger on table "public"."announcements" from "anon";

revoke truncate on table "public"."announcements" from "anon";

revoke update on table "public"."announcements" from "anon";

revoke delete on table "public"."announcements" from "authenticated";

revoke insert on table "public"."announcements" from "authenticated";

revoke references on table "public"."announcements" from "authenticated";

revoke select on table "public"."announcements" from "authenticated";

revoke trigger on table "public"."announcements" from "authenticated";

revoke truncate on table "public"."announcements" from "authenticated";

revoke update on table "public"."announcements" from "authenticated";

revoke delete on table "public"."announcements" from "service_role";

revoke insert on table "public"."announcements" from "service_role";

revoke references on table "public"."announcements" from "service_role";

revoke select on table "public"."announcements" from "service_role";

revoke trigger on table "public"."announcements" from "service_role";

revoke truncate on table "public"."announcements" from "service_role";

revoke update on table "public"."announcements" from "service_role";

revoke delete on table "public"."attendance" from "anon";

revoke insert on table "public"."attendance" from "anon";

revoke references on table "public"."attendance" from "anon";

revoke select on table "public"."attendance" from "anon";

revoke trigger on table "public"."attendance" from "anon";

revoke truncate on table "public"."attendance" from "anon";

revoke update on table "public"."attendance" from "anon";

revoke delete on table "public"."attendance" from "authenticated";

revoke insert on table "public"."attendance" from "authenticated";

revoke references on table "public"."attendance" from "authenticated";

revoke select on table "public"."attendance" from "authenticated";

revoke trigger on table "public"."attendance" from "authenticated";

revoke truncate on table "public"."attendance" from "authenticated";

revoke update on table "public"."attendance" from "authenticated";

revoke delete on table "public"."attendance" from "service_role";

revoke insert on table "public"."attendance" from "service_role";

revoke references on table "public"."attendance" from "service_role";

revoke select on table "public"."attendance" from "service_role";

revoke trigger on table "public"."attendance" from "service_role";

revoke truncate on table "public"."attendance" from "service_role";

revoke update on table "public"."attendance" from "service_role";

revoke delete on table "public"."clans" from "anon";

revoke insert on table "public"."clans" from "anon";

revoke references on table "public"."clans" from "anon";

revoke select on table "public"."clans" from "anon";

revoke trigger on table "public"."clans" from "anon";

revoke truncate on table "public"."clans" from "anon";

revoke update on table "public"."clans" from "anon";

revoke delete on table "public"."clans" from "authenticated";

revoke insert on table "public"."clans" from "authenticated";

revoke references on table "public"."clans" from "authenticated";

revoke select on table "public"."clans" from "authenticated";

revoke trigger on table "public"."clans" from "authenticated";

revoke truncate on table "public"."clans" from "authenticated";

revoke update on table "public"."clans" from "authenticated";

revoke delete on table "public"."clans" from "service_role";

revoke insert on table "public"."clans" from "service_role";

revoke references on table "public"."clans" from "service_role";

revoke select on table "public"."clans" from "service_role";

revoke trigger on table "public"."clans" from "service_role";

revoke truncate on table "public"."clans" from "service_role";

revoke update on table "public"."clans" from "service_role";

revoke delete on table "public"."credits" from "anon";

revoke insert on table "public"."credits" from "anon";

revoke references on table "public"."credits" from "anon";

revoke select on table "public"."credits" from "anon";

revoke trigger on table "public"."credits" from "anon";

revoke truncate on table "public"."credits" from "anon";

revoke update on table "public"."credits" from "anon";

revoke delete on table "public"."credits" from "authenticated";

revoke insert on table "public"."credits" from "authenticated";

revoke references on table "public"."credits" from "authenticated";

revoke select on table "public"."credits" from "authenticated";

revoke trigger on table "public"."credits" from "authenticated";

revoke truncate on table "public"."credits" from "authenticated";

revoke update on table "public"."credits" from "authenticated";

revoke delete on table "public"."credits" from "service_role";

revoke insert on table "public"."credits" from "service_role";

revoke references on table "public"."credits" from "service_role";

revoke select on table "public"."credits" from "service_role";

revoke trigger on table "public"."credits" from "service_role";

revoke truncate on table "public"."credits" from "service_role";

revoke update on table "public"."credits" from "service_role";

revoke delete on table "public"."domains" from "anon";

revoke insert on table "public"."domains" from "anon";

revoke references on table "public"."domains" from "anon";

revoke select on table "public"."domains" from "anon";

revoke trigger on table "public"."domains" from "anon";

revoke truncate on table "public"."domains" from "anon";

revoke update on table "public"."domains" from "anon";

revoke delete on table "public"."domains" from "authenticated";

revoke insert on table "public"."domains" from "authenticated";

revoke references on table "public"."domains" from "authenticated";

revoke select on table "public"."domains" from "authenticated";

revoke trigger on table "public"."domains" from "authenticated";

revoke truncate on table "public"."domains" from "authenticated";

revoke update on table "public"."domains" from "authenticated";

revoke delete on table "public"."domains" from "service_role";

revoke insert on table "public"."domains" from "service_role";

revoke references on table "public"."domains" from "service_role";

revoke select on table "public"."domains" from "service_role";

revoke trigger on table "public"."domains" from "service_role";

revoke truncate on table "public"."domains" from "service_role";

revoke update on table "public"."domains" from "service_role";

revoke delete on table "public"."events" from "anon";

revoke insert on table "public"."events" from "anon";

revoke references on table "public"."events" from "anon";

revoke select on table "public"."events" from "anon";

revoke trigger on table "public"."events" from "anon";

revoke truncate on table "public"."events" from "anon";

revoke update on table "public"."events" from "anon";

revoke delete on table "public"."events" from "authenticated";

revoke insert on table "public"."events" from "authenticated";

revoke references on table "public"."events" from "authenticated";

revoke select on table "public"."events" from "authenticated";

revoke trigger on table "public"."events" from "authenticated";

revoke truncate on table "public"."events" from "authenticated";

revoke update on table "public"."events" from "authenticated";

revoke delete on table "public"."events" from "service_role";

revoke insert on table "public"."events" from "service_role";

revoke references on table "public"."events" from "service_role";

revoke select on table "public"."events" from "service_role";

revoke trigger on table "public"."events" from "service_role";

revoke truncate on table "public"."events" from "service_role";

revoke update on table "public"."events" from "service_role";

revoke delete on table "public"."feedback" from "anon";

revoke insert on table "public"."feedback" from "anon";

revoke references on table "public"."feedback" from "anon";

revoke select on table "public"."feedback" from "anon";

revoke trigger on table "public"."feedback" from "anon";

revoke truncate on table "public"."feedback" from "anon";

revoke update on table "public"."feedback" from "anon";

revoke delete on table "public"."feedback" from "authenticated";

revoke insert on table "public"."feedback" from "authenticated";

revoke references on table "public"."feedback" from "authenticated";

revoke select on table "public"."feedback" from "authenticated";

revoke trigger on table "public"."feedback" from "authenticated";

revoke truncate on table "public"."feedback" from "authenticated";

revoke update on table "public"."feedback" from "authenticated";

revoke delete on table "public"."feedback" from "service_role";

revoke insert on table "public"."feedback" from "service_role";

revoke references on table "public"."feedback" from "service_role";

revoke select on table "public"."feedback" from "service_role";

revoke trigger on table "public"."feedback" from "service_role";

revoke truncate on table "public"."feedback" from "service_role";

revoke update on table "public"."feedback" from "service_role";

revoke delete on table "public"."member_notifications" from "anon";

revoke insert on table "public"."member_notifications" from "anon";

revoke references on table "public"."member_notifications" from "anon";

revoke select on table "public"."member_notifications" from "anon";

revoke trigger on table "public"."member_notifications" from "anon";

revoke truncate on table "public"."member_notifications" from "anon";

revoke update on table "public"."member_notifications" from "anon";

revoke delete on table "public"."member_notifications" from "authenticated";

revoke insert on table "public"."member_notifications" from "authenticated";

revoke references on table "public"."member_notifications" from "authenticated";

revoke select on table "public"."member_notifications" from "authenticated";

revoke trigger on table "public"."member_notifications" from "authenticated";

revoke truncate on table "public"."member_notifications" from "authenticated";

revoke update on table "public"."member_notifications" from "authenticated";

revoke delete on table "public"."member_notifications" from "service_role";

revoke insert on table "public"."member_notifications" from "service_role";

revoke references on table "public"."member_notifications" from "service_role";

revoke select on table "public"."member_notifications" from "service_role";

revoke trigger on table "public"."member_notifications" from "service_role";

revoke truncate on table "public"."member_notifications" from "service_role";

revoke update on table "public"."member_notifications" from "service_role";

revoke delete on table "public"."member_stats" from "anon";

revoke insert on table "public"."member_stats" from "anon";

revoke references on table "public"."member_stats" from "anon";

revoke select on table "public"."member_stats" from "anon";

revoke trigger on table "public"."member_stats" from "anon";

revoke truncate on table "public"."member_stats" from "anon";

revoke update on table "public"."member_stats" from "anon";

revoke delete on table "public"."member_stats" from "authenticated";

revoke insert on table "public"."member_stats" from "authenticated";

revoke references on table "public"."member_stats" from "authenticated";

revoke select on table "public"."member_stats" from "authenticated";

revoke trigger on table "public"."member_stats" from "authenticated";

revoke truncate on table "public"."member_stats" from "authenticated";

revoke update on table "public"."member_stats" from "authenticated";

revoke delete on table "public"."member_stats" from "service_role";

revoke insert on table "public"."member_stats" from "service_role";

revoke references on table "public"."member_stats" from "service_role";

revoke select on table "public"."member_stats" from "service_role";

revoke trigger on table "public"."member_stats" from "service_role";

revoke truncate on table "public"."member_stats" from "service_role";

revoke update on table "public"."member_stats" from "service_role";

revoke delete on table "public"."members" from "anon";

revoke insert on table "public"."members" from "anon";

revoke references on table "public"."members" from "anon";

revoke select on table "public"."members" from "anon";

revoke trigger on table "public"."members" from "anon";

revoke truncate on table "public"."members" from "anon";

revoke update on table "public"."members" from "anon";

revoke delete on table "public"."members" from "authenticated";

revoke insert on table "public"."members" from "authenticated";

revoke references on table "public"."members" from "authenticated";

revoke select on table "public"."members" from "authenticated";

revoke trigger on table "public"."members" from "authenticated";

revoke truncate on table "public"."members" from "authenticated";

revoke update on table "public"."members" from "authenticated";

revoke delete on table "public"."members" from "service_role";

revoke insert on table "public"."members" from "service_role";

revoke references on table "public"."members" from "service_role";

revoke select on table "public"."members" from "service_role";

revoke trigger on table "public"."members" from "service_role";

revoke truncate on table "public"."members" from "service_role";

revoke update on table "public"."members" from "service_role";

revoke delete on table "public"."notification_preferences" from "anon";

revoke insert on table "public"."notification_preferences" from "anon";

revoke references on table "public"."notification_preferences" from "anon";

revoke select on table "public"."notification_preferences" from "anon";

revoke trigger on table "public"."notification_preferences" from "anon";

revoke truncate on table "public"."notification_preferences" from "anon";

revoke update on table "public"."notification_preferences" from "anon";

revoke delete on table "public"."notification_preferences" from "authenticated";

revoke insert on table "public"."notification_preferences" from "authenticated";

revoke references on table "public"."notification_preferences" from "authenticated";

revoke select on table "public"."notification_preferences" from "authenticated";

revoke trigger on table "public"."notification_preferences" from "authenticated";

revoke truncate on table "public"."notification_preferences" from "authenticated";

revoke update on table "public"."notification_preferences" from "authenticated";

revoke delete on table "public"."notification_preferences" from "service_role";

revoke insert on table "public"."notification_preferences" from "service_role";

revoke references on table "public"."notification_preferences" from "service_role";

revoke select on table "public"."notification_preferences" from "service_role";

revoke trigger on table "public"."notification_preferences" from "service_role";

revoke truncate on table "public"."notification_preferences" from "service_role";

revoke update on table "public"."notification_preferences" from "service_role";

revoke delete on table "public"."notifications" from "anon";

revoke insert on table "public"."notifications" from "anon";

revoke references on table "public"."notifications" from "anon";

revoke select on table "public"."notifications" from "anon";

revoke trigger on table "public"."notifications" from "anon";

revoke truncate on table "public"."notifications" from "anon";

revoke update on table "public"."notifications" from "anon";

revoke delete on table "public"."notifications" from "authenticated";

revoke insert on table "public"."notifications" from "authenticated";

revoke references on table "public"."notifications" from "authenticated";

revoke select on table "public"."notifications" from "authenticated";

revoke trigger on table "public"."notifications" from "authenticated";

revoke truncate on table "public"."notifications" from "authenticated";

revoke update on table "public"."notifications" from "authenticated";

revoke delete on table "public"."notifications" from "service_role";

revoke insert on table "public"."notifications" from "service_role";

revoke references on table "public"."notifications" from "service_role";

revoke select on table "public"."notifications" from "service_role";

revoke trigger on table "public"."notifications" from "service_role";

revoke truncate on table "public"."notifications" from "service_role";

revoke update on table "public"."notifications" from "service_role";

revoke delete on table "public"."points" from "anon";

revoke insert on table "public"."points" from "anon";

revoke references on table "public"."points" from "anon";

revoke select on table "public"."points" from "anon";

revoke trigger on table "public"."points" from "anon";

revoke truncate on table "public"."points" from "anon";

revoke update on table "public"."points" from "anon";

revoke delete on table "public"."points" from "authenticated";

revoke insert on table "public"."points" from "authenticated";

revoke references on table "public"."points" from "authenticated";

revoke select on table "public"."points" from "authenticated";

revoke trigger on table "public"."points" from "authenticated";

revoke truncate on table "public"."points" from "authenticated";

revoke update on table "public"."points" from "authenticated";

revoke delete on table "public"."points" from "service_role";

revoke insert on table "public"."points" from "service_role";

revoke references on table "public"."points" from "service_role";

revoke select on table "public"."points" from "service_role";

revoke trigger on table "public"."points" from "service_role";

revoke truncate on table "public"."points" from "service_role";

revoke update on table "public"."points" from "service_role";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

revoke delete on table "public"."project_showcase_events" from "anon";

revoke insert on table "public"."project_showcase_events" from "anon";

revoke references on table "public"."project_showcase_events" from "anon";

revoke select on table "public"."project_showcase_events" from "anon";

revoke trigger on table "public"."project_showcase_events" from "anon";

revoke truncate on table "public"."project_showcase_events" from "anon";

revoke update on table "public"."project_showcase_events" from "anon";

revoke delete on table "public"."project_showcase_events" from "authenticated";

revoke insert on table "public"."project_showcase_events" from "authenticated";

revoke references on table "public"."project_showcase_events" from "authenticated";

revoke select on table "public"."project_showcase_events" from "authenticated";

revoke trigger on table "public"."project_showcase_events" from "authenticated";

revoke truncate on table "public"."project_showcase_events" from "authenticated";

revoke update on table "public"."project_showcase_events" from "authenticated";

revoke delete on table "public"."project_showcase_events" from "service_role";

revoke insert on table "public"."project_showcase_events" from "service_role";

revoke references on table "public"."project_showcase_events" from "service_role";

revoke select on table "public"."project_showcase_events" from "service_role";

revoke trigger on table "public"."project_showcase_events" from "service_role";

revoke truncate on table "public"."project_showcase_events" from "service_role";

revoke update on table "public"."project_showcase_events" from "service_role";

revoke delete on table "public"."project_showcase_slots" from "anon";

revoke insert on table "public"."project_showcase_slots" from "anon";

revoke references on table "public"."project_showcase_slots" from "anon";

revoke select on table "public"."project_showcase_slots" from "anon";

revoke trigger on table "public"."project_showcase_slots" from "anon";

revoke truncate on table "public"."project_showcase_slots" from "anon";

revoke update on table "public"."project_showcase_slots" from "anon";

revoke delete on table "public"."project_showcase_slots" from "authenticated";

revoke insert on table "public"."project_showcase_slots" from "authenticated";

revoke references on table "public"."project_showcase_slots" from "authenticated";

revoke select on table "public"."project_showcase_slots" from "authenticated";

revoke trigger on table "public"."project_showcase_slots" from "authenticated";

revoke truncate on table "public"."project_showcase_slots" from "authenticated";

revoke update on table "public"."project_showcase_slots" from "authenticated";

revoke delete on table "public"."project_showcase_slots" from "service_role";

revoke insert on table "public"."project_showcase_slots" from "service_role";

revoke references on table "public"."project_showcase_slots" from "service_role";

revoke select on table "public"."project_showcase_slots" from "service_role";

revoke trigger on table "public"."project_showcase_slots" from "service_role";

revoke truncate on table "public"."project_showcase_slots" from "service_role";

revoke update on table "public"."project_showcase_slots" from "service_role";

revoke delete on table "public"."projects" from "anon";

revoke insert on table "public"."projects" from "anon";

revoke references on table "public"."projects" from "anon";

revoke select on table "public"."projects" from "anon";

revoke trigger on table "public"."projects" from "anon";

revoke truncate on table "public"."projects" from "anon";

revoke update on table "public"."projects" from "anon";

revoke delete on table "public"."projects" from "authenticated";

revoke insert on table "public"."projects" from "authenticated";

revoke references on table "public"."projects" from "authenticated";

revoke select on table "public"."projects" from "authenticated";

revoke trigger on table "public"."projects" from "authenticated";

revoke truncate on table "public"."projects" from "authenticated";

revoke update on table "public"."projects" from "authenticated";

revoke delete on table "public"."projects" from "service_role";

revoke insert on table "public"."projects" from "service_role";

revoke references on table "public"."projects" from "service_role";

revoke select on table "public"."projects" from "service_role";

revoke trigger on table "public"."projects" from "service_role";

revoke truncate on table "public"."projects" from "service_role";

revoke update on table "public"."projects" from "service_role";

revoke delete on table "public"."push_subscriptions" from "anon";

revoke insert on table "public"."push_subscriptions" from "anon";

revoke references on table "public"."push_subscriptions" from "anon";

revoke select on table "public"."push_subscriptions" from "anon";

revoke trigger on table "public"."push_subscriptions" from "anon";

revoke truncate on table "public"."push_subscriptions" from "anon";

revoke update on table "public"."push_subscriptions" from "anon";

revoke delete on table "public"."push_subscriptions" from "authenticated";

revoke insert on table "public"."push_subscriptions" from "authenticated";

revoke references on table "public"."push_subscriptions" from "authenticated";

revoke select on table "public"."push_subscriptions" from "authenticated";

revoke trigger on table "public"."push_subscriptions" from "authenticated";

revoke truncate on table "public"."push_subscriptions" from "authenticated";

revoke update on table "public"."push_subscriptions" from "authenticated";

revoke delete on table "public"."push_subscriptions" from "service_role";

revoke insert on table "public"."push_subscriptions" from "service_role";

revoke references on table "public"."push_subscriptions" from "service_role";

revoke select on table "public"."push_subscriptions" from "service_role";

revoke trigger on table "public"."push_subscriptions" from "service_role";

revoke truncate on table "public"."push_subscriptions" from "service_role";

revoke update on table "public"."push_subscriptions" from "service_role";

revoke delete on table "public"."resources" from "anon";

revoke insert on table "public"."resources" from "anon";

revoke references on table "public"."resources" from "anon";

revoke select on table "public"."resources" from "anon";

revoke trigger on table "public"."resources" from "anon";

revoke truncate on table "public"."resources" from "anon";

revoke update on table "public"."resources" from "anon";

revoke delete on table "public"."resources" from "authenticated";

revoke insert on table "public"."resources" from "authenticated";

revoke references on table "public"."resources" from "authenticated";

revoke select on table "public"."resources" from "authenticated";

revoke trigger on table "public"."resources" from "authenticated";

revoke truncate on table "public"."resources" from "authenticated";

revoke update on table "public"."resources" from "authenticated";

revoke delete on table "public"."resources" from "service_role";

revoke insert on table "public"."resources" from "service_role";

revoke references on table "public"."resources" from "service_role";

revoke select on table "public"."resources" from "service_role";

revoke trigger on table "public"."resources" from "service_role";

revoke truncate on table "public"."resources" from "service_role";

revoke update on table "public"."resources" from "service_role";

revoke delete on table "public"."user_achievements" from "anon";

revoke insert on table "public"."user_achievements" from "anon";

revoke references on table "public"."user_achievements" from "anon";

revoke select on table "public"."user_achievements" from "anon";

revoke trigger on table "public"."user_achievements" from "anon";

revoke truncate on table "public"."user_achievements" from "anon";

revoke update on table "public"."user_achievements" from "anon";

revoke delete on table "public"."user_achievements" from "authenticated";

revoke insert on table "public"."user_achievements" from "authenticated";

revoke references on table "public"."user_achievements" from "authenticated";

revoke select on table "public"."user_achievements" from "authenticated";

revoke trigger on table "public"."user_achievements" from "authenticated";

revoke truncate on table "public"."user_achievements" from "authenticated";

revoke update on table "public"."user_achievements" from "authenticated";

revoke delete on table "public"."user_achievements" from "service_role";

revoke insert on table "public"."user_achievements" from "service_role";

revoke references on table "public"."user_achievements" from "service_role";

revoke select on table "public"."user_achievements" from "service_role";

revoke trigger on table "public"."user_achievements" from "service_role";

revoke truncate on table "public"."user_achievements" from "service_role";

revoke update on table "public"."user_achievements" from "service_role";

alter table "public"."notification_preferences" drop constraint "fk_notification_preferences_member";

alter table "public"."notification_preferences" drop constraint "unique_member_preferences";

drop function if exists "public"."update_notification_preferences_updated_at"();

drop view if exists "public"."project_showcase_slots_with_members";

alter table "public"."notification_preferences" drop constraint "notification_preferences_pkey";

drop index if exists "public"."idx_notification_preferences_member_id";

drop index if exists "public"."notification_preferences_pkey";

drop index if exists "public"."unique_member_preferences";

drop table "public"."notification_preferences";

alter table "public"."clans" add column "courses" integer;

alter table "public"."member_stats" drop column "discord_points";

alter table "public"."member_stats" add column "discord_streak" integer default 0;

alter table "public"."member_stats" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."members" add column "batch" text;

alter table "public"."members" add column "date_of_birth" date;

alter table "public"."members" alter column "joined_date" set data type text using "joined_date"::text;

alter table "public"."project_showcase_slots" disable row level security;

alter table "public"."push_subscriptions" add column "member_id" bigint;

alter table "public"."push_subscriptions" alter column "id" set default extensions.uuid_generate_v4();

drop sequence if exists "public"."notification_preferences_id_seq";

alter table "public"."push_subscriptions" add constraint "push_subscriptions_member_id_fkey" FOREIGN KEY (member_id) REFERENCES members(id) not valid;

alter table "public"."push_subscriptions" validate constraint "push_subscriptions_member_id_fkey";

set check_function_bodies = off;

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

CREATE OR REPLACE FUNCTION public.sync_bash_points()
 RETURNS void
 LANGUAGE sql
AS $function$ UPDATE public.members m SET bash_points = pt.total_points FROM ( SELECT member_id, SUM(points) AS total_points FROM public.points GROUP BY member_id ) AS pt WHERE m.id = pt.member_id; $function$
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

create or replace view "public"."project_showcase_slots_with_members" as  SELECT pss.id,
    pss.created_at,
    pss.updated_at,
    pss.member_id,
    pss.member_name,
    pss.member_github_username,
    pss.member_title,
    pss.slot_number,
    pss.allocated_at,
    pss.event_id,
    pss.event_name,
    pss.status,
    pss.metadata,
    m.avatar_url,
    m.bash_points,
    m.clan_name,
    m.basher_no
   FROM (project_showcase_slots pss
     JOIN members m ON ((pss.member_id = m.id)))
  ORDER BY pss.slot_number;


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

create policy "Enable insert for authenticated users only"
on "public"."push_subscriptions"
as permissive
for insert
to authenticated
with check (true);


create policy "auth users can see their subscription"
on "public"."push_subscriptions"
as permissive
for select
to authenticated
using (true);


create policy "Organisers can manage showcase events"
on "public"."project_showcase_events"
as permissive
for all
to authenticated
using ((( SELECT ((auth.jwt() -> 'user_metadata'::text) ->> 'user_name'::text) AS text) IN ( SELECT members.github_username
   FROM members
  WHERE (members.title = 'Organiser'::title_type))));


create policy "Enable delete for authenticated users only"
on "public"."push_subscriptions"
as permissive
for delete
to authenticated
using ((( SELECT ((auth.jwt() -> 'user_metadata'::text) ->> 'user_name'::text) AS text) IN ( SELECT members.github_username
   FROM members
  WHERE (members.title = 'Organiser'::title_type))));




