import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  LayoutGrid,
  TrendingUp,
  Sparkles,
  ArrowRight,
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
  VideoIcon,
  Tractor,
  Sparkle,
  Cpu,
  Code,
  Palette,
  Smartphone,
  ChevronRight,
  SlidersHorizontal,
  Grid3x3
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${BASE_URL}/product/categories-with-count`)
      .then((response) => {
        setCategories(response.data);
        setFilteredCategories(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setIsLoading(false);
      });
  }, []);

  // Filter and sort categories
  useEffect(() => {
    let filtered = [...categories];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "count-desc":
        filtered.sort((a, b) => (b.count || 0) - (a.count || 0));
        break;
      case "count-asc":
        filtered.sort((a, b) => (a.count || 0) - (b.count || 0));
        break;
    }

    setFilteredCategories(filtered);
  }, [searchQuery, sortBy, categories]);

  // Get category icon
  const getCategoryIcon = (categoryName: string, className: string = "h-6 w-6") => {
    const name = categoryName.toLowerCase().trim();

    const iconMap: { [key: string]: JSX.Element } = {
      'business & corporate': <Building2 className={className} />,
      'business-corporate': <Building2 className={className} />,
      'e-commerce & shopping': <ShoppingCart className={className} />,
      'ecommerce-shopping': <ShoppingCart className={className} />,
      'portfolio & creative': <Brush className={className} />,
      'portfolio-creative': <Brush className={className} />,
      'blog & magazine': <BookOpen className={className} />,
      'blog-magazine': <BookOpen className={className} />,
      'saas & technology': <MonitorSmartphone className={className} />,
      'saas-technology': <MonitorSmartphone className={className} />,
      'restaurant & food': <UtensilsCrossed className={className} />,
      'restaurant-food': <UtensilsCrossed className={className} />,
      'education & learning': <GraduationCap className={className} />,
      'education-learning': <GraduationCap className={className} />,
      'health & medical': <Stethoscope className={className} />,
      'health-medical': <Stethoscope className={className} />,
      'real estate & property': <Home className={className} />,
      'real-estate': <Home className={className} />,
      'travel & tourism': <Plane className={className} />,
      'travel-tourism': <Plane className={className} />,
      'entertainment & media': <Film className={className} />,
      'entertainment-media': <Film className={className} />,
      'fitness & sports': <Dumbbell className={className} />,
      'fitness-sports': <Dumbbell className={className} />,
      'wedding & events': <PartyPopper className={className} />,
      'wedding-events': <PartyPopper className={className} />,
      'fashion & beauty': <Shirt className={className} />,
      'fashion-beauty': <Shirt className={className} />,
      'automotive': <Car className={className} />,
      'finance & banking': <DollarSign className={className} />,
      'finance-banking': <DollarSign className={className} />,
      'non-profit & charity': <HandHeart className={className} />,
      'non-profit': <HandHeart className={className} />,
      'landing pages': <Megaphone className={className} />,
      'landing-pages': <Megaphone className={className} />,
      'dashboard & admin': <BarChart3 className={className} />,
      'dashboard-admin': <BarChart3 className={className} />,
      'mobile app ui': <Smartphone className={className} />,
      'mobile-app': <Smartphone className={className} />,
      'directory & listing': <FolderOpen className={className} />,
      'directory-listing': <FolderOpen className={className} />,
      'community & social': <MessageSquare className={className} />,
      'community-social': <MessageSquare className={className} />,
      'gaming & esports': <Gamepad2 className={className} />,
      'gaming-esports': <Gamepad2 className={className} />,
      'construction & architecture': <HardHat className={className} />,
      'construction-architecture': <HardHat className={className} />,
      'legal & law': <Scale className={className} />,
      'legal-law': <Scale className={className} />,
      'personal & resume': <User className={className} />,
      'personal-resume': <User className={className} />,
      'music & audio': <Music className={className} />,
      'music-audio': <Music className={className} />,
      'photography & video': <Camera className={className} />,
      'photography-video': <Camera className={className} />,
      'agriculture & farming': <Wheat className={className} />,
      'agriculture-farming': <Wheat className={className} />,
      'minimal & clean': <Minimize2 className={className} />,
      'minimal-clean': <Minimize2 className={className} />,
    };

    return iconMap[name] || <LayoutGrid className={className} />;
  };

  // Get category color
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

  const totalTemplates = categories.reduce((sum, cat) => sum + (cat.count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/30 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-brand-600 py-16 md:py-24 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-white/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/30">
              <LayoutGrid className="mr-2 h-3 w-3" />
              Explore Categories
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black">
              Browse by{" "}
              <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent">
                Category
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Discover {totalTemplates.toLocaleString()}+ premium templates across {categories.length} specialized categories
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
                <Input
                  type="search"
                  placeholder="Search categories..."
                  className="h-14 pl-12 pr-4 bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Filters & View Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {filteredCategories.length} {filteredCategories.length === 1 ? 'Category' : 'Categories'}
              </Badge>
              {searchQuery && (
                <Badge variant="outline" className="text-sm">
                  Search: "{searchQuery}"
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-10">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="count-desc">Most Templates</SelectItem>
                  <SelectItem value="count-asc">Least Templates</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-accent rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Categories Display */}
          {isLoading ? (
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCategories.length > 0 ? (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCategories.map((category, index) => (
                    <Link
                      key={category.slug || category.name}
                      to={`/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Card className="h-full border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 overflow-hidden">
                        {/* Card Header with Gradient */}
                        <div className={`relative h-32 bg-gradient-to-br ${getCategoryColor(category.name)} overflow-hidden`}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          <div className="absolute inset-0 flex items-center justify-center text-white">
                            {getCategoryIcon(category.name, "h-16 w-16 drop-shadow-lg")}
                          </div>
                          
                          {/* Template Count Badge */}
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-white/90 text-gray-900 border-0 shadow-lg">
                              <TrendingUp className="mr-1 h-3 w-3" />
                              {category.count || 0}
                            </Badge>
                          </div>
                        </div>

                        {/* Card Content */}
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {category.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {category.count || 0} template{category.count !== 1 ? 's' : ''} available
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Popularity</span>
                              <span>{totalTemplates > 0 ? Math.round((category.count / totalTemplates) * 100) : 0}%</span>
                            </div>
                            <div className="h-2 bg-accent rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${getCategoryColor(category.name)} transition-all duration-500`}
                                style={{ width: `${totalTemplates > 0 ? (category.count / totalTemplates) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  {filteredCategories.map((category, index) => (
                    <Link
                      key={category.slug || category.name}
                      to={`/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="group"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <Card className="border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-6">
                            {/* Icon */}
                            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getCategoryColor(category.name)} text-white shadow-lg`}>
                              {getCategoryIcon(category.name, "h-10 w-10")}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                  {category.name}
                                </h3>
                                <Badge className="shrink-0">
                                  {category.count || 0} templates
                                </Badge>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  <span>{category.count || 0} products</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>{totalTemplates > 0 ? Math.round((category.count / totalTemplates) * 100) : 0}% of total</span>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="mt-3 h-2 bg-accent rounded-full overflow-hidden max-w-md">
                                <div
                                  className={`h-full bg-gradient-to-r ${getCategoryColor(category.name)} transition-all duration-500`}
                                  style={{ width: `${totalTemplates > 0 ? (category.count / totalTemplates) * 100 : 0}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Arrow */}
                            <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="mx-auto max-w-md space-y-4">
                  <div className="h-20 w-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold">No Categories Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search query to find what you're looking for.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Footer */}
          {filteredCategories.length > 0 && !isLoading && (
            <div className="mt-12 pt-8 border-t">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {categories.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {totalTemplates.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Templates</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {Math.round(totalTemplates / categories.length)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg per Category</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {filteredCategories.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Showing Now</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-brand-600/10 to-primary/10">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Browse all our templates or use our advanced search to find exactly what you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-brand-600">
              <Link to="/templates">
                Browse All Templates
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/templates">
                <Search className="mr-2 h-5 w-5" />
                Advanced Search
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoriesPage;