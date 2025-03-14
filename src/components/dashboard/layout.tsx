"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { 
  LayoutGrid, 
  Calendar as CalendarIcon, 
  Clock, 
  StickyNote, 
  Settings, 
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CalendarDays,
  CalendarRange,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            <h1 className="text-xl font-semibold">ProjectAI</h1>
          </div>
        </div>
      </header>
      <div className="flex flex-1 relative">
        <aside 
          className={cn(
            "border-r bg-muted/40 transition-all duration-300 ease-in-out fixed h-[calc(100vh-4rem)] z-10",
            sidebarCollapsed ? "w-16" : "w-64",
            "hidden md:block"
          )}
        >
          <div className="flex h-full flex-col gap-2 p-4 relative">
            <div className={cn("flex flex-col gap-1", sidebarCollapsed && "items-center")}>
              {!sidebarCollapsed && (
                <>
                  <h2 className="text-lg font-semibold">Dashboard</h2>
                  <p className="text-sm text-muted-foreground">Manage your projects</p>
                </>
              )}
            </div>
            <Separator className="my-2" />
            <nav className="flex flex-col gap-4">
              {/* Main Dashboard */}
              <div>
                <Button asChild variant="ghost" className={cn("justify-start gap-2 w-full", sidebarCollapsed && "justify-center px-2")}>
                  <Link href="/dashboard">
                    <LayoutGrid className="h-4 w-4" />
                    {!sidebarCollapsed && <span>Dashboard</span>}
                  </Link>
                </Button>
              </div>
              
              {/* Time Management Section */}
              {!sidebarCollapsed && (
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-2">
                  Time Management
                </div>
              )}
              <div className="space-y-1">
                {/* Daily View */}
                <Button asChild variant="ghost" className={cn("justify-start gap-2 w-full", sidebarCollapsed && "justify-center px-2")}>
                  <Link href="/dashboard/daily">
                    <CalendarIcon className="h-4 w-4" />
                    {!sidebarCollapsed && (
                      <div className="flex justify-between items-center w-full">
                        <span>Daily</span>
                        <Badge variant="outline" className="text-xs py-0 h-5">Active</Badge>
                      </div>
                    )}
                  </Link>
                </Button>
                
                {/* Weekly View - Disabled */}
                <Button variant="ghost" className={cn("justify-start gap-2 w-full opacity-50 cursor-not-allowed", sidebarCollapsed && "justify-center px-2")}>
                  <CalendarDays className="h-4 w-4" />
                  {!sidebarCollapsed && (
                    <div className="flex justify-between items-center w-full">
                      <span>Weekly</span>
                      <Badge variant="outline" className="text-xs py-0 h-5 bg-muted">Soon</Badge>
                    </div>
                  )}
                </Button>
                
                {/* Monthly View - Disabled */}
                <Button variant="ghost" className={cn("justify-start gap-2 w-full opacity-50 cursor-not-allowed", sidebarCollapsed && "justify-center px-2")}>
                  <CalendarRange className="h-4 w-4" />
                  {!sidebarCollapsed && (
                    <div className="flex justify-between items-center w-full">
                      <span>Monthly</span>
                      <Badge variant="outline" className="text-xs py-0 h-5 bg-muted">Soon</Badge>
                    </div>
                  )}
                </Button>
              </div>
              
              {/* Features Section */}
              {!sidebarCollapsed && (
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-2 mt-2">
                  Features
                </div>
              )}
              <div className="space-y-1">
                <Button asChild variant="ghost" className={cn("justify-start gap-2 w-full", sidebarCollapsed && "justify-center px-2")}>
                  <Link href="/dashboard/timeblocks">
                    <Clock className="h-4 w-4" />
                    {!sidebarCollapsed && <span>Time Blocks</span>}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className={cn("justify-start gap-2 w-full", sidebarCollapsed && "justify-center px-2")}>
                  <Link href="/dashboard/notes">
                    <StickyNote className="h-4 w-4" />
                    {!sidebarCollapsed && <span>Notes</span>}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className={cn("justify-start gap-2 w-full", sidebarCollapsed && "justify-center px-2")}>
                  <Link href="/dashboard/trash">
                    <Trash2 className="h-4 w-4" />
                    {!sidebarCollapsed && <span>Trash</span>}
                  </Link>
                </Button>
              </div>
            </nav>
            
            {/* Spacer to push user controls to bottom */}
            <div className="flex-1"></div>
            
            {/* User controls */}
            <div className={cn("mt-auto pt-4", sidebarCollapsed ? "flex flex-col items-center" : "")}>
              <Separator className="my-2" />
              <div className={cn("flex items-center gap-2 mb-2", sidebarCollapsed ? "flex-col" : "")}>
                {!sidebarCollapsed && <span className="text-sm text-muted-foreground">User</span>}
                <Avatar className={cn(sidebarCollapsed ? "mb-2" : "")}>
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
              <div className={cn("flex gap-2", sidebarCollapsed ? "flex-col" : "")}>
                <Button asChild variant="ghost" size="icon" className={cn("h-9 w-9", !sidebarCollapsed && "w-full justify-start")}>
                  <Link href="/dashboard/settings">
                    <Settings className="h-4 w-4" />
                    {!sidebarCollapsed && <span className="ml-2">Settings</span>}
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="icon" className={cn("h-9 w-9", !sidebarCollapsed && "w-full justify-start")}>
                  <Link href="/logout">
                    <LogOut className="h-4 w-4" />
                    {!sidebarCollapsed && <span className="ml-2">Logout</span>}
                  </Link>
                </Button>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-background border rounded-full shadow-sm"
              onClick={toggleSidebar}
            >
              {sidebarCollapsed ? 
                <ChevronRight className="h-4 w-4" /> : 
                <ChevronLeft className="h-4 w-4" />
              }
            </Button>
          </div>
        </aside>
        <main className={cn(
          "flex-1 overflow-auto p-4 md:p-6 transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
} 