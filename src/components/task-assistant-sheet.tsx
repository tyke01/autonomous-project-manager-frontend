"use client";

import { useState } from "react";
import { getTaskGuidance } from "@/actions/projects";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface TaskAssistantSheetProps {
  task: {
    id: number;
    title: string;
    description: string;
  };
  projectGoal: string;
}

export default function TaskAssistantSheet({
  task,
  projectGoal,
}: TaskAssistantSheetProps) {
  const [open, setOpen] = useState(false);
  const [guidance, setGuidance] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchGuidance = async () => {
    if (guidance) return; // Already loaded

    setLoading(true);
    setError("");

    try {
      const response = await getTaskGuidance(
        task.title,
        task.description,
        projectGoal
      );
      setGuidance(response.guidance);
    } catch (err) {
      setError("Failed to load AI guidance. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !guidance && !loading) {
      fetchGuidance();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-300"
        >
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto px-6">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-500" />
            AI Task Assistant
          </SheetTitle>
          <SheetDescription>
            Get detailed guidance on how to complete this task
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {/* Task Info */}
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-white mb-2">{task.title}</h3>
            <p className="text-sm text-gray-400">{task.description}</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
              <p className="text-gray-400">Generating guidance...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-red-400">{error}</p>
              <Button
                onClick={fetchGuidance}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Guidance Content */}
          {guidance && !loading && (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-white mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-white mb-3 mt-6">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="ml-4">{children}</li>,
                  code: ({ inline, children }: any) =>
                    inline ? (
                      <code className="bg-gray-800 px-2 py-1 rounded text-purple-400 text-sm">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-gray-800 p-4 rounded-lg text-gray-300 text-sm overflow-x-auto mb-4">
                        {children}
                      </code>
                    ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400 my-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {guidance}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
