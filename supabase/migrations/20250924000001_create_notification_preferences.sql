-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "id" BIGSERIAL PRIMARY KEY,
    "member_id" BIGINT NOT NULL,
    "push_enabled" BOOLEAN DEFAULT true,
    "email_enabled" BOOLEAN DEFAULT true,
    "in_app_enabled" BOOLEAN DEFAULT true,
    "announcement_notifications" BOOLEAN DEFAULT true,
    "event_notifications" BOOLEAN DEFAULT true,
    "points_notifications" BOOLEAN DEFAULT true,
    "system_notifications" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_notification_preferences_member 
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    CONSTRAINT unique_member_preferences UNIQUE (member_id)
);

-- Add RLS policies
ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own preferences
CREATE POLICY "Users can manage their own notification preferences" 
ON "public"."notification_preferences"
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM members 
        WHERE members.id = notification_preferences.member_id 
        AND members.user_id = auth.uid()
    )
);

-- Policy for organisers to view all preferences (for admin purposes)
CREATE POLICY "Organisers can view all notification preferences" 
ON "public"."notification_preferences"
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM members 
        WHERE members.user_id = auth.uid() 
        AND members.title = 'Organiser'
    )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON "public"."notification_preferences"
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_member_id 
ON notification_preferences(member_id);

-- Insert default preferences for existing members
INSERT INTO "public"."notification_preferences" (
    member_id,
    push_enabled,
    email_enabled,
    in_app_enabled,
    announcement_notifications,
    event_notifications,
    points_notifications,
    system_notifications,
    created_at
)
SELECT 
    id as member_id,
    true as push_enabled,
    true as email_enabled,
    true as in_app_enabled,
    true as announcement_notifications,
    true as event_notifications,
    true as points_notifications,
    true as system_notifications,
    NOW() as created_at
FROM members
WHERE id NOT IN (
    SELECT member_id FROM notification_preferences
)
ON CONFLICT (member_id) DO NOTHING;

-- Grant permissions
GRANT ALL ON "public"."notification_preferences" TO authenticated;
GRANT USAGE ON SEQUENCE notification_preferences_id_seq TO authenticated;