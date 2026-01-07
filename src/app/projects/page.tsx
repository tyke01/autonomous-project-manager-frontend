"use client";

import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createProject } from "@/actions/projects";
import { CircleArrowOutUpRight, SquareArrowOutUpRight } from "lucide-react";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  goal: z.string().min(10, "Goal must be at least 10 characters"),
  deadline: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function ProjectsPage() {
  const { projects, loading, deleteProject, refresh } = useProjects();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false); // Control dialog state

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const project = await createProject(data);
      setOpen(false); // Close dialog
      reset(); // Reset form
      refresh(); // Refresh project list
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading projects...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              New Project
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-131.25">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>
                  Fill in the details for your new project.
                </DialogDescription>
              </DialogHeader>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                  {error}
                </div>
              )}

              <div className="grid gap-4 py-4">
                <div className="grid gap-3">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    {...register("title")}
                    type="text"
                    id="title"
                    placeholder="e.g., Build Autonomous Robot"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="goal">Project Goal</Label>
                  <textarea
                    {...register("goal")}
                    id="goal"
                    rows={5}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="Describe your project in detail..."
                  />
                  {errors.goal && (
                    <p className="text-red-500 text-sm">
                      {errors.goal.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="deadline">Deadline (optional)</Label>
                  <Input {...register("deadline")} type="date" id="deadline" />
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {isSubmitting ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 flex flex-col md:flex-row gap-6">
        {projects.map((project: any) => (
          <div key={project.id} className="border p-4 rounded-lg">
            <div className="flex flex-col justify-between items-start">
              <div className="flex-1">
                <Link
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-4 group mb-4"
                >
                  <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h2>
                  <SquareArrowOutUpRight className="w-5 group-hover:text-blue-600 transition-colors" />
                </Link>

                <p className="text-gray-400 mt-1 max-w-2xl">{project.goal}</p>
                <div className="mt-2 flex gap-2 text-sm">
                  <span className="bg-green-500 text-white px-2 py-1 rounded">
                    {project.status}
                  </span>
                  <span className="bg-neutral-500 text-white px-2 py-1 rounded">
                    {project.total_estimated_days} days total
                  </span>
                  <span className="bg-neutral-500 text-white px-2 py-1 rounded">
                    {project.tasks.length} tasks
                  </span>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="mt-6 cursor-pointer"
                  >
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Project</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this project? This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => deleteProject(project.id)}
                      variant="destructive"
                      className="cursor-pointer"
                    >
                      Confirm Delete
                    </Button>

                    <DialogClose asChild>
                      <Button variant="outline" className="cursor-pointer">
                        Cancel
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            No projects yet. Create your first one!
          </p>
        )}
      </div>
    </div>
  );
}
