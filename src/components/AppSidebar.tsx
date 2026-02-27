"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Heart,
  Clock,
  Settings,
  LogIn,
  Download,
  Compass,
  Search,
  Trophy,
  Sparkles,
  Building2,
  Award,
  CalendarDays,
  Shuffle,
  MessageSquare,
  Info,
  Bookmark,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Home", href: "/", icon: Home },
  { title: "Browse", href: "/browse", icon: Compass },
  { title: "Genres", href: "/genres", icon: Search },
  { title: "Top Charts", href: "/top-charts", icon: Trophy },
  { title: "Upcoming", href: "/upcoming", icon: Sparkles },
  { title: "Studios", href: "/studios", icon: Building2 },
  { title: "Leaderboard", href: "/leaderboard", icon: Award },
  { title: "Schedule", href: "/schedule", icon: CalendarDays },
  { title: "Random", href: "/random", icon: Shuffle },
];

const userNav = [
  { title: "Favorites", href: "/favorites", icon: Heart },
  { title: "Watch List", href: "/watchlist", icon: Bookmark },
  { title: "History", href: "/history", icon: Clock },
  { title: "Settings", href: "/settings", icon: Settings },
];

const extraNav = [
  { title: "Contact", href: "/contact", icon: MessageSquare },
  { title: "About", href: "/about", icon: Info },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Download className="h-6 w-6 text-sidebar-primary shrink-0" />
              <span className="text-lg font-bold tracking-tight">
                Anime<span className="text-sidebar-primary">Stream</span>
              </span>
            </Link>
          </div>
        ) : (
          <div className="flex justify-center">
            <Link href="/">
              <Download className="h-6 w-6 text-sidebar-primary" />
            </Link>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Discover</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {extraNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {user ? (
          <div className={`flex items-center gap-3 rounded-lg bg-sidebar-accent p-2.5 ${collapsed ? "justify-center" : ""}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">
              {user.email?.[0]?.toUpperCase() || "U"}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Sign In">
                <Link href="/auth">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
