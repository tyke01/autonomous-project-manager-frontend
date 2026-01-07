"use client";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Home,
  Inbox,
  Search,
  Settings,
  SquareArrowOutUpRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export function AppSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: Inbox,
    },
  ];

  return (
    <Sidebar className="p-2" variant="floating" collapsible="icon">
      <SidebarHeader>
        {collapsed ? (
          <img src="/task.png" alt="task management " className="size-8"/>
        ) : (
          <div className="flex items-center gap-2">
            <img src="/task.png" alt="task management " className="size-12"/>
            <h1 className="text-2xl font-bold text-sky-400">TASK AI</h1>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className=" rounded-lg mt-10 ">
        <SidebarGroup>
          {/* <SidebarGroupLabel className="text-2xl mb-10">
            Application
          </SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="bg-neutral-800/40 rounded-sm py-4 min-h-10"
                  >
                    <a href={item.url}>
                      <item.icon className="text-sky-500" />
                      <span className="text-base font-semibold text-sky-100">
                        {!collapsed && <span>{item.title}</span>}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={`
            rounded-lg bg-neutral-800/40 hover:bg-neutral-800 
            text-zinc-400 hover:text-zinc-200 transition-all duration-200
            ${collapsed ? 'w-full' : 'ml-auto'}
          `}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
