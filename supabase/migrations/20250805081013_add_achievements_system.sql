-- Migration: Add Achievements System
-- Created: 2025-08-05

-- Create enum types for achievements
CREATE TYPE achievement_category AS ENUM (
    'coding',
    'community', 
    'special',
    'milestone',
    'event'
);

CREATE TYPE achievement_rarity AS ENUM (
    'common',
    'rare',
    'epic',
    'legendary'
);

-- Create achievements table
CREATE TABLE achievements (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(10) NOT NULL,
    category achievement_category NOT NULL,
    rarity achievement_rarity NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    requirements TEXT,
    unlock_condition TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    awarded_by BIGINT REFERENCES members(id), -- Admin who awarded it
    note TEXT, -- Admin note
    is_visible BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(user_id, achievement_id) -- Prevent duplicate achievements
);

-- Create indexes for better performance
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
CREATE INDEX idx_achievements_is_active ON achievements(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements table
CREATE POLICY "Achievements are viewable by everyone" ON achievements
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage achievements" ON achievements
    FOR ALL USING (
        (SELECT (auth.jwt()->'user_metadata'->>'user_name')::text) IN (
            SELECT github_username FROM members WHERE title = 'Organiser'
        )
    );

-- RLS Policies for user_achievements table
CREATE POLICY "User achievements are viewable by everyone" ON user_achievements
    FOR SELECT USING (true);

CREATE POLICY "Only admins can award achievements" ON user_achievements
    FOR INSERT WITH CHECK (
        (SELECT (auth.jwt()->'user_metadata'->>'user_name')::text) IN (
            SELECT github_username FROM members WHERE title = 'Organiser'
        )
    );

CREATE POLICY "Only admins can modify user achievements" ON user_achievements
    FOR UPDATE USING (
        (SELECT (auth.jwt()->'user_metadata'->>'user_name')::text) IN (
            SELECT github_username FROM members WHERE title = 'Organiser'
        )
    );

CREATE POLICY "Only admins can delete user achievements" ON user_achievements
    FOR DELETE USING (
        (SELECT (auth.jwt()->'user_metadata'->>'user_name')::text) IN (
            SELECT github_username FROM members WHERE title = 'Organiser'
        )
    );

-- Insert default achievements
INSERT INTO achievements (id, name, description, icon, category, rarity, points, requirements, is_active) VALUES
('first_contribution', 'First Steps', 'Made your first contribution to the community', '🎯', 'milestone', 'common', 10, 'Make your first contribution', true),
('code_reviewer', 'Code Reviewer', 'Provided valuable code review feedback', '👀', 'coding', 'rare', 25, 'Complete 5 code reviews', true),
('mentor', 'Mentor', 'Helped guide other community members', '🧑‍🏫', 'community', 'epic', 50, 'Mentor new members', true),
('hackathon_winner', 'Hackathon Champion', 'Won a community hackathon', '🏆', 'event', 'legendary', 100, 'Win a hackathon', true),
('bug_hunter', 'Bug Hunter', 'Found and reported critical bugs', '🐛', 'coding', 'rare', 30, 'Report 3 critical bugs', true),
('community_leader', 'Community Leader', 'Demonstrated exceptional leadership in the community', '👑', 'special', 'legendary', 150, 'Exceptional leadership contribution', true),
('early_adopter', 'Early Adopter', 'One of the first members to join the community', '🚀', 'special', 'epic', 75, 'Join within first 100 members', true),
('points_milestone_100', 'Century Club', 'Earned 100 bash points', '💯', 'milestone', 'common', 20, 'Earn 100 bash points', true),
('points_milestone_500', 'Elite Basher', 'Earned 500 bash points', '⚡', 'milestone', 'rare', 40, 'Earn 500 bash points', true),
('points_milestone_1000', 'Legendary Basher', 'Earned 1000 bash points', '🌟', 'milestone', 'legendary', 100, 'Earn 1000 bash points', true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for achievements table
CREATE TRIGGER update_achievements_updated_at
    BEFORE UPDATE ON achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE achievements IS 'Stores all available achievements that can be earned by community members';
COMMENT ON TABLE user_achievements IS 'Tracks which achievements each user has unlocked';
COMMENT ON COLUMN user_achievements.awarded_by IS 'References the admin member who manually awarded this achievement';
COMMENT ON COLUMN user_achievements.note IS 'Optional note from admin when awarding achievement';
COMMENT ON COLUMN user_achievements.is_visible IS 'Whether this achievement should be displayed on the user profile';
