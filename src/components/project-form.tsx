"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createProject } from "@/actions/projects";

// Zod validation schema
const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  goal: z.string().min(10, "Goal must be at least 10 characters"),
  deadline: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function ProjectForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      const project = await createProject(data);
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Project Title</label>
        <input
          {...register("title")}
          type="text"
          className="w-full border rounded-lg px-4 py-2"
          placeholder="e.g., Build Autonomous Robot"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Project Goal</label>
        <textarea
          {...register("goal")}
          rows={5}
          className="w-full border rounded-lg px-4 py-2"
          placeholder="Describe your project in detail..."
        />
        {errors.goal && (
          <p className="text-red-500 text-sm mt-1">{errors.goal.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Deadline (optional)</label>
        <input
          {...register("deadline")}
          type="date"
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isSubmitting ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
}