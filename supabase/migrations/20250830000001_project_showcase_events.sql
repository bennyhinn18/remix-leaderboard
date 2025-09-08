-- Create table for managing multiple project showcase events
CREATE TABLE IF NOT EXISTS "public"."project_showcase_events" (
    "id" BIGSERIAL PRIMARY KEY,
    "event_id" TEXT UNIQUE NOT NULL,
    "event_name" TEXT NOT NULL,
    "description" TEXT,
    "event_date" DATE,
    "event_time" TIME,
    "venue" TEXT,
    "max_slots" INTEGER DEFAULT 25 CHECK (max_slots > 0 AND max_slots <= 100),
    "hosting_clan_id" BIGINT,
    "registration_start" TIMESTAMP WITH TIME ZONE,
    "registration_end" TIMESTAMP WITH TIME ZONE,
    "presentation_duration" INTEGER DEFAULT 10, -- minutes
    "qa_duration" INTEGER DEFAULT 5, -- minutes
    "status" TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'completed', 'cancelled')),
    "requirements" JSONB DEFAULT '{}',
    "prizes" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "created_by" BIGINT,
    CONSTRAINT fk_hosting_clan FOREIGN KEY (hosting_clan_id) REFERENCES clans(id),
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES members(id)
);

-- Add RLS policies
ALTER TABLE "public"."project_showcase_events" ENABLE ROW LEVEL SECURITY;

-- Policy for reading events (anyone can view open events)
CREATE POLICY "Anyone can view open showcase events" ON "public"."project_showcase_events"
    FOR SELECT USING (status IN ('open', 'completed'));

-- Policy for organisers to manage events
CREATE POLICY "Organisers can manage showcase events" ON "public"."project_showcase_events"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.user_id = auth.uid() 
            AND members.title = 'Organiser'
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_project_showcase_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_showcase_events_updated_at
    BEFORE UPDATE ON "public"."project_showcase_events"
    FOR EACH ROW
    EXECUTE FUNCTION update_project_showcase_events_updated_at();

-- Update existing project_showcase_slots table to reference events table
ALTER TABLE "public"."project_showcase_slots" 
ADD COLUMN IF NOT EXISTS "showcase_event_id" BIGINT REFERENCES project_showcase_events(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_project_showcase_events_status ON project_showcase_events(status);
CREATE INDEX IF NOT EXISTS idx_project_showcase_events_date ON project_showcase_events(event_date);
CREATE INDEX IF NOT EXISTS idx_project_showcase_slots_event ON project_showcase_slots(showcase_event_id);

-- Insert the current event as the first entry
INSERT INTO "public"."project_showcase_events" (
    event_id, 
    event_name, 
    description,
    event_date,
    venue,
    max_slots,
    hosting_clan_id,
    status,
    created_at
) VALUES (
    'project-showcase-2025',
    'Project Showcase 2025',
    'An exclusive opportunity for Bashers to present their innovative projects and showcase their skills to the community.',
    '2025-08-30',
    'Main Auditorium',
    25,
    NULL, -- Allow NULL for hosting clan in case clans don't exist
    'open',
    NOW()
) ON CONFLICT (event_id) DO NOTHING;

-- Create view for events with clan information
CREATE OR REPLACE VIEW "public"."project_showcase_events_with_clans" AS
SELECT 
    pse.*,
    c.clan_name as hosting_clan_name,
    (SELECT COUNT(*) FROM project_showcase_slots pss WHERE pss.event_id = pse.event_id) as allocated_slots,
    (pse.max_slots - (SELECT COUNT(*) FROM project_showcase_slots pss WHERE pss.event_id = pse.event_id)) as available_slots
FROM project_showcase_events pse
LEFT JOIN clans c ON pse.hosting_clan_id = c.id;

-- Grant permissions
GRANT SELECT ON "public"."project_showcase_events_with_clans" TO authenticated;
GRANT SELECT ON "public"."project_showcase_events_with_clans" TO anon;
