import { useState, useEffect } from "react";
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
  Cpu
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [newTemplates, setNewTemplates] = useState<TemplateProps[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<TemplateProps[]>([]);
  const [popularCategories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("featured");
  
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalAuthors: 0,
    totalSales: 0,
    avgRating: 0
  });

  useEffect(() => {
    setIsLoading(true);
    
    Promise.all([
      axios.get(`${BASE_URL}/product/templates`),
      axios.get(`${BASE_URL}/product/categories-with-count`),
      axios.get(`${BASE_URL}/product/templates-random`)
    ])
    .then(([templatesRes, categoriesRes, featuredRes]) => {
      const templates = templatesRes.data.map(t => ({ ...t, id: `${t.id}` }));
      setNewTemplates(templates);
      
      const totalSales = templates.reduce((sum: number, t: TemplateProps) => sum + t.sales, 0);
      const avgRating = templates.length > 0 
        ? templates.reduce((sum: number, t: TemplateProps) => sum + t.rating, 0) / templates.length
        : 0;
        
      setStats({
        totalTemplates: templates.length,
        totalAuthors: new Set(templates.map((t: TemplateProps) => t.author?.id || "")).size,
        totalSales,
        avgRating: parseFloat(avgRating.toFixed(1))
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/templates?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('web') || name.includes('design')) return <LayoutGrid className="h-5 w-5" />;
    if (name.includes('mobile') || name.includes('app')) return <Smartphone className="h-5 w-5" />;
    if (name.includes('business') || name.includes('corporate')) return <Briefcase className="h-5 w-5" />;
    if (name.includes('creative') || name.includes('art')) return <Palette className="h-5 w-5" />;
    return <Code className="h-5 w-5" />;
  };

  const trendingCategories = [
    { name: "E-commerce", icon: "🛒", color: "from-blue-500 to-cyan-500", count: 142 },
    { name: "Portfolio", icon: "🎨", color: "from-purple-500 to-pink-500", count: 89 },
    { name: "Dashboard", icon: "📊", color: "from-green-500 to-emerald-500", count: 156 },
    { name: "Blog", icon: "✍️", color: "from-orange-500 to-red-500", count: 234 },
    { name: "Mobile App", icon: "📱", color: "from-indigo-500 to-blue-500", count: 178 },
    { name: "Landing Page", icon: "🚀", color: "from-red-500 to-orange-500", count: 312 },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section - Full Width */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-950 py-16 md:py-24 lg:py-32 text-white">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-violet-600/30 to-purple-600/30 blur-3xl"></div>
          <div className="absolute top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-3xl" style={{ animationDelay: "1s" }}></div>
          <div className="absolute -bottom-40 left-1/2 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-pink-600/20 to-rose-600/20 blur-3xl" style={{ animationDelay: "2s" }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float hidden lg:block">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border border-white/20 rotate-12"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float hidden lg:block" style={{ animationDelay: "1s" }}>
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-transparent backdrop-blur-sm border border-cyan-300/20"></div>
        </div>
        
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="space-y-8 md:space-y-10 text-center">
            <Badge className="mb-4 animate-fade-in bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 backdrop-blur-sm shadow-lg shadow-cyan-500/25">
              <Rocket className="mr-2 h-3 w-3" />
              <span className="font-semibold text-xs sm:text-sm">Launch Your Project in Minutes</span>
            </Badge>
            
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent animate-gradient">
                  Build Faster
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent animate-gradient" style={{ animationDelay: "0.5s" }}>
                  Ship Sooner
                </span>
              </h1>
              
              <p className="mx-auto max-w-3xl text-base sm:text-lg md:text-xl text-white/80 leading-relaxed animate-fade-in animation-delay-300 px-4">
                Discover thousands of premium templates crafted by top designers. 
                From startups to enterprises, we have the perfect design for your next project.
              </p>
            </div>
            
            {/* Enhanced Search */}
            <form 
              onSubmit={handleSearch}
              className="mx-auto max-w-4xl animate-slide-up animation-delay-500 px-4"
            >
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-2 shadow-2xl shadow-black/20">
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
                    <span className="hidden sm:inline">Search</span>
                  </Button>
                </div>
              </div>
            </form>
            
            {/* Enhanced Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 pt-6 md:pt-8 animate-slide-up animation-delay-700 px-4">
              {[
                { icon: <Grid3x3 />, value: `${stats.totalTemplates}+`, label: "Templates", color: "from-cyan-500 to-blue-500" },
                { icon: <Users />, value: `${stats.totalAuthors}+`, label: "Creators", color: "from-purple-500 to-pink-500" },
                { icon: <TrendingUp />, value: `${stats.totalSales.toLocaleString()}+`, label: "Sales", color: "from-green-500 to-emerald-500" },
                { icon: <Star className="fill-current" />, value: stats.avgRating.toFixed(1), label: "Avg Rating", color: "from-amber-500 to-orange-500" },
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 p-4 md:p-6 hover:border-cyan-500/30 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-lg md:rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                      {stat.icon}
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs sm:text-sm text-white/60">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Categories - Full Width Carousel */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background to-gray-50 dark:to-gray-900">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 md:mb-12 gap-4">
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
              {[...Array(6)].map((_, i) => (
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
                {[...popularCategories, ...trendingCategories].slice(0, 8).map((category, index) => (
                  <Link
                    key={category.slug || category.name}
                    to={`/category/${category.slug || category.name.toLowerCase().replace(' ', '-')}`}
                    className="group relative shrink-0 w-48 sm:w-56"
                  >
                    <Card className="overflow-hidden border-2 border-transparent group-hover:border-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                      <div className="relative h-32 sm:h-40 overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color || 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'} opacity-80`}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-4xl sm:text-5xl">{category.icon || getCategoryIcon(category.name)}</div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                      <CardContent className="p-4 sm:p-6 relative">
                        <div className="absolute -top-5 left-4 sm:left-6">
                          <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-lg">
                            <div className="text-lg sm:text-xl">{category.icon || getCategoryIcon(category.name)}</div>
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

      {/* Featured Templates with Tabs - Full Width */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-background dark:from-gray-900 dark:to-background">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <Badge className="mb-3 md:mb-4 animate-fade-in bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Award className="mr-2 h-3 w-3" />
                Award Winning
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
                Curated <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Collections</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Handpicked templates that meet our highest standards of quality and design
              </p>
            </div>

            <Tabs defaultValue="featured" className="space-y-6 md:space-y-8" onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                <TabsTrigger value="featured" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 text-xs sm:text-sm">
                  <Sparkles className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Featured</span>
                  <span className="sm:hidden">Top</span>
                </TabsTrigger>
                <TabsTrigger value="trending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 text-xs sm:text-sm">
                  <TrendingUp className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Trending</span>
                  <span className="sm:hidden">Hot</span>
                </TabsTrigger>
                <TabsTrigger value="new" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 text-xs sm:text-sm">
                  <Clock className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  New
                </TabsTrigger>
              </TabsList>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {[...Array(4)].map((_, i) => (
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
                    <TemplateGrid
                      templates={featuredTemplates.slice(0, 8)}
                      title=""
                      description=""
                    />
                  </TabsContent>
                  <TabsContent value="trending" className="animate-in fade-in-50">
                    <TemplateGrid
                      templates={[...newTemplates].sort((a, b) => b.sales - a.sales).slice(0, 8)}
                      title=""
                      description=""
                    />
                  </TabsContent>
                  <TabsContent value="new" className="animate-in fade-in-50">
                    <TemplateGrid
                      templates={newTemplates.slice(0, 8)}
                      title=""
                      description=""
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>

            <div className="mt-8 md:mt-12 text-center">
              <Button asChild size="lg" className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-500/25">
                <Link to="/templates">
                  Explore All Templates
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Full Width */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background to-gray-50 dark:to-gray-900">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <Badge variant="outline" className="mb-3 md:mb-4 animate-fade-in border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                <CheckCircle className="mr-2 h-3 w-3" />
                Premium Quality
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
                Why <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Choose Us</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                We provide the best experience for both designers and developers
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  icon: <Shield className="h-6 w-6 sm:h-8 sm:w-8" />,
                  title: "Quality Guaranteed",
                  description: "All templates pass our strict quality guidelines",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: <Download className="h-6 w-6 sm:h-8 sm:w-8" />,
                  title: "Instant Access",
                  description: "Download immediately after purchase",
                  color: "from-purple-500 to-pink-500"
                },
                {
                  icon: <Cpu className="h-6 w-6 sm:h-8 sm:w-8" />,
                  title: "Regular Updates",
                  description: "Templates are regularly updated",
                  color: "from-green-500 to-emerald-500"
                },
                {
                  icon: <Globe className="h-6 w-6 sm:h-8 sm:w-8" />,
                  title: "Global Community",
                  description: "Join 50k+ designers worldwide",
                  color: "from-amber-500 to-orange-500"
                }
              ].map((feature, index) => (
                <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  <CardContent className="p-6 sm:p-8 relative z-10">
                    <div className={`mb-4 sm:mb-6 inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} text-white`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Templates Section - Full Width */}
      <section className="py-12 md:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 md:mb-12 gap-4">
              <div className="max-w-2xl">
                <Badge className="mb-3 md:mb-4 animate-fade-in bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                  <Zap className="mr-2 h-3 w-3" />
                  Fresh Arrivals
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
                  Latest <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Templates</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                  Discover the newest additions to our collection
                </p>
              </div>
              <Button variant="outline" asChild className="group self-end">
                <Link to="/templates?sort=newest" className="text-sm sm:text-base">
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
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
              <TemplateGrid
                templates={newTemplates.slice(0, 8)}
                title=""
                description=""
              />
            )}

            <div className="mt-8 md:mt-12 text-center">
              <Button asChild variant="outline" size="lg" className="group">
                <Link to="/templates?sort=newest">
                  <Clock className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">View All New Templates</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Seller Section - Full Width */}
      <section className="relative py-16 md:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070')] opacity-10 bg-cover bg-center"></div>
        </div>
        
        {/* Animated elements */}
        <div className="absolute top-0 left-0 h-64 w-64 md:h-96 md:w-96 animate-spin-slow">
          <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
        </div>
        <div className="absolute bottom-0 right-0 h-64 w-64 md:h-96 md:w-96 animate-spin-slow" style={{ animationDirection: 'reverse' }}>
          <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
        </div>
        
        <div className="relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <Card className="border-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-2xl shadow-black/30">
              <CardContent className="p-6 sm:p-8 md:p-12">
                <div className="text-center space-y-4 md:space-y-6">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    <Heart className="mr-2 h-3 w-3 fill-white" />
                    Join Our Community
                  </Badge>
                  
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                    Ready to <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 bg-clip-text text-transparent">Share Your Talent</span>?
                  </h2>
                  
                  <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                    Join thousands of designers earning from their creative work. 
                    Share your templates with the world and build your design career.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 my-6 md:my-10">
                    {[
                      { icon: <TrendingUp />, title: "85% Revenue Share", desc: "Highest in the industry" },
                      { icon: <Users />, title: "2M+ Users", desc: "Global audience reach" },
                      { icon: <Shield />, title: "Secure Payments", desc: "Guaranteed payouts" },
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 mb-3 sm:mb-4">
                          {item.icon}
                        </div>
                        <h4 className="text-base sm:text-lg font-semibold text-white mb-1">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-white/60">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Button 
                      asChild 
                      size="lg"
                      className="bg-gradient-to-r from-white to-white/90 text-blue-600 hover:from-white hover:to-white hover:shadow-xl hover:shadow-white/30 font-semibold"
                    >
                      <Link to="/become-seller">
                        <Rocket className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-sm sm:text-base">Start Selling Today</span>
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Link to="/seller-guide">
                        <span className="text-sm sm:text-base">Learn More</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer CTA - Full Width */}
      <section className="py-8 md:py-12 bg-gradient-to-r from-gray-50 to-background dark:from-gray-900 dark:to-background">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <CardContent className="p-6 sm:p-8 text-center">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                  Ready to <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Start Building</span>?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-xl mx-auto">
                  Join thousands of developers and designers who are already creating amazing projects with our templates.
                </p>
                <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-xl hover:shadow-blue-500/25">
                  <Link to="/templates">
                    <span className="text-sm sm:text-base">Browse All Templates</span>
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
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