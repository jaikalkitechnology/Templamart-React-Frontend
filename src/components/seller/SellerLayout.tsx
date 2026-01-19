import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  Home,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Upload,
  Wallet,
  Users,
  MessageSquare,
  HelpCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  TrendingUp,
  CreditCard,
  FileText,
  CheckCircle,
  Sparkles,
  Zap,
  Globe,
  Rocket,
  Star,
  Gift,
  Coffee,
  User,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SellerLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState("");

  const handleNavigation = (href: string, title: string) => {
    setActiveItem(title);
    navigate(href);
  };

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/seller/dashboard",
      icon: <Home className="h-5 w-5" />,
      badge: null,
      description: "Overview & analytics",
    },
    {
      title: "My Templates",
      href: "/seller/templates",
      icon: <Package className="h-5 w-5" />,
      badge: null,
      description: "Manage your templates",
    },
    {
      title: "Upload Template",
      href: "/seller/templates/new",
      icon: <Upload className="h-5 w-5" />,
      badge: null,
      description: "Add new template",
      variant: "primary" as const,
    },
    {
      title: "Sales",
      href: "/seller/sales",
      icon: <ShoppingBag className="h-5 w-5" />,
      badge: null,
      description: "Orders & revenue",
    },
    {
      title: "Analytics",
      href: "/seller/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      badge: null,
      description: "Performance insights",
    },
    {
      title: "Wallet",
      href: "/seller/wallet",
      icon: <Wallet className="h-5 w-5" />,
      badge: null,
      description: "Earnings & payouts",
    },
    {
      title: "KYC Verification",
      href: "/seller/kyc",
      icon: <Shield className="h-5 w-5" />,
      badge: user?.isKYCVerified ? "✓" : "!",
      badgeColor: user?.isKYCVerified ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800",
      description: "Verify your account",
    },
  ];

  const secondaryItems = [
    {
      title: "Settings",
      href: "/seller/settings",
      icon: <Settings className="h-5 w-5" />,
      description: "Account preferences",
    },
    {
      title: "Support",
      href: "/seller/support",
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Help & contact",
    },
    {
      title: "Documentation",
      href: "/seller/docs",
      icon: <FileText className="h-5 w-5" />,
      description: "Guides & tutorials",
    },
  ];

  

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  const sidebarWidth = isSidebarCollapsed ? "w-20" : "w-64";
  const expandedWidth = isHovered && isSidebarCollapsed ? "w-64" : sidebarWidth;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">TemplaMarT</h1>
                  <p className="text-xs text-gray-500">Seller Dashboard</p>
                </div>
              </div>
            </div>
            <Separator />
            <ScrollArea className="flex-1 px-4 py-6">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <Button
                    key={item.title}
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleNavigation(item.href, item.title)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                    {item.badge && (
                      <Badge className="ml-auto">{item.badge}</Badge>
                    )}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex h-screen flex-col border-r bg-white shadow-xl transition-all duration-300 ease-in-out",
          expandedWidth
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {(!isSidebarCollapsed || isHovered) ? (
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  TemplaMarT
                </h1>
                <p className="text-xs text-gray-500">Seller Dashboard</p>
              </div>
            </Link>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 mx-auto">
              <Rocket className="h-5 w-5 text-white" />
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* User Profile */}
        <div className="border-b p-4">
          {(!isSidebarCollapsed || isHovered) ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src={user?.username} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  {user?.username?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold">{user?.username || "Seller"}</p>
                <p className="truncate text-xs text-gray-500">{user?.username || "seller@example.com"}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src={user?.username} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  {user?.username?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

      

        {/* Main Navigation */}
        <ScrollArea className="flex-1 py-4">
          <div className="space-y-1 px-3">
            {navigationItems.map((item) => (
              <TooltipProvider key={item.title}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start relative group",
                        isSidebarCollapsed && !isHovered && "justify-center px-2"
                      )}
                      onClick={() => handleNavigation(item.href, item.title)}
                    >
                      <div className="relative">
                        {item.icon}
                        {item.badge && (
                          <Badge 
                            className={cn(
                              "absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs",
                              item.badgeColor
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {(!isSidebarCollapsed || isHovered) && (
                        <>
                          <span className="ml-3">{item.title}</span>
                          {item.variant === "primary" && (
                            <Sparkles className="ml-auto h-4 w-4 text-yellow-500" />
                          )}
                        </>
                      )}
                      <div className={cn(
                        "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-purple-600 to-blue-600 transition-all",
                        isActive(item.href) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )} />
                    </Button>
                  </TooltipTrigger>
                  {(isSidebarCollapsed && !isHovered) && (
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Secondary Navigation */}
          <div className="space-y-1 px-3">
            {secondaryItems.map((item) => (
              <TooltipProvider key={item.title}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isSidebarCollapsed && !isHovered && "justify-center px-2"
                      )}
                      onClick={() => handleNavigation(item.href, item.title)}
                    >
                      {item.icon}
                      {(!isSidebarCollapsed || isHovered) && (
                        <span className="ml-3">{item.title}</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {(isSidebarCollapsed && !isHovered) && (
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* Upgrade Banner */}
          {(!isSidebarCollapsed || isHovered) && (
            <div className="mt-6 px-3">
              <div className="rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
                <div className="mb-2 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="text-sm font-semibold">Pro Seller</span>
                </div>
                <p className="text-xs opacity-90">Unlock advanced features</p>
                <Button size="sm" className="mt-3 w-full bg-white text-purple-600 hover:bg-gray-100">
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
              isSidebarCollapsed && !isHovered && "justify-center px-2"
            )}
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            {(!isSidebarCollapsed || isHovered) && (
              <span className="ml-3">Logout</span>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Fixed Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {navigationItems.find(item => isActive(item.href))?.title || "Dashboard"}
            </h2>
            <Badge variant="outline" className="hidden md:inline-flex">
              <Globe className="mr-1 h-3 w-3" />
              Live
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <DropdownMenu>
              
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {[
                    { title: "New Sale!", description: "You made ₹1,500 from Modern Dashboard", time: "2 min ago" },
                    { title: "Template Approved", description: "Your template is now live", time: "1 hour ago" },
                    { title: "Withdrawal Processed", description: "₹5,000 transferred to your bank", time: "2 hours ago" },
                    { title: "New Review", description: "John D. rated your template 5 stars", time: "5 hours ago" },
                  ].map((notification, index) => (
                    <DropdownMenuItem key={index} className="cursor-pointer py-3">
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <Bell className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-gray-500">{notification.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Help */}
            <Button variant="ghost" size="icon" asChild>
              <Link to="/seller/help">
                <HelpCircle className="h-5 w-5" />
              </Link>
            </Button>

            {/* Back to Marketplace */}
            <Button variant="outline" className="hidden md:flex gap-2" asChild>
              <Link to="/">
                <Globe className="h-4 w-4" />
                Marketplace
              </Link>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.username} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      {user?.username?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.username || "Seller"}</p>
                    <p className="text-xs text-gray-500">Seller Account</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/seller/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/seller/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
          
          {/* Footer */}
          <footer className="border-t bg-gray-50/50 px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                © 2024 TemplaMarT. All rights reserved.
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/privacy">Privacy Policy</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/terms">Terms of Service</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </footer>
        </ScrollArea>
      </div>
    </div>
  );
};

export default SellerLayout;