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

// Task status type
type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";

// Column configuration
const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "pending", label: "Pending", color: "border-gray-500" },
  { id: "in_progress", label: "In Progress", color: "border-blue-500" },
  { id: "completed", label: "Completed", color: "border-green-500" },
  { id: "blocked", label: "Blocked", color: "border-red-500" },
];

// Draggable Task Card Component
function TaskCard({ task, projectGoal }: { task: any; projectGoal: string }) {
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
  tasks: any[];
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
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<any>(null);

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
  }, [params.id]);

  // Group tasks by status
  const tasksByStatus = project?.tasks.reduce(
    (acc: Record<TaskStatus, any[]>, task: any) => {
      const status = task.status as TaskStatus;
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
      return acc;
    },
    { pending: [], in_progress: [], completed: [], blocked: [] }
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const task = project.tasks.find((t: any) => t.id === event.active.id);
    setActiveTask(task);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as number;

    // const newStatus = over.id as TaskStatus;
    let newStatus: TaskStatus | null = null;

    if (over.data.current?.type === "column") {
      newStatus = over.data.current.status;
    } else {
      // Dropped on a task → use that task's status
      const overTask = project.tasks.find((t: any) => t.id === over.id);
      newStatus = overTask?.status ?? null;
    }

    if (!newStatus) return;

    // Find the task being moved
    const task = project.tasks.find((t: any) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setProject((prev: any) => ({
      ...prev,
      tasks: prev.tasks.map((t: any) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ),
    }));

    // Update backend
    try {
      const response = await updateTaskStatus(taskId, newStatus);

      // Show timeline update if available
      if (response.timeline_update) {
        const update = response.timeline_update;
        toast(
          `${update.reasoning}\n\nNew deadline: ${update.new_deadline}\nRemaining: ${update.remaining_days} days`
        );
      }

      // Refresh to get accurate data
      await loadProject();
    } catch (error) {
      console.error("Failed to update task");
      // Revert optimistic update
      await loadProject();
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!project) return <div className="p-6">Project not found</div>;

  return (
    <div className="container mx-auto p-6">
      {/* Project Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
        <p className="text-gray-600 mb-4">{project.goal}</p>

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
                tasks={tasksByStatus?.[column.id] || []}
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
