'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Edit, User, Shield, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';
import { Form } from '@remix-run/react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface Member {
  username: string;
  id: string;
  name: string;
  personal_email: string | null;
  academic_email: string | null;
  mobile_number: string | null;
  whatsapp_number: string | null;
  discord_username: string | null;
  github_username: string | null;
  hackerrank_username: string | null;
  instagram_username: string | null;
  personal_website: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  title: string | null;
  basher_level: string | null;
  bash_points: number | null;
  clan_name: string | null;
  basher_no: string | null;
  joined_date: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  primary_domain: string[] | null;
  secondary_domain: string[] | null;
  stats: {
    courses: number;
    projects: number;
    hackathons: number;
    internships: number;
    certifications: number;
  } | null;
  gpa: number | null;
  weekly_bash_attendance: number | null;
  testimony: string | null;
  hobbies: string[] | null;
  clan_id: number;
  duolingo_username: string | null;
  roll_number: string | null;
  leetcode_username: string | null;
}

interface EditProfileButtonProps {
  member: Member;
  isOrganiser?: boolean;
  canEdit?: boolean;
}

// Helper component for field labels with edit indicators
function FieldLabel({ 
  children, 
  htmlFor, 
  canEditByNonOrganizer = true, 
  isOrganiser = false,
  tooltip = ''
}: { 
  children: React.ReactNode; 
  htmlFor: string;
  canEditByNonOrganizer?: boolean;
  isOrganiser?: boolean;
  tooltip?: string;
}) {
  return (
    <Label htmlFor={htmlFor} className="flex items-center gap-2">
      {children}
      {/* Only show user icon on fields that non-organizers can edit */}
      {!isOrganiser && canEditByNonOrganizer && (
        <span title="You can edit this field">
          <User className="h-3 w-3 text-blue-400" />
        </span>
      )}
      {/* Organizers see a green shield on all fields to show their privileges */}
      {isOrganiser && (
        <span title="Organizer access - you can edit this field">
          <Shield className="h-3 w-3 text-green-400" />
        </span>
      )}
      {/* Info tooltip for additional context (optional) */}
      {tooltip && (
        <span title={tooltip}>
          <Info className="h-3 w-3 text-gray-400" />
        </span>
      )}
    </Label>
  );
}

export function EditProfileButton({ member, isOrganiser = false, canEdit = false }: EditProfileButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Helper to determine if field should be readonly for non-organizers
  const isFieldRestricted = !isOrganiser;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-white/10"
        // className="relative h-14 w-30  bg-[#4dc4f9]/10 hover:bg-[#4dc4f9]/20 transition-colors"
      >
        <Edit className="h-5 w-5 text-grey-400" />
        {/* <span className="text-[#4dc4f9]">Edit Profile</span> */}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Edit Profile
            </DialogTitle>
          </DialogHeader>

          <Form
            method="put"
            action={`/profile/${member.github_username}?bypass=true`}
            className="space-y-6 py-4"
          >
            <input type="hidden" name="id" value={member.id} />
            <input type="hidden" name="clan_id" value={member.clan_id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="name" 
                    canEditByNonOrganizer={false}
                    isOrganiser={isOrganiser}
                    tooltip="Full name as it should appear"
                  >
                    Name
                  </FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={member.name}
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="personal_email" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="Your personal email address"
                  >
                    Personal Email
                  </FieldLabel>
                  <Input
                    id="personal_email"
                    name="personal_email"
                    defaultValue={member.personal_email || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="academic_email" 
                    canEditByNonOrganizer={false}
                    isOrganiser={isOrganiser}
                    tooltip="Your academic/university email"
                  >
                    Academic Email
                  </FieldLabel>
                  <Input
                    id="academic_email"
                    name="academic_email"
                    defaultValue={member.academic_email || ''}
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="mobile_number" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="Your mobile phone number"
                  >
                    Mobile Number
                  </FieldLabel>
                  <Input
                    id="mobile_number"
                    name="mobile_number"
                    defaultValue={member.mobile_number || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="whatsapp_number" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="Your WhatsApp number"
                  >
                    WhatsApp Number
                  </FieldLabel>
                  <Input
                    id="whatsapp_number"
                    name="whatsapp_number"
                    defaultValue={member.whatsapp_number || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="avatar_url" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="URL to your profile picture"
                  >
                    Avatar URL
                  </FieldLabel>
                  <Input
                    id="avatar_url"
                    name="avatar_url"
                    defaultValue={member.avatar_url || ''}
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="joined_date" 
                    canEditByNonOrganizer={false}
                    isOrganiser={isOrganiser}
                    tooltip="Date when member joined - only organizers can modify"
                  >
                    Joined Date
                  </FieldLabel>
                  <Input
                    id="joined_date"
                    name="joined_date"
                    type="date"
                    defaultValue={member.joined_date || ''}
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="testimony" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="Your personal testimony or bio"
                  >
                    Testimony
                  </FieldLabel>
                  <Textarea
                    id="testimony"
                    name="testimony"
                    defaultValue={member.testimony || ''}
                    className="bg-gray-800 border-gray-700 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="hobbies" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="List your hobbies separated by commas"
                  >
                    Hobbies (comma separated)
                  </FieldLabel>
                  <Input
                    id="hobbies"
                    name="hobbies"
                    defaultValue={member.hobbies?.join(', ') || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Professional Information
                </h3>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="title" 
                    canEditByNonOrganizer={false}
                    isOrganiser={isOrganiser}
                    tooltip="User role/title - only organizers can change this"
                  >
                    Title
                  </FieldLabel>
                  <Select name="title" defaultValue={member.title || 'Basher'} disabled={isFieldRestricted}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Basher">Basher</SelectItem>
                      <SelectItem value="Captain Bash">Captain Bash</SelectItem>
                      <SelectItem value="Organiser">Organiser</SelectItem>
                      <SelectItem value="Mentor">Mentor</SelectItem>
                      <SelectItem value="Alumni">Alumni</SelectItem>
                      <SelectItem value="Legacy Basher">Legacy Basher</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Hidden input to ensure title is submitted even when Select is disabled */}
                  {isFieldRestricted && (
                    <input type="hidden" name="title" value={member.title || 'Basher'} />
                  )}
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="basher_level" 
                    canEditByNonOrganizer={false}
                    isOrganiser={isOrganiser}
                    tooltip="Basher experience level - only organizers can change this"
                  >
                    Basher Level
                  </FieldLabel>
                  <Input
                    id="basher_level"
                    name="basher_level"
                    defaultValue={member.basher_level || ''}
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="bash_points" 
                    canEditByNonOrganizer={false}
                    isOrganiser={isOrganiser}
                    tooltip="Points earned in activities - automatically calculated, cannot be manually edited"
                  >
                    Bash Points
                  </FieldLabel>
                  <Input
                    id="bash_points"
                    name="bash_points"
                    type="number"
                    defaultValue={member.bash_points?.toString() || '0'}
                    className="bg-gray-800 border-gray-700"
                    readOnly={true}
                    disabled={true}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="clan_name" 
                    canEditByNonOrganizer={false}
                    isOrganiser={isOrganiser}
                    tooltip="Member's clan assignment - only organizers can change"
                  >
                    Clan Name
                  </FieldLabel>
                  <Input
                    id="clan_name"
                    name="clan_name"
                    defaultValue={member.clan_name || ''}
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="basher_no" 
                    canEditByNonOrganizer={false}
                    isOrganiser={isOrganiser}
                    tooltip="Official basher number - only organizers can assign"
                  >
                    Basher No
                  </FieldLabel>
                  <Input
                    id="basher_no"
                    name="basher_no"
                    defaultValue={member.basher_no || ''}
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="primary_domain" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="Your main areas of expertise (comma separated)"
                  >
                    Primary Domains (comma separated)
                  </FieldLabel>
                  <Input
                    id="primary_domain"
                    name="primary_domain"
                    defaultValue={member.primary_domain?.join(', ') || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="secondary_domain" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="Your secondary areas of interest (comma separated)"
                  >
                    Secondary Domains (comma separated)
                  </FieldLabel>
                  <Input
                    id="secondary_domain"
                    name="secondary_domain"
                    defaultValue={member.secondary_domain?.join(', ') || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="gpa" 
                    canEditByNonOrganizer={false}
                    isOrganiser={isOrganiser}
                    tooltip="Your current GPA"
                  >
                    GPA
                  </FieldLabel>
                  <Input
                    id="gpa"
                    name="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    defaultValue={member.gpa?.toString() || ''}
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekly_bash_attendance">
                    Weekly Bash Attendance (%)
                  </Label>
                  <Input
                    id="weekly_bash_attendance"
                    name="weekly_bash_attendance"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={
                      member.weekly_bash_attendance?.toString() || ''
                    }
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Links</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="github_username" 
                    canEditByNonOrganizer={false}
                    isOrganiser={isOrganiser}
                    tooltip="Your GitHub username"
                  >
                    GitHub Username
                  </FieldLabel>
                  <Input
                    id="github_username"
                    name="github_username"
                    defaultValue={member.github_username || ''}
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="discord_username" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="Your Discord username"
                  >
                    Discord Username
                  </FieldLabel>
                  <Input
                    id="discord_username"
                    name="discord_username"
                    defaultValue={member.discord_username || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="hackerrank_username" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="Your HackerRank username"
                  >
                    HackerRank Username
                  </FieldLabel>
                  <Input
                    id="hackerrank_username"
                    name="hackerrank_username"
                    defaultValue={member.hackerrank_username || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="instagram_username" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="Your Instagram username"
                  >
                    Instagram Username
                  </FieldLabel>
                  <Input
                    id="instagram_username"
                    name="instagram_username"
                    defaultValue={member.instagram_username || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="linkedin_url" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="Your LinkedIn profile URL"
                  >
                    LinkedIn URL
                  </FieldLabel>
                  <Input
                    id="linkedin_url"
                    name="linkedin_url"
                    defaultValue={member.linkedin_url || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="personal_website" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="Your personal website URL"
                  >
                    Personal Website
                  </FieldLabel>
                  <Input
                    id="personal_website"
                    name="personal_website"
                    defaultValue={member.personal_website || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="portfolio_url" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="Your portfolio website URL"
                  >
                    Portfolio URL
                  </FieldLabel>
                  <Input
                    id="portfolio_url"
                    name="portfolio_url"
                    defaultValue={member.portfolio_url || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="resume_url" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="URL to your resume/CV"
                  >
                    Resume URL
                  </FieldLabel>
                  <Input
                    id="resume_url"
                    name="resume_url"
                    defaultValue={member.resume_url || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="duolingo_username" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="Your Duolingo username"
                  >
                    Duolingo Username
                  </FieldLabel>
                  <Input
                    id="duolingo_username"
                    name="duolingo_username"
                    defaultValue={member.duolingo_username || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="leetcode_username" 
                    canEditByNonOrganizer={true}
                    isOrganiser={isOrganiser}
                    tooltip="Your LeetCode username"
                  >
                    LeetCode Username
                  </FieldLabel>
                  <Input
                    id="leetcode_username"
                    name="leetcode_username"
                    defaultValue={member.leetcode_username || ''}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel 
                    htmlFor="roll_number" 
                    canEditByNonOrganizer={false}
                    isOrganiser={isOrganiser}
                    tooltip="Official roll number - only organizers can change"
                  >
                    Roll Number
                  </FieldLabel>
                  <Input
                    id="roll_number"
                    name="roll_number"
                    defaultValue={member.roll_number || ''}
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stats</h3>

              <div className="space-y-2">
                <Label htmlFor="courses">Courses</Label>
                <Input
                  id="courses"
                  name="courses"
                  type="number"
                  defaultValue={member.stats?.courses.toString() || '0'}
                  className="bg-gray-800 border-gray-700"
                  readOnly={isFieldRestricted}
                  disabled={false}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projects">Projects</Label>
                  <Input
                    id="projects"
                    name="projects"
                    type="number"
                    defaultValue={member.stats?.projects.toString() || '0'}
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hackathons">Hackathons</Label>
                  <Input
                    id="hackathons"
                    name="hackathons"
                    type="number"
                    defaultValue={member.stats?.hackathons.toString() || '0'}
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internships">Internships</Label>
                  <Input
                    id="internships"
                    name="internships"
                    type="number"
                    defaultValue={member.stats?.internships.toString() || '0'}
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Input
                    id="certifications"
                    name="certifications"
                    type="number"
                    defaultValue={
                      member.stats?.certifications.toString() || '0'
                    }
                    className="bg-gray-800 border-gray-700"
                    readOnly={isFieldRestricted}
                    disabled={false}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsOpen(false)}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
