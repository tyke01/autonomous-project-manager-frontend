"use client";

import { useState, useEffect, useRef } from "react";
import {
  getTaskConversation,
  sendTaskMessage,
  clearTaskConversation,
} from "@/actions/projects";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Loader2, Sparkles, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface TaskAssistantSheetProps {
  task: {
    id: number;
    title: string;
    description: string;
  };
  projectGoal: string;
}


type CodeProps = {
  inline?: boolean;
  children?: React.ReactNode;
};

export default function TaskAssistantSheet({ task }: TaskAssistantSheetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [isCopied, setIsCopied] = useState(false);

  // Load conversation when sheet opens
  const loadConversation = async () => {
    setLoading(true);
    try {
      const conversation = await getTaskConversation(task.id);
      setMessages(conversation.messages || []);

      // If no messages, send initial guidance request
      if (!conversation.messages || conversation.messages.length === 0) {
        await sendInitialMessage();
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  // Send initial guidance request
  const sendInitialMessage = async () => {
    setSending(true);
    try {
      const response = await sendTaskMessage(
        task.id,
        `Please provide detailed guidance on how to complete this task: "${task.title}"`
      );
      setMessages(response.messages || []);
    } catch (error) {
      console.error("Failed to send initial message:", error);
    } finally {
      setSending(false);
    }
  };

  // Send follow-up message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);

    try {
      const response = await sendTaskMessage(task.id, userMessage);
      setMessages(response.messages || []);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  // Clear conversation
  const handleClearConversation = async () => {
    if (!confirm("Are you sure you want to clear this conversation?")) return;

    try {
      await clearTaskConversation(task.id);
      setMessages([]);
      await sendInitialMessage(); // Restart with initial guidance
    } catch (error) {
      console.error("Failed to clear conversation:", error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && messages.length === 0 && !loading) {
      loadConversation();
    }
  };

  const markdownComponents: Components = {
    h1: ({ children }) => (
      <h1 className="text-xl font-bold text-white mb-3 mt-4 first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-semibold text-white mb-2 mt-4 first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold text-white mb-2 mt-3 first:mt-0">
        {children}
      </h3>
    ),

    p: ({ children }) => (
      <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>
    ),

    ul: ({ children }) => (
      <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1 ml-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1 ml-2">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="text-gray-300 ml-2">{children}</li>,

    code: ({ inline, children }: CodeProps) => {
      const codeText = String(children).replace(/\n$/, "");

      const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(codeText);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 1500);
        } catch (err) {
          console.error("Copy failed", err);
        }
      };

      return inline ? (
        <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-purple-400 text-sm font-mono">
          {children}
        </code>
      ) : (
        <div className="relative group">
          <pre className="bg-neutral-900 p-3 rounded-md text-gray-300 text-sm overflow-x-auto font-mono border border-gray-700">
            <code>{children}</code>
          </pre>

          <Button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-sm bg-gray-700 hover:bg-gray-800 px-4 rounded  transition text-white font-normal cursor-pointer"
            size="sm"
          >
            {isCopied ? "Copied!" : "Copy"}
          </Button>
        </div>
      );
    },

    pre: ({ children }) => (
      <pre className="bg-neutral-900 p-3 rounded-md overflow-x-auto my-2 border border-neutral-900">
        {children}
      </pre>
    ),

    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-400 hover:text-purple-300 underline decoration-purple-400/50 hover:decoration-purple-300 transition-colors"
      >
        {children}
      </a>
    ),

    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400 my-3 bg-gray-900/50 py-2">
        {children}
      </blockquote>
    ),

    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),

    em: ({ children }) => <em className="italic text-gray-200">{children}</em>,

    hr: () => <hr className="border-gray-700 my-4" />,
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent/10 hover:bg-transparent/20 cursor-pointer shadow-md"
        >
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full px-6 py-4">
        <SheetHeader>
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                AI Task Assistant
              </SheetTitle>
              <SheetDescription>
                Get detailed guidance and ask follow-up questions
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearConversation}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Task Info */}
        <div className="bg-gray-800 p-4 rounded-lg mt-4">
          <h3 className="font-semibold text-white mb-2">{task.title}</h3>
          <p className="text-sm text-gray-400">{task.description}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-2">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
              <p className="text-gray-400">Loading conversation...</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-lg rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-purple-500 text-white"
                    : "bg-zinc-800 text-gray-100"
                }`}
              >
                {message.role === "assistant" ? (
                  <ReactMarkdown
                    components={markdownComponents}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <p className="text-xs opacity-60 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-4">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !input.trim()}>
            Send
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
