import { useState, useEffect } from "react";
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
  Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const TemplatesPage = () => {
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
  const [showFilters, setShowFilters] = useState(true);

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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesRes, sortRes, templatesRes] = await Promise.all([
          axios.get(`${BASE_URL}/product/categories`),
          axios.get(`${BASE_URL}/product/sort-options`),
          axios.get(`${BASE_URL}/product/all-templates`, {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Hero Header - Fixed at top */}
      <div className="bg-gradient-to-r from-primary/100 via-primary/100 to-transparent border-b sticky top-0 z-40">
        <div className="container py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-3">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="text-sm text-white font-medium">Template Marketplace</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Discover{" "}
                  <span className="bg-gradient-to-r from-primary to-brand-600 bg-clip-text text-white">
                    Amazing Templates
                  </span>
                </h1>
                
               
              </div>
              
              {/* Main Search Bar in header */}
              <form onSubmit={handleSearch} className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search templates..."
                  className="h-10 pl-10 pr-24 text-sm border border-border/50 bg-card/50 backdrop-blur-sm rounded-lg hover:border-primary/30 focus:border-primary transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-4 text-xs"
                >
                  <Search className="h-3 w-3 mr-2" />
                  Search
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Filters Bar - Fixed below header */}
      <div className="sticky top-[120px] z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
        <div className="container py-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Left: Filters Toggle and Active Count */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-white">
                    {activeFiltersCount}
                  </Badge>
                )}
                {showFilters ? (
                  <ChevronUp className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 ml-1" />
                )}
              </Button>
              
              <div className="hidden lg:flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Found:</span>
                <span className="font-semibold">{filteredTemplates.length}</span>
                <span className="text-muted-foreground">templates</span>
              </div>
            </div>

            {/* Center: Category Filter */}
            <div className="flex-1 max-w-md">
              <Select 
                value={category} 
                onValueChange={(value) => setCategory(value)}
              >
                <SelectTrigger className="h-9 border-border/50">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      All Categories
                    </div>
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Right: Sort and Actions */}
            <div className="flex items-center gap-2">
              {/* Price Range Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <DollarSign className="h-3.5 w-3.5" />
                    Price
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <Label className="font-medium">Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</Label>
                    <Slider
                      value={priceRange}
                      min={0}
                      max={10000}
                      step={100}
                      onValueChange={(val) => setPriceRange(val)}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Additional Filters Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-3.5 w-3.5" />
                    More
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="free-only" 
                        checked={showFreeOnly}
                        onCheckedChange={(checked) => setShowFreeOnly(!!checked)}
                        className="data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor="free-only" className="cursor-pointer flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-yellow-500" />
                        Free Only
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="rating-above-4" 
                        checked={ratingAbove4}
                        onCheckedChange={(checked) => setRatingAbove4(!!checked)}
                        className="data-[state=checked]:bg-amber-500"
                      />
                      <Label htmlFor="rating-above-4" className="cursor-pointer flex items-center gap-2">
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                        4+ Stars
                      </Label>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Sort Options */}
              <Select 
                value={sortBy} 
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger className="h-9 w-[160px] border-border/50">
                  <div className="flex items-center gap-2">
                    {getSortIcon(sortBy)}
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

              {/* Reset Button */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={resetFilters}
                className="gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </div>

          {/* Expanded Filters Area */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="flex flex-wrap items-center gap-3">
                {/* Active Filters Display */}
                <div className="text-sm font-medium text-muted-foreground">
                  Active Filters:
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {category !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {categories.find(c => c.value === category)?.name || category}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => setCategory("all")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                    <Badge variant="secondary" className="gap-1">
                      <DollarSign className="h-3 w-3" />
                      ₹{priceRange[0]} - ₹{priceRange[1]}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => setPriceRange([0, 10000])}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {showFreeOnly && (
                    <Badge variant="secondary" className="gap-1">
                      <Zap className="h-3 w-3" />
                      Free Only
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => setShowFreeOnly(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {ratingAbove4 && (
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3" />
                      4+ Stars
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => setRatingAbove4(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
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
                </div>
              </div>
              
              {/* Quick Stats Row */}
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-muted-foreground">Free:</span>
                  <span className="font-semibold">{filteredTemplates.filter(t => t.price === 0).length}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <span className="text-muted-foreground">Avg Rating:</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    {filteredTemplates.length > 0 
                      ? (filteredTemplates.reduce((acc, t) => acc + t.rating, 0) / filteredTemplates.length).toFixed(1)
                      : '0.0'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">Total Sales:</span>
                  <span className="font-semibold">{filteredTemplates.reduce((acc, t) => acc + t.sales, 0).toLocaleString()}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-brand-600"></div>
                  <span className="text-muted-foreground">Current Page:</span>
                  <span className="font-semibold">
                    {Math.floor(offset / limit) + 1} of {Math.ceil(totalTemplates / limit)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              Browse Templates
            </h2>
            <p className="text-sm text-muted-foreground">
              {totalTemplates} high-quality templates available
            </p>
          </div>
          
          {/* View Toggle and Items Per Page */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Show:</Label>
              <Select 
                value={limit.toString()} 
                onValueChange={(value) => setLimit(parseInt(value))}
              >
                <SelectTrigger className="h-8 w-16">
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

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted/50"></div>
                <CardContent className="p-6 space-y-4">
                  <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                  <div className="h-3 bg-muted/50 rounded w-full"></div>
                  <div className="h-3 bg-muted/50 rounded w-2/3"></div>
                  <div className="flex items-center justify-between pt-4">
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
              description={`Showing ${filteredTemplates.length} amazing templates`}
            />

            {/* Pagination */}
            <div className="mt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {offset + 1} to {Math.min(offset + limit, totalTemplates)} of {totalTemplates} templates
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
                          className="w-10 h-10"
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
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <div className="mx-auto max-w-md space-y-6">
                <div className="h-20 w-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">No templates found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={resetFilters}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset All Filters
                  </Button>
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setCategory("all");
                    }}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Browse All Templates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats Footer */}
        {filteredTemplates.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg bg-primary/5">
                <div className="text-xl font-bold text-primary">
                  {filteredTemplates.length}
                </div>
                <div className="text-xs text-muted-foreground">Templates</div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-amber-500/5">
                <div className="text-xl font-bold text-amber-500 flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-amber-500/20" />
                  {filteredTemplates.length > 0 
                    ? (filteredTemplates.reduce((acc, t) => acc + t.rating, 0) / filteredTemplates.length).toFixed(1)
                    : '0.0'}
                </div>
                <div className="text-xs text-muted-foreground">Avg Rating</div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-green-500/5">
                <div className="text-xl font-bold text-green-500">
                  {filteredTemplates.filter(t => t.price === 0).length}
                </div>
                <div className="text-xs text-muted-foreground">Free Templates</div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-brand-600/5">
                <div className="text-xl font-bold text-brand-600">
                  {filteredTemplates.reduce((acc, t) => acc + t.sales, 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Sales</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;