import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { BASE_URL } from "@/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Eye,
  Edit,
  Download,
  Star,
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  BarChart3,
  Calendar,
  Tag,
  User,
  ExternalLink,
  Globe,
  FileArchive,
  Package,
  TrendingUp,
  DollarSign,
  Users,
  Sparkles,
  Filter,
  X,
  RefreshCw,
  Layers,
  Zap,
  CheckCircle,
  AlertCircle,
  Maximize2,
  Minimize2,
  Heart,
  Share2,
  Copy,
  Activity,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
interface Product {
  id: number;
  product_name: string;
  title: string;
  product_token: string;
  category_name: string;
  product_price: number;
  total_sales: number;
  total_downloads: number;
  avg_rating: number;
  total_reviews: number;
  is_active: boolean;
  created_at: string;
  user_id: number;
  tags: string;
  description: string;
  author: string;
  licenseType: string;
  technology: string;
  file_size: string;
  product_image: string;
  preview_url: string;
  template_url: string;
}

const SellerTemplates = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      
      const res = await axios.get(`${BASE_URL}/dash/seller/products?${params}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setProducts(res.data);
      toast.success("Templates loaded successfully!");
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const toggleProductStatus = async (productId: number, currentStatus: boolean) => {
    try {
      await axios.patch(
        `${BASE_URL}/dash/seller/products/${productId}/status`,
        {},
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setProducts(prev =>
        prev.map(product =>
          product.id === productId
            ? { ...product, is_active: !currentStatus }
            : product
        )
      );
      toast.success("Template status updated!");
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Failed to update status");
    }
  };

  const deleteProduct = async (productId: number) => {
    const confirmDelete = confirm("Are you sure you want to delete this template? This action cannot be undone.");
    if (confirmDelete) {
      try {
        await axios.delete(`${BASE_URL}/seller/products/${productId}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setProducts(prev => prev.filter(product => product.id !== productId));
        toast.success("Template deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete template");
      }
    }
  };

  const viewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "price-high":
        return b.product_price - a.product_price;
      case "price-low":
        return a.product_price - b.product_price;
      case "sales-high":
        return b.total_sales - a.total_sales;
      case "sales-low":
        return a.total_sales - b.total_sales;
      case "popular":
        return b.total_downloads - a.total_downloads;
      default:
        return 0;
    }
  });

  const filteredProducts = sortedProducts.filter(product => {
    const matchesSearch =
      product.product_name.toLowerCase().includes(search.toLowerCase()) ||
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      product.tags.toLowerCase().includes(search.toLowerCase()) ||
      product.author.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.is_active) ||
      (statusFilter === "inactive" && !product.is_active);

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const uniqueCategories = Array.from(
    new Set(products.map(p => p.category_name).filter(Boolean))
  );

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    totalSales: products.reduce((sum, p) => sum + p.total_sales, 0),
    totalDownloads: products.reduce((sum, p) => sum + p.total_downloads, 0),
    totalRevenue: products.reduce((sum, p) => sum + (p.product_price * p.total_sales), 0),
    avgRating: products.reduce((sum, p) => sum + p.avg_rating, 0) / Math.max(products.length, 1),
    monthlyGrowth: 12.5, // Mock data - would come from API
    avgSalesPerDay: (products.reduce((sum, p) => sum + p.total_sales, 0) / 30).toFixed(1),
  };

  

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Skeleton Header */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          {/* Skeleton Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Skeleton Filters */}
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Skeleton className="h-10 flex-1" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skeleton Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
   
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Main Content */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                My Templates
              </h1>
              <p className="text-gray-600 mt-2">
                Manage, analyze, and optimize your template portfolio
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProducts}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Link to="/seller/templates/upload">
                <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="h-4 w-4" />
                  Upload New
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Templates</p>
                    <p className="text-3xl font-bold mt-2">{stats.total}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="bg-white">
                        {stats.active} Active
                      </Badge>
                      <Badge variant="outline" className="bg-white">
                        {stats.total - stats.active} Draft
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
                    <Layers className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        +{stats.monthlyGrowth}% this month
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                    <CurrencyRupeeIcon  className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalSales}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {stats.avgSalesPerDay} avg/day
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalDownloads}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">
                        {stats.avgRating.toFixed(1)} Avg Rating
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

       

          {/* Filters and Controls */}
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search templates by name, tags, or author..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 h-12"
                    />
                    {search && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearch("")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-40 h-12">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {uniqueCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 h-12">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 h-12">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="sales-high">Sales: High to Low</SelectItem>
                      <SelectItem value="sales-low">Sales: Low to High</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex border rounded-lg overflow-hidden">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Active Filters */}
              {(search || categoryFilter !== "all" || statusFilter !== "all") && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {search && (
                    <Badge variant="secondary" className="gap-1">
                      Search: "{search}"
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch("")} />
                    </Badge>
                  )}
                  {categoryFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Category: {categoryFilter}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter("all")} />
                    </Badge>
                  )}
                  {statusFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {statusFilter}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setCategoryFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} templates
            </div>
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {/* Products Grid/List View */}
          {viewMode === "grid" ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <Card key={product.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-0">
                    {/* Webview Preview */}
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      {product.preview_url ? (
                        <iframe
                          src={product.preview_url}
                          className="w-full h-full scale-100 group-hover:scale-105 transition-transform duration-300"
                          title={`Preview: ${product.product_name}`}
                          loading="lazy"
                          sandbox="allow-same-origin allow-scripts"
                        />
                      ) : product.product_image ? (
                        <img
                          src={product.product_image}
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={product.is_active ? "default" : "secondary"}
                          className={`${product.is_active ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800"}`}
                        >
                          {product.is_active ? "Live" : "Draft"}
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-white">
                            <h3 className="font-semibold line-clamp-1">{product.product_name}</h3>
                            <p className="text-sm opacity-90">{formatCurrency(product.product_price)}</p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-white text-gray-900 hover:bg-gray-100"
                            onClick={() => viewProductDetails(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          {product.category_name}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium">{product.avg_rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({product.total_reviews})</span>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {product.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-500">{product.author}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="font-bold">{product.total_sales}</div>
                            <div className="text-xs text-gray-500">Sales</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{product.total_downloads}</div>
                            <div className="text-xs text-gray-500">Downloads</div>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => viewProductDetails(product)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/seller/templates/edit/${product.product_token}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Template
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleProductStatus(product.id, product.is_active)}
                            >
                              {product.is_active ? (
                                <>
                                  <ToggleLeft className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // List View (Table)
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Template</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow key={product.id} className="group hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-16 overflow-hidden rounded">
                              {product.preview_url ? (
                                <iframe
                                  src={product.preview_url}
                                  className="w-full h-full"
                                  title={`Preview: ${product.product_name}`}
                                  loading="lazy"
                                  sandbox="allow-same-origin allow-scripts"
                                />
                              ) : product.product_image ? (
                                <img
                                  src={product.product_image}
                                  alt={product.product_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <FileArchive className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{product.product_name}</p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {product.title}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category_name}</Badge>
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(product.product_price)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="h-3 w-3 text-green-600" />
                              <span className="text-sm">{product.total_sales} sales</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Download className="h-3 w-3 text-blue-600" />
                              <span className="text-sm">{product.total_downloads} downloads</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              <span className="text-sm">
                                {product.avg_rating.toFixed(1)} rating
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{formatDate(product.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={product.is_active}
                              onCheckedChange={() => toggleProductStatus(product.id, product.is_active)}
                              className="data-[state=checked]:bg-green-600"
                            />
                            <span className="text-sm">
                              {product.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewProductDetails(product)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link to={`/seller/templates/edit/${product.product_token}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.open(product.preview_url, '_blank')}>
                                  <Globe className="mr-2 h-4 w-4" />
                                  View Live Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.open(product.template_url, '_blank')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download Template
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => deleteProduct(product.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && !loading && (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {search || categoryFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your filters or search term"
                      : "Start your journey by uploading your first template"}
                  </p>
                  <Link to="/seller/templates/upload">
                    <Button size="lg" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Upload Your First Template
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Product Details Dialog with Embedded Webview */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden">
          {selectedProduct && (
            <>
              {/* Header */}
              <div className="sticky top-0 z-50 bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <DialogHeader>
                    <DialogTitle className="text-xl">{selectedProduct.product_name}</DialogTitle>
                    <p className="text-sm text-gray-500">{selectedProduct.title}</p>
                  </DialogHeader>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFullscreenPreview(!fullscreenPreview)}
                      className="gap-2"
                    >
                      {fullscreenPreview ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                      {fullscreenPreview ? "Exit Fullscreen" : "Fullscreen"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row h-[70vh]">
                {/* Left Column - Webview */}
                <div className={`${fullscreenPreview ? 'lg:w-full' : 'lg:w-2/3'} border-r h-full`}>
                  <div className="relative h-full">
                    {selectedProduct.preview_url ? (
                      <iframe
                        ref={iframeRef}
                        src={selectedProduct.preview_url}
                        className="w-full h-full"
                        title={`Live Preview: ${selectedProduct.product_name}`}
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No live preview available</p>
                          <p className="text-sm text-gray-500 mt-2">Preview URL not configured</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Webview Controls */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => iframeRef.current?.contentWindow?.location.reload()}
                        className="gap-2"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Reload
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.open(selectedProduct.preview_url, '_blank')}
                        className="gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                {!fullscreenPreview && (
                  <div className="lg:w-1/3 h-full overflow-y-auto">
                    <div className="p-6 space-y-6">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold">{selectedProduct.total_sales}</div>
                          <div className="text-xs text-gray-600">Sales</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold">{selectedProduct.total_downloads}</div>
                          <div className="text-xs text-gray-600">Downloads</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 rounded-lg">
                          <div className="text-2xl font-bold">{selectedProduct.avg_rating.toFixed(1)}</div>
                          <div className="text-xs text-gray-600">Rating</div>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Price</p>
                            <p className="text-2xl font-bold">{formatCurrency(selectedProduct.product_price)}</p>
                          </div>
                          <Badge
                            variant={selectedProduct.is_active ? "default" : "secondary"}
                            className={`${selectedProduct.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {selectedProduct.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{selectedProduct.category_name}</Badge>
                          <Badge variant="outline">{selectedProduct.technology}</Badge>
                          <Badge variant="outline">{selectedProduct.licenseType}</Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{selectedProduct.author}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileArchive className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{selectedProduct.file_size}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{formatDate(selectedProduct.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-line">
                          {selectedProduct.description}
                        </p>
                      </div>

                      {/* Tags */}
                      {selectedProduct.tags && (
                        <div>
                          <h4 className="font-semibold mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.tags.split(',').map((tag, index) => (
                              <Badge key={index} variant="secondary">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="space-y-3">
                        <h4 className="font-semibold">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => window.open(selectedProduct.preview_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open Preview
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => window.open(selectedProduct.template_url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => copyToClipboard(selectedProduct.preview_url, "Preview URL")}
                          >
                            <Copy className="h-4 w-4" />
                            Copy URL
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => copyToClipboard(selectedProduct.product_token, "Product Token")}
                          >
                            <Copy className="h-4 w-4" />
                            Copy Token
                          </Button>
                        </div>
                      </div>

                      {/* Main Actions */}
                      <div className="pt-4 border-t">
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowDetails(false)}
                          >
                            Close
                          </Button>
                          <Link
                            to={`/seller/templates/edit/${selectedProduct.product_token}`}
                            className="flex-1"
                          >
                            <Button className="w-full gap-2">
                              <Edit className="h-4 w-4" />
                              Edit Template
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  
  );
};

export default SellerTemplates;