"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog"
import { Form } from "@remix-run/react"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

interface Member {
  username: string
  id: string
  name: string
  personal_email: string | null
  academic_email: string | null
  mobile_number: string | null
  whatsapp_number: string | null
  discord_username: string | null
  github_username: string | null
  hackerrank_username: string | null
  instagram_username: string | null
  personal_website: string | null
  linkedin_url: string | null
  avatar_url: string | null
  title: string | null
  basher_level: string | null
  bash_points: number | null
  clan_name: string | null
  basher_no: string | null
  joined_date: string | null
  portfolio_url: string | null
  resume_url: string | null
  primary_domain: string[] | null
  secondary_domain: string[] | null
  stats: {
    courses: number
    projects: number
    hackathons: number
    internships: number
    certifications: number
  } | null
  gpa: number | null
  weekly_bash_attendance: number | null
  testimony: string | null
  hobbies: string[] | null
  clan_id: number
  duolingo_username: string | null
}

interface EditProfileButtonProps {
  member: Member
}

export function EditProfileButton({ member }: EditProfileButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="sm"
        className="relative h-14 w-30  bg-[#4dc4f9]/10 hover:bg-[#4dc4f9]/20 transition-colors"
      >
        <Edit className="h-8 w-8 text-[#4dc4f9]" />
        <span className="text-[#4dc4f9]">Edit Profile</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
          </DialogHeader>

          <Form method="put" action={`/profile/${member.github_username}`} className="space-y-6 py-4">
            <input type="hidden" name="id" value={member.id} />
            <input type="hidden" name="clan_id" value={member.clan_id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={member.name} className="bg-gray-800 border-gray-700" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personal_email">Personal Email</Label>
                  <Input
                    id="personal_email"
                    name="personal_email"
                    defaultValue={member.personal_email || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academic_email">Academic Email</Label>
                  <Input
                    id="academic_email"
                    name="academic_email"
                    defaultValue={member.academic_email || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile_number">Mobile Number</Label>
                  <Input
                    id="mobile_number"
                    name="mobile_number"
                    defaultValue={member.mobile_number || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                  <Input
                    id="whatsapp_number"
                    name="whatsapp_number"
                    defaultValue={member.whatsapp_number || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    name="avatar_url"
                    defaultValue={member.avatar_url || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="joined_date">Joined Date</Label>
                  <Input
                    id="joined_date"
                    name="joined_date"
                    type="date"
                    defaultValue={member.joined_date || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testimony">Testimony</Label>
                  <Textarea
                    id="testimony"
                    name="testimony"
                    defaultValue={member.testimony || ""}
                    className="bg-gray-800 border-gray-700 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hobbies">Hobbies (comma separated)</Label>
                  <Input
                    id="hobbies"
                    name="hobbies"
                    defaultValue={member.hobbies?.join(", ") || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Select name="title" defaultValue={member.title || "Basher"}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Basher">Basher</SelectItem>
                      <SelectItem value="Captain Bash">Captain Bash</SelectItem>
                      <SelectItem value="Organiser">Organiser</SelectItem>
                      <SelectItem value="Mentor">Mentor</SelectItem>
                      <SelectItem value="Alumni">Alumni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="basher_level">Basher Level</Label>
                  <Input
                    id="basher_level"
                    name="basher_level"
                    defaultValue={member.basher_level || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bash_points">Bash Points</Label>
                  <Input
                    id="bash_points"
                    name="bash_points"
                    type="number"
                    defaultValue={member.bash_points?.toString() || "0"}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clan_name">Clan Name</Label>
                  <Input
                    id="clan_name"
                    name="clan_name"
                    defaultValue={member.clan_name || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="basher_no">Basher No</Label>
                  <Input
                    id="basher_no"
                    name="basher_no"
                    defaultValue={member.basher_no || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary_domain">Primary Domains (comma separated)</Label>
                  <Input
                    id="primary_domain"
                    name="primary_domain"
                    defaultValue={member.primary_domain?.join(", ") || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_domain">Secondary Domains (comma separated)</Label>
                  <Input
                    id="secondary_domain"
                    name="secondary_domain"
                    defaultValue={member.secondary_domain?.join(", ") || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    name="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    defaultValue={member.gpa?.toString() || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekly_bash_attendance">Weekly Bash Attendance (%)</Label>
                  <Input
                    id="weekly_bash_attendance"
                    name="weekly_bash_attendance"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={member.weekly_bash_attendance?.toString() || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Links</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github_username">GitHub Username</Label>
                  <Input
                    id="github_username"
                    name="github_username"
                    defaultValue={member.github_username || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discord_username">Discord Username</Label>
                  <Input
                    id="discord_username"
                    name="discord_username"
                    defaultValue={member.discord_username || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hackerrank_username">HackerRank Username</Label>
                  <Input
                    id="hackerrank_username"
                    name="hackerrank_username"
                    defaultValue={member.hackerrank_username || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram_username">Instagram Username</Label>
                  <Input
                    id="instagram_username"
                    name="instagram_username"
                    defaultValue={member.instagram_username || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    name="linkedin_url"
                    defaultValue={member.linkedin_url || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personal_website">Personal Website</Label>
                  <Input
                    id="personal_website"
                    name="personal_website"
                    defaultValue={member.personal_website || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio_url">Portfolio URL</Label>
                  <Input
                    id="portfolio_url"
                    name="portfolio_url"
                    defaultValue={member.portfolio_url || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume_url">Resume URL</Label>
                  <Input
                    id="resume_url"
                    name="resume_url"
                    defaultValue={member.resume_url || ""}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duolingo_username">Duolingo Username</Label>
                  <Input
                    id="duolingo_username"
                    name="duolingo_username"
                    defaultValue={member.duolingo_username || ""}
                    className="bg-gray-800 border-gray-700"
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
                    defaultValue={member.stats?.courses.toString() || "0"}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projects">Projects</Label>
                  <Input
                    id="projects"
                    name="projects"
                    type="number"
                    defaultValue={member.stats?.projects.toString() || "0"}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hackathons">Hackathons</Label>
                  <Input
                    id="hackathons"
                    name="hackathons"
                    type="number"
                    defaultValue={member.stats?.hackathons.toString() || "0"}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internships">Internships</Label>
                  <Input
                    id="internships"
                    name="internships"
                    type="number"
                    defaultValue={member.stats?.internships.toString() || "0"}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Input
                    id="certifications"
                    name="certifications"
                    type="number"
                    defaultValue={member.stats?.certifications.toString() || "0"}
                    className="bg-gray-800 border-gray-700"
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
  )
}