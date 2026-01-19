
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

const AdminLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Sellers",
      href: "/admin/sellers",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Templates",
      href: "/admin/templates",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: <Tag className="mr-2 h-4 w-4" />,
    },
    {
      title: "Sales",
      href: "/admin/sales",
      icon: <ShoppingBag className="mr-2 h-4 w-4" />,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
    },
    {
      title: "Wallet",
      href: "/admin/wallet",
      icon: <Wallet className="mr-2 h-4 w-4" />,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      title: "Contact Sellers",
      href: "/admin/contactSellers",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex h-16 items-center border-b bg-primary px-4 text-primary-foreground">
        <Button
          variant="ghost"
          size="icon"
          className="mr-4 md:hidden text-primary-foreground"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold">TemplaMarT</span>
            <span className="ml-2 rounded-md bg-primary-foreground/20 px-2 py-1 text-xs font-medium">
              Admin Panel
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" asChild>
              <Link to="/">
                <LogOut className="mr-2 h-4 w-4" />
                Back to Marketplace
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-1">
        <div
          className={`bg-primary/5 ${
            isSidebarOpen ? "block" : "hidden"
          } w-64 border-r md:block`}
        >
          <ScrollArea className="h-[calc(100vh-4rem)] py-6">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Admin Dashboard
              </h2>
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <Button
                    key={item.title}
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to={item.href}>
                      {item.icon}
                      {item.title}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
            <Separator className="my-4" />
            <div className="px-3 py-2">
              <div className="space-y-1">
                 <Button onClick={logout} variant="ghost" className="w-full justify-start">
                                  Logout
                                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="container py-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
