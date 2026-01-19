import { TemplateProps } from "./TemplateCard";
import TemplateCard from "./TemplateCard";
import { useState } from "react";
import { Search, Filter, Grid3x3, List, ChevronDown, Star, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplateGridProps {
  templates: TemplateProps[];
  title?: string;
  description?: string;
}

const TemplateGrid = ({ templates, title, description }: TemplateGridProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(new Set(templates.map(t => t.category)));

  // Filter and sort templates
  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "sales":
          return b.sales - a.sales;
        case "popular":
        default:
          return (b.rating * b.sales) - (a.rating * a.sales);
      }
    });

  const templateCount = filteredTemplates.length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="space-y-3">
            {title && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary/50" />
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {title}
                </h1>
                <Badge variant="outline" className="ml-2 px-3 py-1 border-primary/30 text-primary">
                  {templates.length} Templates
                </Badge>
              </div>
            )}
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">
                  {Math.round(templates.reduce((acc, t) => acc + t.rating, 0) / templates.length * 10) / 10 || 0} Avg Rating
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">
                  {templates.reduce((acc, t) => acc + t.sales, 0).toLocaleString()} Total Sales
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
      
      </div>

      {/* Templates Grid/List */}
      {templateCount > 0 ? (
        <div className={`transition-all duration-500 ${viewMode === "grid" ? "grid-view" : "list-view"}`}>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {filteredTemplates.map((template, index) => (
                <div
                  key={template.id}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TemplateCard template={template} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template, index) => (
                <div
                  key={template.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* You could create a TemplateListCard component for list view */}
                  <div className="p-4 border rounded-xl hover:border-primary/30 transition-all duration-300 bg-card/50 backdrop-blur-sm">
                    <TemplateCard template={template} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 px-4 border-2 border-dashed border-border/50 rounded-2xl bg-gradient-to-b from-card to-card/50">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
            >
              Clear all filters
            </Button>
          </div>
        </div>
      )}

      {/* Footer Stats */}
      {templateCount > 0 && (
        <div className="pt-6 border-t border-border/50">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>
                Average Rating:{" "}
                <span className="font-semibold text-foreground">
                  {Math.round(filteredTemplates.reduce((acc, t) => acc + t.rating, 0) / filteredTemplates.length * 100) / 100 || 0}
                </span>
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>
                Total Sales:{" "}
                <span className="font-semibold text-foreground">
                  {filteredTemplates.reduce((acc, t) => acc + t.sales, 0).toLocaleString()}
                </span>
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <ChevronDown className="h-4 w-4 text-blue-500" />
              <span>
                Average Price:{" "}
                <span className="font-semibold text-foreground">
                  ₹{Math.round(filteredTemplates.reduce((acc, t) => acc + t.price, 0) / filteredTemplates.length * 100) / 100 || 0}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-fadeInUp {
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TemplateGrid;