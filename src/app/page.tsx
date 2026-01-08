"use client";

import { Progress } from "@/components/ui/progress";
import { useProjects } from "@/hooks/useProjects";
import { Task } from "@/types/types";
import {
  Brain,
  Calendar,
  ChartLine,
  CircleCheck,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { projects, loading } = useProjects();

  // Calculate statistics
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;
  const totalTasks = projects.reduce(
    (sum: number, p) => sum + p.tasks.length,
    0
  );
  const completedTasks = projects.reduce(
    (total: number, project) =>
      total +
      project.tasks.filter((task: Task) => task.status === "completed").length,
    0
  );
  const totalEstimatedDays = projects.reduce(
    (sum: number, p) => sum + p.total_estimated_days,
    0
  );
  const totalRemainingDays = projects.reduce(
    (sum: number, p) => sum + p.remaining_days,
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <section className="px-6 pb-6 w-full">
      {/* Header */}
      <div className="mt-4 mb-8">
        <h1 className="text-4xl lg:text-5xl 2xl:text-6xl font-bold bg-linear-to-r from-neutral-400 to-gray-600 bg-clip-text text-transparent">
          Welcome Victor
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Here's what's happening with your projects today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8  w-full">
        {/* Total Projects */}
        <div className="bg-linear-to-br from-neutral-900 to-neutral-800 p-6 rounded-xl border border-neutral-700 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Projects</p>
              <p className="text-4xl font-bold text-white">{projects.length}</p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <ChartLine className="text-purple-400 h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-400">{activeProjects} active</span>
            <span className="text-slate-500">•</span>
            <span className="text-blue-400">{completedProjects} completed</span>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-linear-to-br from-neutral-900 to-neutral-800 p-6 rounded-xl border border-neutral-700 hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Tasks</p>
              <p className="text-4xl font-bold text-white">{totalTasks}</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <ClipboardList className="text-blue-400 h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Progress
              value={(completedTasks / totalTasks) * 100 || 0}
              className="flex-1 h-2"
            />
            <span className="text-slate-400 text-sm">
              {Math.round((completedTasks / totalTasks) * 100) || 0}%
            </span>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="bg-linear-to-br from-neutral-900 to-neutral-800 p-6 rounded-xl border border-neutral-700 hover:border-green-500/50 transition-all shadow-lg hover:shadow-green-500/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Tasks Completed</p>
              <p className="text-4xl font-bold text-white">{completedTasks}</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <ClipboardCheck className="text-green-400 h-6 w-6" />
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            {totalTasks - completedTasks} remaining
          </p>
        </div>

        {/* Time Estimates */}
        <div className="bg-linear-to-br from-neutral-900 to-neutral-800 p-6 rounded-xl border border-neutral-700 hover:border-yellow-500/50 transition-all shadow-lg hover:shadow-yellow-500/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Days Remaining</p>
              <p className="text-4xl font-bold text-white">
                {totalRemainingDays}
              </p>
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Clock className="text-yellow-400 h-6 w-6" />
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            {totalEstimatedDays} days total
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col w-full gap-6 ">
        <div className="flex gap-4">
          {/* Active Projects - Takes 2 columns */}
          <div className="">
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Active Projects
                </h2>
                <Link
                  href="/projects"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  View all
                  <TrendingUp className="h-4 w-4" />
                </Link>
              </div>
              {projects.filter((p) => p.status === "active").length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No active projects</p>
                  <Link
                    href="/projects"
                    className="text-purple-400 hover:text-purple-300 mt-2 inline-block"
                  >
                    Create your first project
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects
                    .filter((p) => p.status === "active")
                    .slice(0, 3)
                    .map((project) => {
                      const progress =
                        (project.tasks.filter(
                          (t: Task) => t.status === "completed"
                        ).length /
                          project.tasks.length) *
                          100 || 0;
                      return (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="block bg-neutral-800 hover:bg-neutral-750 p-4 rounded-lg border border-neutral-700 hover:border-purple-500/50 transition-all"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {project.title}
                              </h3>
                              <p className="text-slate-400 text-sm line-clamp-1">
                                {project.goal}
                              </p>
                            </div>
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs ml-4">
                              {project.tasks.length} tasks
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Progress</span>
                              <span className="text-white font-medium">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="flex justify-between items-center text-xs text-slate-400 mt-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{project.remaining_days} days left</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {project.actual_days_spent}/
                                  {project.total_estimated_days} days
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
          {/* AI Model Info - Takes 1 column */}
          <div className="space-y-6 min-w-lg">
            {/* Model Card */}
            <div className="bg-linear-to-br from-neutral-900/30 to-zinc-900/30 rounded-xl border border-gray-500/30 p-6 w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-sky-500/20 p-3 rounded-lg">
                  <Brain className="h-6 w-6 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Model</h3>
                  <p className="text-sky-300 text-sm">Powered by OpenRouter</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-black/20 rounded-lg p-3 border border-zinc-500/20">
                  <p className="text-slate-400 text-xs mb-1">Model</p>
                  <p className="text-white text-sm font-mono">
                    Xiaomi: MiMo-V2-Flash (free)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 rounded-lg p-3 border border-zinc-500/20">
                    <p className="text-slate-400 text-xs mb-1">Provider</p>
                    <p className="text-white text-sm">XIAOMI</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 border border-zinc-500/20">
                    <p className="text-slate-400 text-xs mb-1">Type</p>
                    <p className="text-white text-sm">Free Tier</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                  <Sparkles className="h-4 w-4 text-sky-400" />
                  <span>Generating intelligent task plans</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex w-full gap-4">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Quick Stats
            </h3>
            <div className="space-y-3 min-w-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">
                  Avg. tasks per project
                </span>
                <span className="text-white font-semibold">
                  {projects.length > 0
                    ? (totalTasks / projects.length).toFixed(1)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Completion rate</span>
                <span className="text-green-400 font-semibold">
                  {totalTasks > 0
                    ? Math.round((completedTasks / totalTasks) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">
                  Avg. project duration
                </span>
                <span className="text-white font-semibold">
                  {projects.length > 0
                    ? Math.round(totalEstimatedDays / projects.length)
                    : 0}{" "}
                  days
                </span>
              </div>
            </div>
          </div>
          {/* Recently Completed */}
          {completedProjects > 0 && (
            <div className="bg-green-900/20 rounded-xl border border-green-500/30 p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <CircleCheck className="h-5 w-5 text-green-400" />
                Recently Completed
              </h3>
              <div className="space-y-2">
                {projects
                  .filter((p) => p.status === "completed")
                  .slice(0, 3)
                  .map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block bg-black/20 hover:bg-black/30 p-3 rounded-lg transition-colors"
                    >
                      <p className="text-white text-sm font-medium">
                        {project.title}
                      </p>
                      <p className="text-green-400 text-xs mt-1">
                        Completed{" "}
                        {project.completed_at
                          ? new Date(project.completed_at).toLocaleDateString()
                          : "recently"}
                      </p>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
