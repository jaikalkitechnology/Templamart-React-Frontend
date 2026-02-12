import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TemplateGrid from "@/components/templates/TemplateGrid";
import { TemplateProps } from "@/components/templates/TemplateCard";
import axios from "axios";
import { BASE_URL } from "@/config";
import { 
  Search, 
  Filter, 
  ArrowRight, 
  ArrowLeft, 
  Grid3x3, 
  Sparkles, 
  TrendingUp, 
  Star, 
  Clock,
  DollarSign,
  X,
  RefreshCw,
  Layers,
  Hash,
  ChevronDown,
  SortDesc
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState<TemplateProps[]>([]);
  const [allTemplates, setAllTemplates] = useState<TemplateProps[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [categoryName, setCategoryName] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [limit, setLimit] = useState(24);
  const [offset, setOffset] = useState(0);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [sortOptions, setSortOptions] = useState([]);
  const [categories, setCategories] = useState<{ name: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Fetch categories and sort options only once
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catsRes, sortRes] = await Promise.all([
          axios.get(`${BASE_URL}/product/categories`),
          axios.get(`${BASE_URL}/product/sort-options`)
        ]);
        setCategories(catsRes.data);
        setSortOptions(sortRes.data);
      } catch (err) {
        console.error("Error loading initial data", err);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch templates with proper dependencies
  const fetchTemplates = useCallback(async () => {
    if (!slug) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/product/templates/by-category`, {
        params: {
          search: debouncedSearch || undefined,
          category: slug,
          sort_by: sortBy,
          limit,
          offset,
        },
      });
      
      const data = response.data;
      setAllTemplates(data.products);
      setTemplates(data.products);
      setTotalTemplates(data.total);
      
      // Find category name
      const category = categories.find(cat => cat.value === slug);
      setCategoryName(category?.name || "Category");
      
    } catch (err) {
      console.error("Error loading templates", err);
      setTemplates([]);
      setAllTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, [slug, debouncedSearch, sortBy, limit, offset, categories]);

  // Fetch templates when dependencies change
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Calculate active filters
  useEffect(() => {
    let count = 0;
    if (searchQuery) count++;
    if (sortBy !== "newest") count++;
    setActiveFilters(count);
  }, [searchQuery, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTemplates();
  };

  const handleNext = () => {
    if (offset + limit < totalTemplates) {
      setOffset(prev => prev + limit);
    }
  };

  const handlePrev = () => {
    if (offset > 0) {
      setOffset(prev => prev - limit);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSortBy("newest");
    setOffset(0);
    setIsFilterSheetOpen(false);
  };

  const getSortIcon = (value: string) => {
    switch (value) {
      case "newest": return <Clock className="h-4 w-4" />;
      case "price-asc": return <DollarSign className="h-4 w-4" />;
      case "price-desc": return <DollarSign className="h-4 w-4" />;
      case "rating": return <Star className="h-4 w-4" />;
      case "popularity": return <TrendingUp className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const stats = {
    freeTemplates: templates.filter(t => t.price === 0).length,
    avgRating: templates.length > 0 
      ? (templates.reduce((acc, t) => acc + (t.rating || 0), 0) / templates.length).toFixed(1)
      : '0.0',
    totalSales: templates.reduce((acc, t) => acc + (t.sales || 0), 0).toLocaleString(),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/50 to-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-700 py-8 md:py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-0">
                <Layers className="mr-2 h-3 w-3" />
                Category
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                {categoryName || "Category"}
              </h1>
              <p className="text-white/80 mt-2 text-lg">
                Browse premium {categoryName?.toLowerCase()} templates for your next project
              </p>
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mt-4 md:hidden">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                  <Input
                    type="search"
                    placeholder={`Search ${categoryName}...`}
                    className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>

            {/* Stats */}
            <div className="hidden md:grid grid-cols-3 gap-3 min-w-[300px]">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-3 text-center">
                  <div className="text-xl font-bold text-white">{templates.length}</div>
                  <div className="text-xs text-white/60">Templates</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-3 text-center">
                  <div className="text-xl font-bold text-white flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-white/20" />
                    {stats.avgRating}
                  </div>
                  <div className="text-xs text-white/60">Avg Rating</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-3 text-center">
                  <div className="text-xl font-bold text-white">{stats.freeTemplates}</div>
                  <div className="text-xs text-white/60">Free</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="container py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={`Search ${categoryName} templates...`}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="ml-2">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            {/* Sort and Filter */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Mobile Filter Button */}
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden gap-2">
                    <Filter className="h-4 w-4" />
                    {activeFilters > 0 && (
                      <Badge className="h-5 w-5 p-0 bg-primary text-white">
                        {activeFilters}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Filter & Sort</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Search */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search</label>
                      <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    {/* Sort */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <div className="flex items-center gap-2">
                            <SortDesc className="h-4 w-4" />
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
                    </div>
                    
                    {/* Active Filters */}
                    {activeFilters > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Active Filters</label>
                        <div className="flex flex-wrap gap-2">
                          {searchQuery && (
                            <Badge variant="secondary" className="gap-1 pl-3">
                              "{searchQuery}"
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                onClick={() => setSearchQuery("")}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Items per page */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Items per page</label>
                      <Select 
                        value={limit.toString()} 
                        onValueChange={(value) => setLimit(parseInt(value))}
                      >
                        <SelectTrigger>
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
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-4 border-t">
                      <Button onClick={() => setIsFilterSheetOpen(false)}>
                        Apply Filters
                      </Button>
                      <Button variant="outline" onClick={resetFilters} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <SortDesc className="h-4 w-4" />
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

              {/* Items per page - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select 
                  value={limit.toString()} 
                  onValueChange={(value) => setLimit(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
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
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilters > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Active Filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <Badge variant="secondary" className="gap-1 pl-3">
                        <Search className="h-3 w-3" />
                        "{searchQuery}"
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {sortBy !== "newest" && (
                      <Badge variant="secondary" className="gap-1 pl-3">
                        <SortDesc className="h-3 w-3" />
                        {sortOptions.find(s => s.value === sortBy)?.name || sortBy}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                          onClick={() => setSortBy("newest")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2">
                  <RefreshCw className="h-3 w-3" />
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                <>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {templates.length} {categoryName}
                  </span>
                  <span className="text-muted-foreground"> Templates</span>
                </>
              )}
            </h2>
            <p className="text-muted-foreground text-sm">
              {searchQuery ? `Search results for "${searchQuery}"` : "Premium designs for your project"}
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span>{totalTemplates} total</span>
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex items-center justify-between pt-3">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : templates.length > 0 ? (
          <>
            <TemplateGrid 
              templates={templates}
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
                    onClick={handlePrev}
                    disabled={offset === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
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
                          size="icon"
                          className={cn(
                            "h-10 w-10",
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
                    onClick={handleNext}
                    disabled={offset + limit >= totalTemplates}
                    className="gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
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
                    {searchQuery 
                      ? `No "${searchQuery}" templates found in ${categoryName}`
                      : `No templates available in ${categoryName} yet`}
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
                    Reset Filters
                  </Button>
                  <Button 
                    onClick={() => navigate('/templates')}
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
        {templates.length > 0 && !isLoading && (
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">{templates.length}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Templates</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-amber-600 flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-amber-500/20" />
                    {stats.avgRating}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Avg Rating</div>
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
  );
};

export default CategoryPage;