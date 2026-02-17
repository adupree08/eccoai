"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import { useProfile } from "@/hooks/use-profile";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Rss,
  PenSquare,
  Library,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";

// Admin email whitelist
const ADMIN_EMAILS = ["aujena.dpree@gmail.com"];

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Feeds",
    href: "/feeds",
    icon: Rss,
  },
  {
    name: "Create Post",
    href: "/create",
    icon: PenSquare,
  },
  {
    name: "Library",
    href: "/library",
    icon: Library,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

const bottomNavItems = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

const adminNavItem = {
  name: "Admin",
  href: "/admin",
  icon: Shield,
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { profile } = useProfile();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  // Get display name
  const getDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  // Get plan display
  const getPlanDisplay = () => {
    if (profile?.plan) {
      return profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) + " Plan";
    }
    return "Free Plan";
  };

  // Check if user is admin
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  // Debug logging
  console.log("Sidebar user email:", user?.email, "isAdmin:", isAdmin);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r border-border bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold">
              <span className="text-ecco-navy">ecco</span>
              <span className="text-ecco-blue">ai</span>
            </span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-ecco-accent-light text-ecco-primary"
                    : "text-ecco-tertiary hover:bg-muted hover:text-ecco-primary"
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={1.75} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-border px-3 py-4 space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-ecco-accent-light text-ecco-primary"
                    : "text-ecco-tertiary hover:bg-muted hover:text-ecco-primary"
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={1.75} />
                {item.name}
              </Link>
            );
          })}

          {/* Admin Link - Only shown for admin users */}
          {isAdmin && (
            <Link
              href={adminNavItem.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === adminNavItem.href
                  ? "bg-ecco-navy text-white"
                  : "text-ecco-navy hover:bg-ecco-accent-light hover:text-ecco-navy"
              )}
            >
              <adminNavItem.icon className="h-5 w-5" strokeWidth={1.75} />
              {adminNavItem.name}
            </Link>
          )}
        </div>

        {/* User Section */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ecco-gradient text-sm font-semibold text-white">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-ecco-primary">
                {getDisplayName()}
              </p>
              <p className="truncate text-xs text-ecco-tertiary">
                {getPlanDisplay()}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-ecco-muted hover:bg-muted hover:text-ecco-primary"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
