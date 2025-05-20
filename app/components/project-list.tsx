import { useState } from "react"
import { Check, Edit, Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface Project {
  id: number
  title: string
  description: string
  domain_id: number
  difficulty_level: string
  member_id: number
  created_at: string
  member_name: string | null
  status: string | null
}

interface Member {
  id: number
  name: string
}

interface ProjectListProps {
  initialProjects: Project[]
  initialMembers: Member[]
}

export default function ProjectList({ initialProjects, initialMembers }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [members] = useState<Member[]>(initialMembers)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [updatedMemberName, setUpdatedMemberName] = useState("")
  const [updatedStatus, setUpdatedStatus] = useState("")
  const [updating, setUpdating] = useState(false)

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    setUpdatedMemberName(project.member_name || "")
    setUpdatedStatus(project.status || "")
    setIsUpdateDialogOpen(true)
  }

  const handleUpdateProject = async () => {
    if (!selectedProject) return

    setUpdating(true)

    try {
      const response = await fetch('/api/update-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          memberName: updatedMemberName,
          status: updatedStatus,
        }),
      });

      if (response.ok) {
        setProjects(
          projects.map((project) =>
            project.id === selectedProject.id
              ? { ...project, member_name: updatedMemberName, status: updatedStatus }
              : project,
          ),
        )
        setIsUpdateDialogOpen(false)
      }
    } catch (error) {
      console.error("Error updating project:", error)
    } finally {
      setUpdating(false)
    }
  }

  const statusOptions = ["Not Started", "In Progress", "Completed", "On Hold", "Cancelled"]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#00ff9d] font-mono px-4 py-8 relative overflow-hidden">
      {/* Terminal background grid */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="h-full w-full bg-grid-pattern"></div>
      </div>

      {/* Scanline effect */}
      <div className="scanline"></div>

      <div className="relative z-10">
        <Card className="bg-[#111] border border-[#00ff9d]/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#00ff9d] flex items-center gap-2">
              <span>🚀</span> Project Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[#00ff9d]/30">
                  <TableHead className="text-[#00ff9d]">ID</TableHead>
                  <TableHead className="text-[#00ff9d]">Title</TableHead>
                  <TableHead className="text-[#00ff9d]">Difficulty</TableHead>
                  <TableHead className="text-[#00ff9d]">Member Name</TableHead>
                  <TableHead className="text-[#00ff9d]">Status</TableHead>
                  <TableHead className="text-[#00ff9d]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} className="border-[#00ff9d]/30">
                    <TableCell className="font-medium">{project.id}</TableCell>
                    <TableCell>{project.title}</TableCell>
                    <TableCell>{project.difficulty_level}</TableCell>
                    <TableCell>{project.member_name || "Not assigned"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          project.status === "Completed"
                            ? "bg-green-900/50 text-green-300"
                            : project.status === "In Progress"
                              ? "bg-blue-900/50 text-blue-300"
                              : project.status === "On Hold"
                                ? "bg-yellow-900/50 text-yellow-300"
                                : project.status === "Cancelled"
                                  ? "bg-red-900/50 text-red-300"
                                  : "bg-gray-900/50 text-gray-300"
                        }`}
                      >
                        {project.status || "Not Started"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#00ff9d]/50 text-[#00ff9d] hover:bg-[#00ff9d]/20"
                        onClick={() => handleProjectSelect(project)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="bg-[#111] border border-[#00ff9d]/50 text-[#00ff9d]">
          <DialogHeader>
            <DialogTitle className="text-[#00ff9d]">Update Project: {selectedProject?.title}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="member_name" className="text-sm">
                Member Name
              </label>
              <Select value={updatedMemberName} onValueChange={setUpdatedMemberName}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#00ff9d]/50">
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#00ff9d]/50">
                  <SelectItem value="not_assigned">Not assigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm">
                Status
              </label>
              <Select value={updatedStatus} onValueChange={setUpdatedStatus}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#00ff9d]/50">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-[#00ff9d]/50">
                  <SelectItem value="not_started">Not Started</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
              className="border-[#00ff9d]/50 text-[#00ff9d] hover:bg-[#00ff9d]/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProject}
              className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
              disabled={updating}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Update Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
