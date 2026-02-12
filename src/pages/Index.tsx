// Copy the entire Index component code here with reduced padding/gaps
// I'll reduce: py-12 md:py-20 lg:py-24 → py-8 md:py-12 lg:py-16
// And: py-20 md:py-28 lg:py-32 → py-12 md:py-16 lg:py-20

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TemplateGrid from "@/components/templates/TemplateGrid";
import { TemplateProps } from "@/components/templates/TemplateCard";
import axios from "axios";
import { BASE_URL, DOMAIN } from "@/config";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Star, 
  Users, 
  Zap, 
  ChevronRight,
  LayoutGrid,
  Palette,
  Code,
  Smartphone,
  Briefcase,
  Heart,
  Globe,
  Rocket,
  Award,
  Clock,
  Eye,
  Download,
  Filter,
  Grid3x3,
  List,
  ArrowUpRight,
  CheckCircle,
  Shield,
  Cpu,
  Building2,
  ShoppingCart,
  Brush,
  BookOpen,
  MonitorSmartphone,
  UtensilsCrossed,
  GraduationCap,
  Stethoscope,
  Home,
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
  Package,
  FolderOpen,
  MessageSquare,
  Gamepad2,
  HardHat,
  Scale,
  User,
  Church,
  VideoIcon,
  Tractor,
  Sparkle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [newTemplates, setNewTemplates] = useState<TemplateProps[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<TemplateProps[]>([]);
  const [popularCategories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("featured");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalAuthors: 0,
    totalSales: 0,
    avgRating: 0
  });

  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    
    Promise.all([
      axios.get(`${BASE_URL}/product/templates`),
      axios.get(`${BASE_URL}/product/categories-with-count`),
      axios.get(`${BASE_URL}/product/templates-random`),
      axios.get(`${BASE_URL}/product/all-stat`)
    ])
    .then(([templatesRes, categoriesRes, featuredRes, statsRes]) => {
      const templates = templatesRes.data.map(t => ({ ...t, id: `${t.id}` }));
      setNewTemplates(templates);
      
      
      const stats = statsRes.data;
        
      setStats({
        totalTemplates: stats.totalTemplates,
        totalAuthors: stats.totalAuthors,
        totalSales: stats.totalSales,
        avgRating: stats.avgRating
      });
      
      setCategories(categoriesRes.data);
      setFeaturedTemplates(featuredRes.data.map(t => ({ ...t, id: `${t.id}` })));
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/templates?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getCategoryIcon = (categoryName: string, className: string = "h-5 w-5") => {
    const name = categoryName.toLowerCase().trim();
    
    const iconMap: { [key: string]: JSX.Element } = {
      'business & corporate': <Building2 className={className} />,
      'business-corporate': <Building2 className={className} />,
      'business': <Building2 className={className} />,
      'corporate': <Building2 className={className} />,
      'e-commerce & shopping': <ShoppingCart className={className} />,
      'ecommerce-shopping': <ShoppingCart className={className} />,
      'ecommerce': <ShoppingCart className={className} />,
      'shopping': <ShoppingCart className={className} />,
      'online store': <ShoppingCart className={className} />,
      'portfolio & creative': <Brush className={className} />,
      'portfolio-creative': <Brush className={className} />,
      'portfolio': <Brush className={className} />,
      'creative': <Palette className={className} />,
      'blog & magazine': <BookOpen className={className} />,
      'blog-magazine': <BookOpen className={className} />,
      'blog': <BookOpen className={className} />,
      'magazine': <BookOpen className={className} />,
      'saas & technology': <MonitorSmartphone className={className} />,
      'saas-technology': <MonitorSmartphone className={className} />,
      'saas': <Cpu className={className} />,
      'technology': <Cpu className={className} />,
      'software': <Code className={className} />,
      'restaurant & food': <UtensilsCrossed className={className} />,
      'restaurant-food': <UtensilsCrossed className={className} />,
      'restaurant': <UtensilsCrossed className={className} />,
      'food': <UtensilsCrossed className={className} />,
      'education & learning': <GraduationCap className={className} />,
      'education-learning': <GraduationCap className={className} />,
      'education': <GraduationCap className={className} />,
      'learning': <GraduationCap className={className} />,
      'school': <GraduationCap className={className} />,
      'health & medical': <Stethoscope className={className} />,
      'health-medical': <Stethoscope className={className} />,
      'health': <Stethoscope className={className} />,
      'medical': <Stethoscope className={className} />,
      'healthcare': <Stethoscope className={className} />,
      'real estate & property': <Home className={className} />,
      'real-estate': <Home className={className} />,
      'real estate': <Home className={className} />,
      'property': <Home className={className} />,
      'travel & tourism': <Plane className={className} />,
      'travel-tourism': <Plane className={className} />,
      'travel': <Plane className={className} />,
      'tourism': <Plane className={className} />,
      'entertainment & media': <Film className={className} />,
      'entertainment-media': <Film className={className} />,
      'entertainment': <Film className={className} />,
      'media': <Film className={className} />,
      'fitness & sports': <Dumbbell className={className} />,
      'fitness-sports': <Dumbbell className={className} />,
      'fitness': <Dumbbell className={className} />,
      'sports': <Dumbbell className={className} />,
      'gym': <Dumbbell className={className} />,
      'wedding & events': <PartyPopper className={className} />,
      'wedding-events': <PartyPopper className={className} />,
      'wedding': <Heart className={className} />,
      'events': <PartyPopper className={className} />,
      'fashion & beauty': <Shirt className={className} />,
      'fashion-beauty': <Shirt className={className} />,
      'fashion': <Shirt className={className} />,
      'beauty': <Sparkle className={className} />,
      'automotive': <Car className={className} />,
      'car': <Car className={className} />,
      'vehicle': <Car className={className} />,
      'finance & banking': <DollarSign className={className} />,
      'finance-banking': <DollarSign className={className} />,
      'finance': <DollarSign className={className} />,
      'banking': <DollarSign className={className} />,
      'non-profit & charity': <HandHeart className={className} />,
      'non-profit': <HandHeart className={className} />,
      'charity': <HandHeart className={className} />,
      'ngo': <HandHeart className={className} />,
      'landing pages': <Megaphone className={className} />,
      'landing-pages': <Megaphone className={className} />,
      'landing page': <Rocket className={className} />,
      'dashboard & admin': <BarChart3 className={className} />,
      'dashboard-admin': <BarChart3 className={className} />,
      'dashboard': <BarChart3 className={className} />,
      'admin': <LayoutGrid className={className} />,
      'mobile app ui': <Smartphone className={className} />,
      'mobile-app': <Smartphone className={className} />,
      'mobile': <Smartphone className={className} />,
      'app': <Smartphone className={className} />,
      'directory & listing': <FolderOpen className={className} />,
      'directory-listing': <FolderOpen className={className} />,
      'directory': <FolderOpen className={className} />,
      'listing': <List className={className} />,
      'community & social': <MessageSquare className={className} />,
      'community-social': <MessageSquare className={className} />,
      'community': <Users className={className} />,
      'social': <MessageSquare className={className} />,
      'gaming & esports': <Gamepad2 className={className} />,
      'gaming-esports': <Gamepad2 className={className} />,
      'gaming': <Gamepad2 className={className} />,
      'esports': <Gamepad2 className={className} />,
      'construction & architecture': <HardHat className={className} />,
      'construction-architecture': <HardHat className={className} />,
      'construction': <HardHat className={className} />,
      'architecture': <HardHat className={className} />,
      'legal & law': <Scale className={className} />,
      'legal-law': <Scale className={className} />,
      'legal': <Scale className={className} />,
      'law': <Scale className={className} />,
      'personal & resume': <User className={className} />,
      'personal-resume': <User className={className} />,
      'personal': <User className={className} />,
      'resume': <User className={className} />,
      'cv': <User className={className} />,
      'music & audio': <Music className={className} />,
      'music-audio': <Music className={className} />,
      'music': <Music className={className} />,
      'audio': <Music className={className} />,
      'photography & video': <Camera className={className} />,
      'photography-video': <Camera className={className} />,
      'photography': <Camera className={className} />,
      'video': <VideoIcon className={className} />,
      'agriculture & farming': <Wheat className={className} />,
      'agriculture-farming': <Wheat className={className} />,
      'agriculture': <Wheat className={className} />,
      'farming': <Tractor className={className} />,
      'minimal & clean': <Minimize2 className={className} />,
      'minimal-clean': <Minimize2 className={className} />,
      'minimal': <Minimize2 className={className} />,
      'clean': <Sparkles className={className} />,
    };

    return iconMap[name] || <LayoutGrid className={className} />;
  };

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

  const navItems = [
    { label: "Categories", href: "/categories" },
    { label: "Featured", href: "/templates?sort=featured" },
    { label: "Trending", href: "/templates?sort=trending" },
    { label: "Free", href: "/templates?free=true" },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg md:hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <form onSubmit={handleSearch} className="flex-1 mr-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search templates..."
                  className="pl-10 pr-4 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </form>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowMobileSearch(false)}
            >
              ✕
            </Button>
          </div>
          <div className="p-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block py-3 text-lg font-medium border-b"
                onClick={() => setShowMobileSearch(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative w-full min-h-[90vh] md:min-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-950"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-violet-600/10 to-purple-600/10 blur-3xl"></div>
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full bg-[linear-gradient(90deg,#8882_1px,transparent_1px),linear-gradient(180deg,#8882_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          </div>
        </div>

        <div className="absolute top-20 left-10 hidden lg:block animate-float">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border border-white/20 rotate-12"></div>
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300" />
          </div>
        </div>
        <div className="absolute bottom-20 right-10 hidden lg:block animate-float" style={{ animationDelay: "1s" }}>
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-transparent backdrop-blur-sm border border-cyan-300/20"></div>
        </div>
        
        <div className="relative z-10 w-full h-full flex items-center">
          <div className="px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-6xl mx-auto">
              <div className="space-y-8 md:space-y-12 text-center">
                <div className="flex justify-center">
                  <Badge className="animate-fade-in bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 backdrop-blur-sm shadow-lg shadow-cyan-500/25 px-6 py-2">
                    <Rocket className="mr-2 h-4 w-4" />
                    <span className="font-semibold text-sm md:text-base">Launch Your Project in Minutes</span>
                  </Badge>
                </div>
                
                <div className="space-y-4 md:space-y-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight tracking-tight">
                    <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent animate-gradient">
                      Build Faster
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent animate-gradient" style={{ animationDelay: "0.5s" }}>
                      Ship Sooner
                    </span>
                  </h1>
                  
                  <p className="mx-auto max-w-3xl text-base sm:text-lg md:text-xl text-white/80 leading-relaxed animate-fade-in animation-delay-300">
                    Discover thousands of premium templates crafted by top designers. 
                    From startups to enterprises, we have the perfect design for your next project.
                  </p>
                </div>
                
                <form 
                  onSubmit={handleSearch}
                  className="mx-auto max-w-4xl animate-slide-up animation-delay-500"
                >
                  <div className="relative bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-2 shadow-2xl shadow-black/20">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
                        <Input
                          type="search"
                          placeholder="Search templates, categories, or authors..."
                          className="h-12 sm:h-14 md:h-16 pl-12 pr-4 text-base sm:text-lg border-0 bg-transparent text-white placeholder:text-white/60 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="h-12 sm:h-14 md:h-16 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 rounded-xl px-6 sm:px-8 font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300"
                      >
                        <Search className="mr-2 h-5 w-5" />
                        <span className="hidden sm:inline">Search Templates</span>
                        <span className="sm:hidden">Search</span>
                      </Button>
                    </div>
                  </div>
                </form>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 animate-slide-up animation-delay-700 max-w-4xl mx-auto">
                  {[
                    { icon: <Grid3x3 />, value: `${stats.totalTemplates}+`, label: "Templates", color: "from-cyan-500 to-blue-500", delay: "0s" },
                    { icon: <Users />, value: `${stats.totalAuthors}+`, label: "Creators", color: "from-purple-500 to-pink-500", delay: "0.1s" },
                    { icon: <TrendingUp />, value: `${stats.totalSales.toLocaleString()}+`, label: "Sales", color: "from-green-500 to-emerald-500", delay: "0.2s" },
                    { icon: <Star className="fill-current" />, value: stats.avgRating.toFixed(1), label: "Avg Rating", color: "from-amber-500 to-orange-500", delay: "0.3s" },
                  ].map((stat, index) => (
                    <div 
                      key={index}
                      className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 p-4 hover:border-cyan-500/30 transition-all duration-300 hover:scale-[1.02]"
                      style={{ animationDelay: stat.delay }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className={`p-3 rounded-lg md:rounded-xl bg-gradient-to-br ${stat.color} text-white mb-3`}>
                          {stat.icon}
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs sm:text-sm text-white/60 mt-1">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-white/60 text-sm">Scroll to explore</span>
                    <div className="h-10 w-px bg-gradient-to-b from-cyan-500 via-white/50 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REDUCED GAPS - Changed from py-12 md:py-20 lg:py-24 to py-8 md:py-12 lg:py-14 */}
      
      {/* Trending Categories */}
      <section className="py-8 md:py-12 lg:py-14 bg-gradient-to-b from-background to-gray-50 dark:to-gray-900">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 md:mb-10 gap-4">
              <div className="max-w-2xl">
                <Badge variant="outline" className="mb-3 md:mb-4 animate-fade-in border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                  <TrendingUp className="mr-2 h-3 w-3" />
                  Hot Categories
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
                  Popular <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Categories</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                  Browse through our most popular design categories
                </p>
              </div>
              <Button variant="ghost" asChild className="group self-end">
                <Link to="/categories" className="text-sm sm:text-base">
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
              {[...Array()].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 sm:p-6">
                    <Skeleton className="h-12 w-12 rounded-xl mx-auto mb-4" />
                    <Skeleton className="h-4 w-24 mx-auto mb-2" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative">
            <ScrollArea className="w-full whitespace-nowrap px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-3 sm:space-x-4 md:space-x-6 pb-4 max-w-7xl mx-auto">
                {popularCategories.map((category, index) => (
                  <Link
                    key={category.slug || category.name}
                    to={`/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="group relative shrink-0 w-48 sm:w-56"
                  >
                    <Card className="overflow-hidden border-2 border-transparent group-hover:border-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                      <div className="relative h-32 sm:h-40 overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(category.name)} opacity-80`}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          {getCategoryIcon(category.name, "h-12 w-12 sm:h-14 sm:w-14")}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                      <CardContent className="p-4 sm:p-6 relative">
                        <div className="absolute -top-5 left-4 sm:left-6">
                          <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getCategoryColor(category.name)} flex items-center justify-center shadow-lg text-white`}>
                            {getCategoryIcon(category.name, "h-5 w-5")}
                          </div>
                        </div>
                        <div className="pt-4">
                          <h3 className="font-semibold text-base sm:text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {category.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {category.count || '0'} templates
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
      </section>

      {/* Featured Templates - REDUCED GAP */}
      <section className="py-8 md:py-12 lg:py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-background/50 to-background dark:from-gray-900 dark:via-background/50 dark:to-background -z-10"></div>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
            <div className="text-center mb-10 md:mb-14">
              <Badge className="mb-6 animate-fade-in bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Award className="mr-2 h-3 w-3" />
                Editor's Choice
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Featured <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Masterpieces</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Handpicked by our design team for exceptional quality and innovation
              </p>
            </div>

            <Tabs defaultValue="featured" className="space-y-8" onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                <TabsTrigger value="featured" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Featured
                </TabsTrigger>
                <TabsTrigger value="trending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="new" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500">
                  <Clock className="mr-2 h-4 w-4" />
                  New
                </TabsTrigger>
              </TabsList>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array()].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  <TabsContent value="featured" className="animate-in fade-in-50">
                    <TemplateGrid templates={featuredTemplates} title="" description="" />
                  </TabsContent>
                  <TabsContent value="trending" className="animate-in fade-in-50">
                    <TemplateGrid templates={[...newTemplates].sort((a, b) => b.sales - a.sales)} title="" description="" />
                  </TabsContent>
                  <TabsContent value="new" className="animate-in fade-in-50">
                    <TemplateGrid templates={newTemplates} title="" description="" />
                  </TabsContent>
                </>
              )}
            </Tabs>

            <div className="mt-10 md:mt-14 text-center">
              <Button asChild size="lg" className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-500/25 px-8 py-6">
                <Link to="/templates">
                  Explore All Templates
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - REDUCED GAP */}
      <section className="py-8 md:py-12 lg:py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 -z-10"></div>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
            <div className="text-center mb-10 md:mb-14">
              <Badge variant="outline" className="mb-6 animate-fade-in border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                <CheckCircle className="mr-2 h-3 w-3" />
                Premium Quality
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Why <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Choose Us</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We provide the best experience for both designers and developers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Shield className="h-8 w-8" />, title: "Quality Guaranteed", description: "All templates pass our strict quality guidelines", color: "from-blue-500 to-cyan-500" },
                { icon: <Download className="h-8 w-8" />, title: "Instant Access", description: "Download immediately after purchase", color: "from-purple-500 to-pink-500" },
                { icon: <Cpu className="h-8 w-8" />, title: "Regular Updates", description: "Templates are regularly updated", color: "from-green-500 to-emerald-500" },
                { icon: <Globe className="h-8 w-8" />, title: "Global Community", description: "Join 50k+ designers worldwide", color: "from-amber-500 to-orange-500" }
              ].map((feature, index) => (
                <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  <CardContent className="p-8 relative z-10">
                    <div className={`mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Templates - REDUCED GAP */}
      <section className="py-8 md:py-12 lg:py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background -z-10"></div>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 md:mb-14 gap-4">
              <div className="max-w-2xl">
                <Badge className="mb-4 animate-fade-in bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                  <Zap className="mr-2 h-3 w-3" />
                  Fresh Arrivals
                </Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  Latest <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Creations</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Discover the newest templates added to our marketplace
                </p>
              </div>
              <Button variant="outline" asChild className="group">
                <Link to="/templates?sort=newest" className="gap-2">
                  View All New
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array()].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <TemplateGrid templates={newTemplates} title="" description="" />
            )}

            <div className="mt-10 md:mt-14 text-center">
              <Button asChild variant="outline" size="lg" className="group">
                <Link to="/templates?sort=newest">
                  <Clock className="mr-3 h-5 w-5" />
                  View All New Templates
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Seller - REDUCED GAP */}
      <section className="relative py-12 md:py-16 lg:py-18 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070')] opacity-10 bg-cover bg-center"></div>
        </div>
        
        <div className="absolute top-0 left-0 h-96 w-96 animate-spin-slow">
          <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
        </div>
        <div className="absolute bottom-0 right-0 h-96 w-96 animate-spin-slow" style={{ animationDirection: 'reverse' }}>
          <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
        </div>
        
        <div className="relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Card className="border-0 bg-blue-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden">
              <CardContent className="p-8 md:p-12 lg:p-16">
                <div className="text-center space-y-8">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-6 py-2">
                    <Heart className="mr-2 h-3 w-3 fill-white" />
                    Join Our Community
                  </Badge>
                  
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                    Turn Your Designs Into{" "}
                    <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent">
                      Revenue
                    </span>
                  </h2>
                  
                  <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                    Join thousands of designers earning from their creative work. 
                    Share your templates with the world and build your design career.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                    {[
                      { icon: <TrendingUp />, title: "85% Revenue Share", desc: "Highest in the industry" },
                      { icon: <Users />, title: "2M+ Users", desc: "Global audience reach" },
                      { icon: <Shield />, title: "Secure Payments", desc: "Guaranteed payouts" },
                    ].map((item, index) => (
                      <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                        <CardContent className="p-6 text-center">
                          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 mb-4">
                            {item.icon}
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                          <p className="text-sm text-white/80">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      asChild 
                      size="lg"
                      className="bg-gradient-to-r from-white to-white/90 text-blue-600 hover:from-white hover:to-white hover:shadow-xl hover:shadow-white/30 font-semibold px-8 py-6"
                    >
                      <Link to="/become-seller">
                        <Rocket className="mr-3 h-5 w-5" />
                        Start Selling Now
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      size="lg"
                      variant="outline"
                     className="bg-gradient-to-r from-white to-white/90 text-blue-600 hover:from-white hover:to-white hover:shadow-xl hover:shadow-white/30 font-semibold px-8 py-6"
                    >
                      <Link to="/seller-guide">
                        Learn More
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer CTA - REDUCED GAP */}
      <section className="py-8 md:py-12 lg:py-14 bg-gradient-to-b from-background to-background/95">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="max-w-2xl text-left">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                      Ready to <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Start Building</span>?
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      Join thousands of developers and designers who are already creating amazing projects with our templates.
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    asChild 
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-xl hover:shadow-blue-500/25 px-8 py-6"
                  >
                    <Link to="/templates">
                      Browse All Templates
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 40s linear infinite;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-700 { animation-delay: 700ms; }
      `}</style>
    </div>
  );
};

export default Index;