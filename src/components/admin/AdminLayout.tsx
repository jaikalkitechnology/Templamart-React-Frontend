import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Tag,
  Users,
  Wallet,
  X,
  ChevronRight,
  Bell,
  Search,
  Package,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
  const location = useLocation();
  const { logout, currentUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: Home,
      badge: null,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
      badge: null,
    },
    {
      title: "Sellers",
      href: "/admin/sellers",
      icon: Users,
      badge: null,
    },
    {
      title: "Templates",
      href: "/admin/templates",
      icon: FileText,
      badge: null,
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: Tag,
      badge: null,
    },
    {
      title: "Sales",
      href: "/admin/sales",
      icon: ShoppingBag,
      badge: null,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      title: "Wallet",
      href: "/admin/wallet",
      icon: Wallet,
      badge: null,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: FileText,
      badge: null,
    },
    {
      title: "Products Management",
      href: "/admin/productsmanagement",
      icon: Package,
      badge: null,
    },
    {
      title: "Contact Sellers",
      href: "/admin/contactSellers",
      icon: MessageSquare,
      badge: "3",
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
      badge: null,
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex h-full items-center px-4 md:px-6">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="mr-3 md:hidden hover:bg-primary/10 rounded-xl"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <span className="text-lg font-bold text-white">T</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                TemplaMarT
              </span>
              <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
                Admin Panel
              </Badge>
            </div>
          </Link>

          {/* Header Actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search Button */}
            <Button variant="ghost" size="icon" className="hidden md:flex rounded-xl hover:bg-primary/10">
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-primary/10">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </Button>

            {/* User Profile */}
            <div className="hidden md:flex items-center gap-3 ml-2 pl-2 border-l">
              <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                <AvatarImage src={currentUser?.username} alt={currentUser?.username} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-600/20 text-primary font-semibold">
                  {currentUser?.username?.charAt(0).toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold">{currentUser?.username || "Admin"}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>

            {/* Back to Marketplace */}
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="hidden lg:flex ml-2 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 rounded-xl"
            >
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Marketplace
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Fixed Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 z-30 w-64 border-r bg-white/50 backdrop-blur-sm transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <ScrollArea className="h-full py-6">
          <div className="px-3 space-y-4">
            {/* Navigation Section */}
            <div>
              <h2 className="mb-3 px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Navigation
              </h2>
              <div className="space-y-1">
                {navigationItems.slice(0, 8).map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link key={item.title} to={item.href}>
                      <Button
                        variant={active ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start group relative overflow-hidden rounded-xl transition-all",
                          active
                            ? "bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white shadow-lg shadow-primary/20"
                            : "hover:bg-primary/5 hover:text-primary"
                        )}
                      >
                        {active && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
                        )}
                        <Icon className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                        <span className="flex-1 text-left">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto bg-red-500 text-white text-xs px-2">
                            {item.badge}
                          </Badge>
                        )}
                        {active && (
                          <ChevronRight className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Management Section */}
            <div>
              <h2 className="mb-3 px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Management
              </h2>
              <div className="space-y-1">
                {navigationItems.slice(8).map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link key={item.title} to={item.href}>
                      <Button
                        variant={active ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start group relative overflow-hidden rounded-xl transition-all",
                          active
                            ? "bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white shadow-lg shadow-primary/20"
                            : "hover:bg-primary/5 hover:text-primary"
                        )}
                      >
                        {active && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
                        )}
                        <Icon className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                        <span className="flex-1 text-left">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto bg-red-500 text-white text-xs px-2">
                            {item.badge}
                          </Badge>
                        )}
                        {active && (
                          <ChevronRight className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Logout Section */}
            <div className="px-3">
              <Button
                onClick={logout}
                variant="ghost"
                className="w-full justify-start hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group"
              >
                <LogOut className="mr-3 h-4 w-4 transition-transform group-hover:translate-x-[-4px]" />
                Logout
              </Button>
            </div>
          </div>

          {/* Bottom Card */}
          <div className="mt-6 mx-3">
            <div className="rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 p-4 text-white shadow-lg">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-xs text-white/80 mb-3">
                Check our documentation for detailed guides
              </p>
              <Button variant="secondary" size="sm" className="w-full rounded-lg bg-white text-primary hover:bg-white/90">
                View Docs
              </Button>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 top-16 z-20 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          "pt-16", // Account for fixed header
          "md:ml-64" // Account for sidebar on desktop
        )}
      >
        <div className="container py-8 px-4 md:px-6">
          <Outlet />
        </div>
      </main>

      {/* Custom Animations */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;