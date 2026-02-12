import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import TemplateGrid from "@/components/templates/TemplateGrid";
import { TemplateProps } from "@/components/templates/TemplateCard";
import axios from "axios";
import { BASE_URL } from "@/config";
import { 
  Search, 
  Filter, 
  X, 
  Sparkles, 
  TrendingUp, 
  Star, 
  Zap, 
  DollarSign,
  Grid,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Tag,
  Award,
  Flame,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  Settings,
  Menu,
  Grid3x3,
  SlidersHorizontal,
  ArrowUpDown,
  TrendingDown,
  Rocket,
  Sparkle,
  Plus,
  Minus,
  Heart,
  Check,
  BarChart3,
  Layers,
  IndianRupee
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const TrandingPage = () => {
  const [allTemplates, setAllTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [ratingAbove4, setRatingAbove4] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sortOptions, setSortOptions] = useState([]);
  const [limit, setLimit] = useState(48);
  const [offset, setOffset] = useState(0);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Calculate active filters
  useEffect(() => {
    let count = 0;
    if (category !== "all") count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
    if (showFreeOnly) count++;
    if (ratingAbove4) count++;
    if (searchQuery) count++;
    setActiveFiltersCount(count);
  }, [category, priceRange, showFreeOnly, ratingAbove4, searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesRes, sortRes, templatesRes] = await Promise.all([
          axios.get(`${BASE_URL}/product/categories`),
          axios.get(`${BASE_URL}/product/sort-options`),
          axios.get(`${BASE_URL}/product/trending`, {
            params: {
              search: searchQuery || undefined,
              category: category !== "all" ? category : undefined,
              sort_by: sortBy,
              min_price: priceRange[0],
              max_price: priceRange[1],
              free_only: showFreeOnly,
              rating_above: ratingAbove4 ? 4 : undefined,
              limit,
              offset
            }
          })
        ]);

        setCategories(categoriesRes.data);
        setSortOptions(sortRes.data);
        const templates = templatesRes.data;
        setAllTemplates(templates.products);
        setFilteredTemplates(templates.products);
        setTotalTemplates(templates.total);
        
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [offset, limit, searchQuery, category, sortBy, priceRange, showFreeOnly, ratingAbove4]);

  const applyFilters = () => {
    // Already filtered by API
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, category, sortBy, priceRange, showFreeOnly, ratingAbove4]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleNext = () => {
    if (offset + limit < totalTemplates) {
      setOffset(offset + limit);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (offset > 0) {
      setOffset(offset - limit);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setSortBy("newest");
    setPriceRange([0, 10000]);
    setShowFreeOnly(false);
    setRatingAbove4(false);
    setOffset(0);
    setIsFilterSheetOpen(false);
  };

  const getSortIcon = (value: string) => {
    switch (value) {
      case "newest": return <Clock className="h-4 w-4" />;
      case "price-asc": return <IndianRupee className="h-4 w-4" />;
      case "price-desc": return <IndianRupee className="h-4 w-4" />;
      case "rating": return <Star className="h-4 w-4" />;
      case "popularity": return <TrendingUp className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  // Stats for display
  const stats = {
    freeTemplates: filteredTemplates.filter(t => t.price === 0).length,
    avgRating: filteredTemplates.length > 0 
      ? (filteredTemplates.reduce((acc, t) => acc + t.rating, 0) / filteredTemplates.length).toFixed(1)
      : '0.0',
    totalSales: filteredTemplates.reduce((acc, t) => acc + t.sales, 0).toLocaleString(),
    totalTemplates: filteredTemplates.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      {/* Hero Header - Full Width with Gradient */}
   

      {/* Floating Filter Button */}
   

      {/* Main Content Area */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
          {/* Top Bar - Stats and Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {filteredTemplates.length > 0 ? (
                  <>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stats.totalTemplates} Trending Templates
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Browse Templates</span>
                )}
              </h2>
              <p className="text-muted-foreground mt-1">
                {searchQuery && `Search results for "${searchQuery}"`}
                {!searchQuery && "Premium designs for your next project"}
              </p>
            </div>

            {/* Desktop Controls */}
            <div className="flex items-center gap-3">
              {/* Items Per Page */}
              <div className="hidden md:flex items-center gap-2">
                <Label className="text-sm">Show:</Label>
                <Select 
                  value={limit.toString()} 
                  onValueChange={(value) => setLimit(parseInt(value))}
                >
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                    <SelectItem value="96">96</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Sort */}
              <Select 
                value={sortBy} 
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger className="h-9 w-[180px]">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {getSortIcon(option.value)}
                        {option.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Desktop Filter Button */}
              <Button 
                variant="outline" 
                className="hidden md:flex gap-2"
                onClick={() => setIsFilterSheetOpen(true)}
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters Bar */}
          {activeFiltersCount > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <span className="text-sm font-medium">Active Filters:</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={resetFilters}
                  className="gap-1 text-xs"
                >
                  <X className="h-3 w-3" />
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {category !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {categories.find(c => c.value === category)?.name || category}
                  </Badge>
                )}
                {showFreeOnly && (
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="h-3 w-3" />
                    Free Only
                  </Badge>
                )}
                {ratingAbove4 && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    4+ Stars
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Templates Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted/30"></div>
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                    <div className="h-3 bg-muted/50 rounded w-full"></div>
                    <div className="h-3 bg-muted/50 rounded w-2/3"></div>
                    <div className="flex items-center justify-between pt-3">
                      <div className="h-8 bg-muted/50 rounded w-20"></div>
                      <div className="h-8 bg-muted/50 rounded w-24"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTemplates.length > 0 ? (
            <>
              <TemplateGrid 
                templates={filteredTemplates} 
                description=""
              />

              {/* Pagination */}
              <div className="mt-8 md:mt-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold">{offset + 1}</span> to{" "}
                    <span className="font-semibold">{Math.min(offset + limit, totalTemplates)}</span> of{" "}
                    <span className="font-semibold">{totalTemplates}</span> templates
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      disabled={offset === 0}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, Math.ceil(totalTemplates / limit)) }).map((_, i) => {
                        const page = i + 1;
                        const isCurrent = Math.floor(offset / limit) + 1 === page;
                        return (
                          <Button
                            key={page}
                            variant={isCurrent ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "w-10 h-10",
                              isCurrent && "bg-gradient-to-r from-blue-500 to-purple-500"
                            )}
                            onClick={() => setOffset((page - 1) * limit)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      
                      {Math.ceil(totalTemplates / limit) > 5 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      disabled={offset + limit >= totalTemplates}
                      className="gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Card className="border-0 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="py-16 md:py-20 text-center">
                <div className="max-w-md mx-auto space-y-8">
                  <div className="relative">
                    <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                      <Search className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-xl"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-bold">No templates found</h3>
                    <p className="text-muted-foreground text-lg">
                      Try adjusting your search criteria or explore our categories
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={resetFilters}
                      className="gap-2"
                      size="lg"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset All Filters
                    </Button>
                    <Button 
                      onClick={() => {
                        setSearchQuery("");
                        setCategory("all");
                      }}
                      className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
                      size="lg"
                    >
                      <Sparkles className="h-4 w-4" />
                      Browse All Templates
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Footer */}
          {filteredTemplates.length > 0 && (
            <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-blue-600">{stats.totalTemplates}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Templates Found</div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-amber-600 flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-amber-500/20" />
                      {stats.avgRating}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">Average Rating</div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-green-600">{stats.freeTemplates}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Free Templates</div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-purple-600">{stats.totalSales}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Total Sales</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrandingPage;