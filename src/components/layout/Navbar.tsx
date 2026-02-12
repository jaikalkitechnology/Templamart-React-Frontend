import { useState, useEffect, useRef } from "react";
import logo from "../../img/templamart-logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  LogIn, 
  Menu, 
  Search, 
  ShoppingCart, 
  User, 
  X,
  LayoutGrid,
  Sparkles,
  TrendingUp,
  Star,
  Zap,
  Package,
  Settings,
  LogOut,
  Store,
  Shield,
  ChevronDown,
  Grid3x3,
  Home,
  Briefcase,
  Palette,
  Code,
  Smartphone,
  Building2,
  Brush,
  BookOpen,
  MonitorSmartphone,
  UtensilsCrossed,
  GraduationCap,
  Stethoscope,
  Plane,
  Film,
  Dumbbell,
  Music,
  Camera,
  Wheat,
  Minimize2,
  PartyPopper,
  Shirt,
  Car,
  DollarSign,
  HandHeart,
  Megaphone,
  BarChart3,
  FolderOpen,
  MessageSquare,
  Gamepad2,
  HardHat,
  Scale,
  VideoIcon,
  Tractor,
  Sparkle,
  Cpu,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useShoppingContext } from "@/context/ShoppingContext";
import { useAuth } from "@/context/auth-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BASE_URL } from "@/config";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [categoryMap, setCategoryMap] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, wishlistCount } = useShoppingContext();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/product/categories/navbar`)
      .then((res) => res.json())
      .then((data) => setCategoryMap(data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Auto-close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/templates?search=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
      setSearchQuery("");
      searchInputRef.current?.blur();
    }
  };

  // Comprehensive Category Icon Mapping - All 30 Categories
  const getCategoryIcon = (categoryName: string, className: string = "h-4 w-4") => {
    const name = categoryName.toLowerCase().trim();
    
    // Map category names to their specific icons
    const iconMap: { [key: string]: JSX.Element } = {
      // 1. Business & Corporate
      'business & corporate': <Building2 className={className} />,
      'business-corporate': <Building2 className={className} />,
      'business': <Building2 className={className} />,
      'corporate': <Building2 className={className} />,
      
      // 2. E-commerce & Shopping
      'e-commerce & shopping': <ShoppingCart className={className} />,
      'ecommerce-shopping': <ShoppingCart className={className} />,
      'ecommerce': <ShoppingCart className={className} />,
      'e-commerce': <ShoppingCart className={className} />,
      'shopping': <ShoppingCart className={className} />,
      'online store': <ShoppingCart className={className} />,
      'shop': <ShoppingCart className={className} />,
      
      // 3. Portfolio & Creative
      'portfolio & creative': <Brush className={className} />,
      'portfolio-creative': <Brush className={className} />,
      'portfolio': <Brush className={className} />,
      'creative': <Palette className={className} />,
      
      // 4. Blog & Magazine
      'blog & magazine': <BookOpen className={className} />,
      'blog-magazine': <BookOpen className={className} />,
      'blog': <BookOpen className={className} />,
      'magazine': <BookOpen className={className} />,
      
      // 5. SaaS & Technology
      'saas & technology': <MonitorSmartphone className={className} />,
      'saas-technology': <MonitorSmartphone className={className} />,
      'saas': <Cpu className={className} />,
      'technology': <Cpu className={className} />,
      'software': <Code className={className} />,
      
      // 6. Restaurant & Food
      'restaurant & food': <UtensilsCrossed className={className} />,
      'restaurant-food': <UtensilsCrossed className={className} />,
      'restaurant': <UtensilsCrossed className={className} />,
      'food': <UtensilsCrossed className={className} />,
      
      // 7. Education & Learning
      'education & learning': <GraduationCap className={className} />,
      'education-learning': <GraduationCap className={className} />,
      'education': <GraduationCap className={className} />,
      'learning': <GraduationCap className={className} />,
      'school': <GraduationCap className={className} />,
      
      // 8. Health & Medical
      'health & medical': <Stethoscope className={className} />,
      'health-medical': <Stethoscope className={className} />,
      'health': <Stethoscope className={className} />,
      'medical': <Stethoscope className={className} />,
      'healthcare': <Stethoscope className={className} />,
      
      // 9. Real Estate & Property
      'real estate & property': <Home className={className} />,
      'real-estate': <Home className={className} />,
      'real estate': <Home className={className} />,
      'property': <Home className={className} />,
      
      // 10. Travel & Tourism
      'travel & tourism': <Plane className={className} />,
      'travel-tourism': <Plane className={className} />,
      'travel': <Plane className={className} />,
      'tourism': <Plane className={className} />,
      
      // 11. Entertainment & Media
      'entertainment & media': <Film className={className} />,
      'entertainment-media': <Film className={className} />,
      'entertainment': <Film className={className} />,
      'media': <Film className={className} />,
      
      // 12. Fitness & Sports
      'fitness & sports': <Dumbbell className={className} />,
      'fitness-sports': <Dumbbell className={className} />,
      'fitness': <Dumbbell className={className} />,
      'sports': <Dumbbell className={className} />,
      'gym': <Dumbbell className={className} />,
      
      // 13. Wedding & Events
      'wedding & events': <PartyPopper className={className} />,
      'wedding-events': <PartyPopper className={className} />,
      'wedding': <Heart className={className} />,
      'events': <PartyPopper className={className} />,
      
      // 14. Fashion & Beauty
      'fashion & beauty': <Shirt className={className} />,
      'fashion-beauty': <Shirt className={className} />,
      'fashion': <Shirt className={className} />,
      'beauty': <Sparkle className={className} />,
      
      // 15. Automotive
      'automotive': <Car className={className} />,
      'car': <Car className={className} />,
      'vehicle': <Car className={className} />,
      
      // 16. Finance & Banking
      'finance & banking': <DollarSign className={className} />,
      'finance-banking': <DollarSign className={className} />,
      'finance': <DollarSign className={className} />,
      'banking': <DollarSign className={className} />,
      
      // 17. Non-Profit & Charity
      'non-profit & charity': <HandHeart className={className} />,
      'non-profit': <HandHeart className={className} />,
      'charity': <HandHeart className={className} />,
      'ngo': <HandHeart className={className} />,
      
      // 18. Landing Pages
      'landing pages': <Megaphone className={className} />,
      'landing-pages': <Megaphone className={className} />,
      'landing page': <Megaphone className={className} />,
      
      // 19. Dashboard & Admin
      'dashboard & admin': <BarChart3 className={className} />,
      'dashboard-admin': <BarChart3 className={className} />,
      'dashboard': <BarChart3 className={className} />,
      'admin': <LayoutGrid className={className} />,
      
      // 20. Mobile App UI
      'mobile app ui': <Smartphone className={className} />,
      'mobile-app': <Smartphone className={className} />,
      'mobile': <Smartphone className={className} />,
      'app': <Smartphone className={className} />,
      
      // 21. Directory & Listing
      'directory & listing': <FolderOpen className={className} />,
      'directory-listing': <FolderOpen className={className} />,
      'directory': <FolderOpen className={className} />,
      'listing': <FolderOpen className={className} />,
      
      // 22. Community & Social
      'community & social': <MessageSquare className={className} />,
      'community-social': <MessageSquare className={className} />,
      'community': <MessageSquare className={className} />,
      'social': <MessageSquare className={className} />,
      
      // 23. Gaming & Esports
      'gaming & esports': <Gamepad2 className={className} />,
      'gaming-esports': <Gamepad2 className={className} />,
      'gaming': <Gamepad2 className={className} />,
      'esports': <Gamepad2 className={className} />,
      
      // 24. Construction & Architecture
      'construction & architecture': <HardHat className={className} />,
      'construction-architecture': <HardHat className={className} />,
      'construction': <HardHat className={className} />,
      'architecture': <HardHat className={className} />,
      
      // 25. Legal & Law
      'legal & law': <Scale className={className} />,
      'legal-law': <Scale className={className} />,
      'legal': <Scale className={className} />,
      'law': <Scale className={className} />,
      
      // 26. Personal & Resume
      'personal & resume': <User className={className} />,
      'personal-resume': <User className={className} />,
      'personal': <User className={className} />,
      'resume': <User className={className} />,
      'cv': <User className={className} />,
      
      // 27. Music & Audio
      'music & audio': <Music className={className} />,
      'music-audio': <Music className={className} />,
      'music': <Music className={className} />,
      'audio': <Music className={className} />,
      
      // 28. Photography & Video
      'photography & video': <Camera className={className} />,
      'photography-video': <Camera className={className} />,
      'photography': <Camera className={className} />,
      'video': <VideoIcon className={className} />,
      
      // 29. Agriculture & Farming
      'agriculture & farming': <Wheat className={className} />,
      'agriculture-farming': <Wheat className={className} />,
      'agriculture': <Wheat className={className} />,
      'farming': <Tractor className={className} />,
      
      // 30. Minimal & Clean
      'minimal & clean': <Minimize2 className={className} />,
      'minimal-clean': <Minimize2 className={className} />,
      'minimal': <Minimize2 className={className} />,
      'clean': <Sparkles className={className} />,

      // Generic fallbacks
      'web': <LayoutGrid className={className} />,
      'design': <Palette className={className} />,
      'graphics': <Palette className={className} />,
      'ui kits': <Grid3x3 className={className} />,
      'presentation': <BookOpen className={className} />,
      'email': <BookOpen className={className} />,
      'documents': <BookOpen className={className} />,
    };

    // Return the matched icon or default
    return iconMap[name] || <LayoutGrid className={className} />;
  };

  // Get category color gradient based on name
  const getCategoryColor = (categoryName: string) => {
    const name = categoryName.toLowerCase().trim();
    
    const colorMap: { [key: string]: string } = {
      'business & corporate': 'from-blue-500 to-cyan-500',
      'business-corporate': 'from-blue-500 to-cyan-500',
      'e-commerce & shopping': 'from-green-500 to-emerald-500',
      'ecommerce-shopping': 'from-green-500 to-emerald-500',
      'portfolio & creative': 'from-purple-500 to-pink-500',
      'portfolio-creative': 'from-purple-500 to-pink-500',
      'blog & magazine': 'from-orange-500 to-red-500',
      'blog-magazine': 'from-orange-500 to-red-500',
      'saas & technology': 'from-indigo-500 to-blue-500',
      'saas-technology': 'from-indigo-500 to-blue-500',
      'restaurant & food': 'from-red-500 to-orange-500',
      'restaurant-food': 'from-red-500 to-orange-500',
      'education & learning': 'from-yellow-500 to-amber-500',
      'education-learning': 'from-yellow-500 to-amber-500',
      'health & medical': 'from-teal-500 to-cyan-500',
      'health-medical': 'from-teal-500 to-cyan-500',
      'real estate & property': 'from-rose-500 to-pink-500',
      'real-estate': 'from-rose-500 to-pink-500',
      'travel & tourism': 'from-sky-500 to-blue-500',
      'travel-tourism': 'from-sky-500 to-blue-500',
      'entertainment & media': 'from-violet-500 to-purple-500',
      'entertainment-media': 'from-violet-500 to-purple-500',
      'fitness & sports': 'from-lime-500 to-green-500',
      'fitness-sports': 'from-lime-500 to-green-500',
      'wedding & events': 'from-pink-500 to-rose-500',
      'wedding-events': 'from-pink-500 to-rose-500',
      'fashion & beauty': 'from-fuchsia-500 to-pink-500',
      'fashion-beauty': 'from-fuchsia-500 to-pink-500',
      'automotive': 'from-slate-600 to-gray-700',
      'finance & banking': 'from-emerald-600 to-teal-600',
      'finance-banking': 'from-emerald-600 to-teal-600',
      'non-profit & charity': 'from-red-500 to-rose-500',
      'non-profit': 'from-red-500 to-rose-500',
      'landing pages': 'from-cyan-500 to-blue-500',
      'landing-pages': 'from-cyan-500 to-blue-500',
      'dashboard & admin': 'from-blue-600 to-indigo-600',
      'dashboard-admin': 'from-blue-600 to-indigo-600',
      'mobile app ui': 'from-purple-600 to-indigo-600',
      'mobile-app': 'from-purple-600 to-indigo-600',
      'directory & listing': 'from-amber-500 to-orange-500',
      'directory-listing': 'from-amber-500 to-orange-500',
      'community & social': 'from-blue-500 to-cyan-500',
      'community-social': 'from-blue-500 to-cyan-500',
      'gaming & esports': 'from-violet-600 to-purple-600',
      'gaming-esports': 'from-violet-600 to-purple-600',
      'construction & architecture': 'from-orange-600 to-amber-600',
      'construction-architecture': 'from-orange-600 to-amber-600',
      'legal & law': 'from-gray-700 to-slate-700',
      'legal-law': 'from-gray-700 to-slate-700',
      'personal & resume': 'from-indigo-500 to-blue-500',
      'personal-resume': 'from-indigo-500 to-blue-500',
      'music & audio': 'from-pink-500 to-purple-500',
      'music-audio': 'from-pink-500 to-purple-500',
      'photography & video': 'from-cyan-500 to-teal-500',
      'photography-video': 'from-cyan-500 to-teal-500',
      'agriculture & farming': 'from-green-600 to-lime-600',
      'agriculture-farming': 'from-green-600 to-lime-600',
      'minimal & clean': 'from-gray-400 to-slate-400',
      'minimal-clean': 'from-gray-400 to-slate-400',
    };

    return colorMap[name] || 'from-gray-500 to-gray-600';
  };

  // Categories for navigation
  const navCategories = categoryMap.length > 0 ? categoryMap : [
    { name: "Business & Corporate", href: "/category/business-corporate" },
    { name: "E-commerce & Shopping", href: "/category/ecommerce-shopping" },
    { name: "Portfolio & Creative", href: "/category/portfolio-creative" },
    { name: "SaaS & Technology", href: "/category/saas-technology" },
    { name: "Restaurant & Food", href: "/category/restaurant-food" },
    { name: "Education & Learning", href: "/category/education-learning" },
    { name: "Health & Medical", href: "/category/health-medical" },
    { name: "Real Estate & Property", href: "/category/real-estate" },
  ];

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled 
        ? "bg-background/95 backdrop-blur-xl border-b shadow-lg" 
        : "bg-background/80 backdrop-blur-md border-b"
    )}>
      <div className="px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 flex h-16 md:h-20 items-center justify-between px-4 md:px-6 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-4 md:gap-6 shrink-0">
          <Link to="/" className="flex items-center space-x-2 group">
            <img 
              src={logo} 
              alt="TemplaMarT Logo" 
              className="h-10 w-auto md:h-12 transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {/* Categories Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="group gap-2 bg-transparent hover:bg-accent data-[state=open]:bg-accent">
                  <LayoutGrid className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  <span>Categories</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[500px] gap-3 p-4 md:w-[600px] lg:w-[800px]">
                    <div className="mb-4 p-2">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Popular Categories
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Explore our curated collection of templates
                      </p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {navCategories.map((category) => (
                        <Link
                          key={category.name}
                          to={category.href}
                          className="group relative flex select-none items-center gap-3 rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-accent hover:shadow-md border border-transparent hover:border-primary/20"
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getCategoryColor(category.name)} text-white transition-transform group-hover:scale-110`}>
                            {getCategoryIcon(category.name, "h-5 w-5")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {category.name}
                            </div>
                            <p className="line-clamp-1 text-xs text-muted-foreground mt-0.5">
                              Browse templates
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Link 
                        to="/categories"
                        className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        View All Categories
                        <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Other Navigation Items */}
              <NavigationMenuItem>
                <Link to="/templates">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
                    <Grid3x3 className="mr-2 h-4 w-4" />
                    All Templates
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/featured">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
                    <Star className="mr-2 h-4 w-4" />
                    Featured
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/trending">
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Trending
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop Search - Beautiful Combined Design */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8"
        >
          <div className={cn(
            "relative flex-1 group transition-all duration-300",
            isFocused && "scale-[1.02]"
          )}>
            <div className={cn(
              "absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all duration-500",
              isFocused && "opacity-30 blur-md"
            )} />
            
            <div className="relative flex items-center">
              <div className={cn(
                "absolute left-4 transition-all duration-300",
                isFocused ? "text-primary scale-110" : "text-muted-foreground"
              )}>
                <Search className="h-5 w-5" />
              </div>
              
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search templates, categories, or authors..."
                className={cn(
                  "w-full pl-12 pr-32 h-12 text-base",
                  "border-2 bg-background/50 backdrop-blur-sm rounded-2xl",
                  "transition-all duration-300",
                  "hover:border-primary/40 hover:bg-background/80",
                  "focus:border-primary focus:bg-background focus:shadow-lg focus:shadow-primary/10",
                  isFocused ? "border-primary shadow-lg shadow-primary/10" : "border-border/50"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              
              <Button 
                type="submit" 
                size="lg"
                className={cn(
                  "absolute right-1.5 h-9 px-6 rounded-xl",
                  "bg-gradient-to-r from-primary via-purple-600 to-pink-600",
                  "hover:from-primary/90 hover:via-purple-600/90 hover:to-pink-600/90",
                  "transition-all duration-300",
                  "shadow-md hover:shadow-lg",
                  "font-semibold text-white",
                  isFocused && "shadow-lg shadow-primary/30 scale-105"
                )}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
                <ArrowRight className={cn(
                  "h-4 w-4 ml-1 transition-transform duration-300",
                  isFocused && "translate-x-1"
                )} />
              </Button>
            </div>
          </div>
        </form>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Wishlist */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="relative h-10 w-10 rounded-xl group"
          >
            <Link to="/wishlist">
              <Heart className="h-5 w-5 transition-colors group-hover:text-red-500" />
              {wishlistCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white border-2 border-background">
                  {wishlistCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="relative h-10 w-10 rounded-xl group"
          >
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5 transition-colors group-hover:text-primary" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gradient-to-r from-primary to-brand-600 text-white border-2 border-background">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Auth State */}
          {isAuthenticated && currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all group"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                    <AvatarImage
                      src={currentUser.username || "/default-avatar.png"}
                      alt={currentUser?.username || "User"}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-brand-600/20">
                      {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {currentUser?.role === 2 && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 border-2 border-background"></div>
                  )}
                  {currentUser?.role === 3 && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-background"></div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser?.username || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser?.username || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Wishlist</span>
                    {wishlistCount > 0 && (
                      <Badge className="ml-auto">{wishlistCount}</Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/cart")}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <Badge className="ml-auto">{cartCount}</Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/purchases")}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Purchases</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                {currentUser?.role === 2 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => navigate("/seller/dashboard")}>
                        <Store className="mr-2 h-4 w-4" />
                        <span>Seller Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/seller/templates")}>
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span>My Templates</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
                
                {currentUser?.role === 3 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/admin/templates")}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Manage Templates</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                asChild
                className="gap-2 hover:bg-accent rounded-xl"
              >
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden lg:inline">Login</span>
                </Link>
              </Button>
              <Button 
                variant="default" 
                asChild
                className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-pink-600/90 shadow-lg shadow-primary/20 rounded-xl"
              >
                <Link to="/signup">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Sign Up</span>
                  <span className="lg:hidden">Signup</span>
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 rounded-xl"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md p-0">
            <SheetHeader className="p-6 pb-4 border-b">
              <SheetTitle className="flex items-center gap-3">
                <img 
                  src={logo} 
                  alt="TemplaMarT Logo" 
                  className="h-8 w-auto"
                />
                <span className="text-lg font-bold">Menu</span>
              </SheetTitle>
            </SheetHeader>
            
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="p-6 space-y-6">
                {/* Mobile Search - Beautiful Combined Design */}
                <form onSubmit={handleSearch} className="space-y-3">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity" />
                    <div className="relative flex items-center">
                      <Search className="absolute left-4 h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                      <Input
                        type="search"
                        placeholder="Search templates..."
                        className="w-full pl-12 pr-4 h-12 rounded-2xl border-2 bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-pink-600/90 shadow-lg text-base font-semibold"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search Templates
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>

                <Separator />

                {/* Mobile Navigation */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Navigation
                  </h3>
                  
                  <div className="space-y-2">
                    <Link
                      to="/"
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <Home className="h-4 w-4" />
                      Home
                    </Link>
                    
                    <Link
                      to="/templates"
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <Grid3x3 className="h-4 w-4" />
                      All Templates
                    </Link>
                    
                    <Link
                      to="/featured"
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <Star className="h-4 w-4" />
                      Featured
                    </Link>
                    
                    <Link
                      to="/trending"
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Trending
                    </Link>
                  </div>
                </div>

                <Separator />

                {/* Mobile Categories */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Categories
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {navCategories.slice(0, 10).map((category) => (
                      <Link
                        key={category.name}
                        to={category.href}
                        className="flex flex-col items-center justify-center gap-2 rounded-lg border p-3 text-center transition-all hover:border-primary hover:bg-accent/50"
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${getCategoryColor(category.name)} text-white`}>
                          {getCategoryIcon(category.name, "h-5 w-5")}
                        </div>
                        <span className="text-xs font-medium line-clamp-2">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                  
                  <Link 
                    to="/categories"
                    className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    View All Categories
                    <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                  </Link>
                </div>

                <Separator />

                {/* Mobile User Actions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to="/wishlist"
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent border"
                    >
                      <Heart className="h-4 w-4" />
                      Wishlist
                      {wishlistCount > 0 && (
                        <Badge className="ml-1">{wishlistCount}</Badge>
                      )}
                    </Link>
                    
                    <Link
                      to="/cart"
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent border"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Cart
                      {cartCount > 0 && (
                        <Badge className="ml-1">{cartCount}</Badge>
                      )}
                    </Link>
                  </div>

                  {!isAuthenticated ? (
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <Button variant="outline" asChild className="w-full rounded-xl">
                        <Link to="/login">
                          <LogIn className="mr-2 h-4 w-4" />
                          Login
                        </Link>
                      </Button>
                      <Button asChild className="w-full rounded-xl bg-gradient-to-r from-primary via-purple-600 to-pink-600">
                        <Link to="/signup">
                          <User className="mr-2 h-4 w-4" />
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-lg border p-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={currentUser?.username || "/default-avatar.png"}
                            alt={currentUser?.username || "User"}
                          />
                          <AvatarFallback>
                            {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{currentUser?.username}</p>
                          <p className="text-xs text-muted-foreground">{currentUser?.username}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" asChild className="w-full rounded-xl">
                          <Link to="/account">
                            <User className="mr-2 h-4 w-4" />
                            Account
                          </Link>
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={logout}
                          className="w-full rounded-xl"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                      
                      {currentUser?.role === 2 && (
                        <Button asChild className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                          <Link to="/seller/dashboard">
                            <Store className="mr-2 h-4 w-4" />
                            Seller Dashboard
                          </Link>
                        </Button>
                      )}
                      
                      {currentUser?.role === 3 && (
                        <Button asChild className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                          <Link to="/admin/dashboard">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;