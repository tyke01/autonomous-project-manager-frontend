"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchProject, updateTaskStatus } from "@/actions/projects";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import TaskAssistantSheet from "@/components/task-assistant-sheet";
import type { Project, Task, TaskStatus } from "@/types/types";

// Column configuration
const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "pending", label: "Pending", color: "border-gray-500" },
  { id: "in_progress", label: "In Progress", color: "border-blue-500" },
  { id: "completed", label: "Completed", color: "border-green-500" },
  { id: "blocked", label: "Blocked", color: "border-red-500" },
];

// Draggable Task Card Component
function TaskCard({ task, projectGoal }: { task: Task; projectGoal: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-zinc-700 p-4 rounded-lg hover:bg-zinc-600 transition-colors"
    >
      {/* Drag handle - only this area is draggable */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing mb-3"
      >
        <h3 className="font-semibold text-white mb-2">{task.title}</h3>
        <p className="text-sm text-gray-300 mb-2 line-clamp-2">
          {task.description}
        </p>
      </div>

      <div className="text-xs text-gray-400 mb-3">
        <div>Est: {task.estimated_days} days</div>
        {task.actual_days && <div>Actual: {task.actual_days} days</div>}
      </div>

      {/* AI Assistant Button */}
      <TaskAssistantSheet task={task} projectGoal={projectGoal} />
    </div>
  );
}

// Droppable Column Component
function Column({
  id,
  label,
  color,
  tasks,
  projectGoal,
}: {
  id: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
  projectGoal: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "column",
      status: id,
    },
  });

  return (
    <div className="flex-1 min-w-64">
      <div
        ref={setNodeRef}
        className={`border-t-4 ${color} bg-zinc-800 rounded-lg p-4 transition-colors ${
          isOver ? "ring-2 ring-white ring-opacity-50" : ""
        }`}
      >
        <h2 className="text-white font-semibold mb-4 text-center">{label}</h2>
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 min-h-96">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} projectGoal={projectGoal} />
            ))}
            {tasks.length === 0 && (
              <div className="text-gray-500 text-center py-8 text-sm">
                Drop tasks here
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loadProject = async () => {
    try {
      const data = await fetchProject(Number(params.id));
      setProject(data);
    } catch (error) {
      console.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Group tasks by status with proper typing
  const tasksByStatus: Record<TaskStatus, Task[]> = project?.tasks.reduce(
    (acc, task) => {
      const status = task.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    },
    {
      pending: [],
      in_progress: [],
      completed: [],
      blocked: [],
    } as Record<TaskStatus, Task[]>
  ) ?? {
    pending: [],
    in_progress: [],
    completed: [],
    blocked: [],
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const task = project?.tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !project) return;

    const taskId = active.id as number;
    let newStatus: TaskStatus | null = null;

    // Check if dropped on a column
    if (over.data.current?.type === "column") {
      newStatus = over.data.current.status as TaskStatus;
    } else {
      // Dropped on a task → use that task's status
      const overTask = project.tasks.find((t) => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (!newStatus) return;

    // Find the task being moved
    const task = project.tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setProject((prev) => {
      if (!prev) return prev;
      
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus as TaskStatus } : t
        ),
      };
    });

    // Update backend
    try {
      const response = await updateTaskStatus(taskId, newStatus);

      // Show timeline update if available
      if (response.timeline_update) {
        const update = response.timeline_update;
        toast.success(update.reasoning, {
          description: `New deadline: ${update.new_deadline} | Remaining: ${update.remaining_days} days`,
        });
      }

      // Refresh to get accurate data
      await loadProject();
    } catch (error) {
      console.error("Failed to update task");
      toast.error("Failed to update task status");
      // Revert optimistic update
      await loadProject();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Project not found</h1>
        <a href="/projects" className="text-purple-400 hover:text-purple-300">
          Back to projects
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{project.title}</h1>
          
          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.status === "completed"
                ? "bg-green-500 text-white"
                : project.status === "active"
                ? "bg-blue-500 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {project.status === "completed" && "✓ "}
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>

        <p className="text-gray-400 mb-4">{project.goal}</p>

        {/* Completion Message */}
        {project.status === "completed" && project.completed_at && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
            <p className="text-green-400 font-medium">
              🎉 Project completed on{" "}
              {new Date(project.completed_at).toLocaleDateString()}!
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <div className="bg-blue-500 text-white px-4 py-2 rounded">
            Total: {project.total_estimated_days} days
          </div>
          <div className="bg-green-500 text-white px-4 py-2 rounded">
            Remaining: {project.remaining_days} days
          </div>
          <div className="bg-yellow-500 text-white px-4 py-2 rounded">
            Spent: {project.actual_days_spent} days
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-neutral-900 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-white mb-6">Task Board</h2>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((column) => (
              <Column
                key={column.id}
                id={column.id}
                label={column.label}
                color={column.color}
                tasks={tasksByStatus[column.id]}
                projectGoal={project.goal}
              />
            ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask ? (
              <div className="bg-zinc-700 p-4 rounded-lg shadow-xl rotate-3">
                <h3 className="font-semibold text-white">{activeTask.title}</h3>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}