// templates-management.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "@/config";
import { useAuth } from "@/context/auth-context";
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
import { Progress } from "@/components/ui/progress";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  User,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Filter,
  Package,
  DollarSign,
  TrendingUp,
  Layers,
  FileText,
  Image,
  Code,
  Grid,
  List,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  ShoppingCart,
  ThumbsUp,
  Eye as EyeIcon,
  Clock,
  Zap,
  Cpu,
  HardDrive,
  Award,
  Sparkles,
  Lightbulb,
  Palette,
  Layout,
  Smartphone,
  Globe,
  Server,
  Database,
  Cloud,
  Terminal,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCw,
  Lock,
  Unlock,
  Monitor,
  Smartphone as SmartphoneIcon,
  Tablet,
  X,
  Maximize,
  Minus,
  Expand,
  Shrink,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Home,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Move,
  Settings,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

interface Product {
  id: number;
  product_name: string;
  product_token: string;
  total_downloads: number;
  title: string;
  category_name: string;
  template_url: string;
  description: string;
  product_image: string;
  preview_url: string | null;
  author: string;
  product_price: number;
  is_active: boolean;
  tags: string;
  total_reviews: number;
  created_at: string;
  licenseType: string;
  total_sales: number;
  user_id: number;
  technology: string;
  avg_rating: number;
  file_size: string;
  total_comments: number;
}
interface Category {
  name: string;
  slug: string;
}

interface ProductDetail extends Product {
  template_features: string | null;
  seller_username: string;
  seller_email: string;
}

interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface ProductStats {
  total_products: number;
  active_products: number;
  inactive_products: number;
  total_sales: number;
  total_downloads: number;
  total_revenue: number;
  avg_rating: number;
}

// Web View Interface
interface WebViewState {
  url: string;
  isLoading: boolean;
  hasError: boolean;
  isFullscreen: boolean;
  zoomLevel: number;
  isLocked: boolean;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  showControls: boolean;
}

const TemplatesManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [technologyFilter, setTechnologyFilter] = useState("all");
  
  // Edit dialog
  const [editDialog, setEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [editForm, setEditForm] = useState({
    product_name: "",
    title: "",
    description: "",
    product_price: 0,
    category_name: "",
    tags: "",
    licenseType: "",
    technology: "",
    file_size: "",
    template_features: "",
  });
  
  // Details dialog
  const [detailsDialog, setDetailsDialog] = useState(false);
  
  // Web View Dialog
  const [webViewDialog, setWebViewDialog] = useState(false);
  const [webViewState, setWebViewState] = useState<WebViewState>({
    url: "",
    isLoading: true,
    hasError: false,
    isFullscreen: false,
    zoomLevel: 100,
    isLocked: false,
    deviceMode: 'desktop',
    showControls: true,
  });
  
  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  
  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Refs
  const webViewRef = useRef<HTMLIFrameElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Fetch products with pagination
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        sort_by: sortBy,
        order: order,
      });

      if (categoryFilter && categoryFilter !== "all") {
        params.append("category", categoryFilter);
      }
      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      const res = await axios.get(
        `${BASE_URL}/dash/products?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      if (res.data) {
        if (Array.isArray(res.data)) {
          setProducts(res.data);
          setTotal(res.data.length);
          setTotalPages(1);
        } else if (res.data.items && Array.isArray(res.data.items)) {
          setProducts(res.data.items);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.total_pages || 0);
        } else {
          setProducts([]);
          setTotal(0);
          setTotalPages(0);
        }
      } else {
        setProducts([]);
        setTotal(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
      setProducts([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, order, categoryFilter, statusFilter, search, user?.token]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/products/stats/summary`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (res.data) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/products/cat-categories/list`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (res.data && Array.isArray(res.data.categories.items)) {
        setCategories(res.data.categories.items as Category[]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  // Extract unique technologies
  const extractTechnologies = useCallback((products: Product[]) => {
    const techSet = new Set<string>();
    products.forEach(product => {
      if (product.technology) {
        techSet.add(product.technology);
      }
    });
    setTechnologies(Array.from(techSet));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      extractTechnologies(products);
    }
  }, [products, extractTechnologies]);

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 500);
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setSortBy("created_at");
    setOrder("desc");
    setTechnologyFilter("all");
    setPage(1);
    setTimeout(() => {
      fetchProducts();
    }, 100);
  };

  const toggleProductStatus = async (productId: number, currentStatus: boolean) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/dash/products/${productId}/status?active=${!currentStatus}`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${user?.token}`
          } 
        }
      );
      
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, is_active: !currentStatus }
            : product
        )
      );
      
      toast.success(`Product ${!currentStatus ? "activated" : "deactivated"} successfully`);
      fetchStats();
    } catch (error: any) {
      console.error("Error updating product status:", error);
      toast.error(error.response?.data?.detail || "Failed to update product status");
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const res = await axios.delete(`${BASE_URL}/dash/products/${productId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      
      if (res.data && res.data.soft_delete) {
        toast.success("Product deactivated (has existing sales)");
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, is_active: false } : p
          )
        );
      } else {
        toast.success("Product deleted successfully");
        setProducts((prev) => prev.filter((product) => product.id !== productId));
      }
      
      fetchStats();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const fetchProductDetails = async (productId: number) => {
    try {
      const res = await axios.get<ProductDetail>(
        `${BASE_URL}/dash/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      if (res.data) {
        setSelectedProduct(res.data);
        setDetailsDialog(true);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Failed to fetch product details");
    }
  };

  const openEditDialog = async (productId: number) => {
    try {
      const res = await axios.get<ProductDetail>(
        `${BASE_URL}/dash/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      
      if (res.data) {
        setSelectedProduct(res.data);
        setEditForm({
          product_name: res.data.product_name || "",
          title: res.data.title || "",
          description: res.data.description || "",
          product_price: res.data.product_price || 0,
          category_name: res.data.category_name || "",
          tags: res.data.tags || "",
          licenseType: res.data.licenseType || "",
          technology: res.data.technology || "",
          file_size: res.data.file_size || "",
          template_features: res.data.template_features || "",
        });
        setEditDialog(true);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product details");
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      await axios.put(
        `${BASE_URL}/dash/products/${selectedProduct.id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      
      toast.success("Product updated successfully");
      setEditDialog(false);
      fetchProducts();
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.detail || "Failed to update product");
    }
  };

  // Web View Functions
  const openWebView = (url: string) => {
    setWebViewState({
      url,
      isLoading: true,
      hasError: false,
      isFullscreen: false,
      zoomLevel: 100,
      isLocked: false,
      deviceMode: 'desktop',
      showControls: true,
    });
    setWebViewDialog(true);
  };

  const handleWebViewLoad = () => {
    setWebViewState(prev => ({ ...prev, isLoading: false, hasError: false }));
  };

  const handleWebViewError = () => {
    setWebViewState(prev => ({ ...prev, isLoading: false, hasError: true }));
  };

  const reloadWebView = () => {
    if (webViewRef.current) {
      setWebViewState(prev => ({ ...prev, isLoading: true, hasError: false }));
      webViewRef.current.src = webViewState.url;
    }
  };

  const toggleFullscreen = () => {
    setWebViewState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  };

  const toggleLock = () => {
    setWebViewState(prev => ({ ...prev, isLocked: !prev.isLocked }));
  };

  const changeZoom = (zoom: number) => {
    setWebViewState(prev => ({ ...prev, zoomLevel: Math.max(25, Math.min(zoom, 200)) }));
  };

  const changeDeviceMode = (mode: 'desktop' | 'tablet' | 'mobile') => {
    setWebViewState(prev => ({ ...prev, deviceMode: mode }));
  };

  const navigateWebView = (direction: 'back' | 'forward' | 'home') => {
    if (!webViewRef.current) return;

    try {
      if (direction === 'back' && webViewRef.current.contentWindow?.history.length) {
        webViewRef.current.contentWindow.history.back();
      } else if (direction === 'forward' && webViewRef.current.contentWindow?.history.length) {
        webViewRef.current.contentWindow.history.forward();
      } else if (direction === 'home') {
        webViewRef.current.src = webViewState.url;
        setWebViewState(prev => ({ ...prev, isLoading: true }));
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const openInNewTab = () => {
    window.open(webViewState.url, '_blank', 'noopener,noreferrer');
  };

  const getDeviceDimensions = () => {
    switch (webViewState.deviceMode) {
      case 'desktop':
        return { width: '100%', height: '100%' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      case 'mobile':
        return { width: '375px', height: '667px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const getTechnologyIcon = (tech: string) => {
    const techLower = tech.toLowerCase();
    if (techLower.includes('react') || techLower.includes('next')) return <Globe className="h-4 w-4" />;
    if (techLower.includes('mobile') || techLower.includes('flutter')) return <SmartphoneIcon className="h-4 w-4" />;
    if (techLower.includes('node') || techLower.includes('express')) return <Server className="h-4 w-4" />;
    if (techLower.includes('database') || techLower.includes('sql')) return <Database className="h-4 w-4" />;
    if (techLower.includes('cloud') || techLower.includes('aws')) return <Cloud className="h-4 w-4" />;
    if (techLower.includes('terminal') || techLower.includes('cli')) return <Terminal className="h-4 w-4" />;
    if (techLower.includes('ui') || techLower.includes('design')) return <Palette className="h-4 w-4" />;
    return <Code className="h-4 w-4" />;
  };

  const getTechnologyColor = (tech: string) => {
    const techLower = tech.toLowerCase();
    if (techLower.includes('react')) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    if (techLower.includes('next')) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    if (techLower.includes('vue')) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (techLower.includes('angular')) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    if (techLower.includes('mobile')) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    if (techLower.includes('node')) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  const getCategoryColor = (category: string) => {
    const catLower = category.toLowerCase();
    if (catLower.includes('web')) return "bg-blue-500";
    if (catLower.includes('mobile')) return "bg-purple-500";
    if (catLower.includes('design')) return "bg-pink-500";
    if (catLower.includes('dashboard')) return "bg-teal-500";
    if (catLower.includes('ecommerce')) return "bg-amber-500";
    if (catLower.includes('blog')) return "bg-green-500";
    if (catLower.includes('portfolio')) return "bg-indigo-500";
    if (catLower.includes('admin')) return "bg-red-500";
    return "bg-gray-500";
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Template Management
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Manage all marketplace templates
              </p>
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <Separator />
        </div>

        {/* Stats Loading */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/40">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Products Grid Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="border-border/40">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Template Management
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Manage all marketplace templates ({total} total)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-9 w-9 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-9 w-9 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => { fetchProducts(); fetchStats(); }} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        <Separator />
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/40 shadow-lg bg-gradient-to-br from-blue-500/5 to-blue-600/5">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-medium">Total Templates</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_products}</div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Active</span>
                    <span className="font-medium">{stats.active_products}</span>
                  </div>
                  <Progress value={(stats.active_products / stats.total_products) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-lg bg-gradient-to-br from-green-500/5 to-green-600/5">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-medium">Total Sales</CardTitle>
              <div className="p-2 rounded-lg bg-green-500/10">
                <ShoppingCart className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_sales}</div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium text-green-600">{formatCurrency(stats.total_revenue)}</span>
                  </div>
                  <Progress value={(stats.total_revenue / (stats.total_sales * 50 || 1)) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-lg bg-gradient-to-br from-amber-500/5 to-amber-600/5">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-medium">Total Downloads</CardTitle>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Download className="h-5 w-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_downloads}</div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Downloads/Sale Ratio</span>
                    <span className="font-medium">
                      {stats.total_sales > 0 ? (stats.total_downloads / stats.total_sales).toFixed(1) : 0}
                    </span>
                  </div>
                  <Progress value={(stats.total_downloads / (stats.total_sales * 10 || 1)) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-lg bg-gradient-to-br from-yellow-500/5 to-yellow-600/5">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-medium">Avg. Rating</CardTitle>
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avg_rating.toFixed(1)}</div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Rating Distribution</span>
                    <span className="font-medium">/5.0</span>
                  </div>
                  <Progress value={stats.avg_rating * 20} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border-border/40 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Filters & Search</CardTitle>
          <CardDescription>
            Find templates by category, status, technology, or search terms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, title, tags, description..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories && categories.length > 0 && categories.map((category) => (
                    <SelectItem key={category?.name} value={category.slug}>
                      {category?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Technology</Label>
              <Select value={technologyFilter} onValueChange={setTechnologyFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Technologies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technologies</SelectItem>
                  {technologies.map((tech) => (
                    <SelectItem key={tech} value={tech}>
                      {tech}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="product_price">Price</SelectItem>
                  <SelectItem value="total_sales">Sales</SelectItem>
                  <SelectItem value="avg_rating">Rating</SelectItem>
                  <SelectItem value="total_downloads">Downloads</SelectItem>
                  <SelectItem value="total_reviews">Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleApplyFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Filters
            </Button>
            <div className="flex-1"></div>
            <div className="text-sm text-muted-foreground">
              {total} templates found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid/List View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className={`border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30 ${
                !product.is_active ? "opacity-75" : ""
              }`}
            >
              {/* Product Image with Web View */}
              <div className="relative h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/5 to-primary/10 group">
                {product.product_image && isValidUrl(product.product_image) ? (
                  <div className="relative w-full h-full">
                    {/* Web Preview */}
                    <iframe
                      src={product.product_image}
                      className="w-full h-full border-0"
                      title={`Preview: ${product.product_name}`}
                      sandbox="allow-same-origin allow-scripts"
                      loading="lazy"
                    />
                    
                    {/* Overlay with Web View Button */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        size="sm"
                        className="gap-2 bg-white/90 hover:bg-white text-gray-900 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          openWebView(product.product_image);
                        }}
                      >
                        <Maximize2 className="h-4 w-4" />
                        Open Web View
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <Image className="h-16 w-16 text-primary/30" />
                    <p className="text-sm text-muted-foreground">No preview available</p>
                    {product.preview_url && isValidUrl(product.preview_url) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openWebView(product.preview_url!);
                        }}
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Try Preview URL
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant={product.is_active ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {product.is_active ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
                
                {/* Technology Badge */}
                {product.technology && (
                  <div className="absolute top-3 left-3">
                    <Badge className={`${getTechnologyColor(product.technology)} gap-1`}>
                      {getTechnologyIcon(product.technology)}
                      {product.technology || "N/A"}
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                {/* Product Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg truncate" title={product.product_name}>
                        {product.product_name || "N/A"}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate" title={product.title}>
                        {product.title || "N/A"}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(product.product_price || 0)}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`${getCategoryColor(product.category_name)} text-white px-2 py-1`}
                    >
                      {product.category_name || "Uncategorized"}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <ShoppingBag className="h-4 w-4 text-green-500" />
                        <span className="font-bold text-lg">{product.total_sales || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Sales</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Download className="h-4 w-4 text-blue-500" />
                        <span className="font-bold text-lg">{product.total_downloads || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Downloads</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-lg">{(product.avg_rating || 0).toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  </div>

                  {/* File Size & Date */}
                  <div className="flex items-center justify-between text-sm pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span>{product.file_size || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{product.created_at ? formatDate(product.created_at) : "N/A"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t p-6">
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchProductDetails(product.id)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
                    {product.product_image && isValidUrl(product.product_image) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openWebView(product.product_image)}
                        className="gap-2"
                        title="Open in Web View"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => fetchProductDetails(product.id)}>
                        <EyeIcon className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(product.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Template
                      </DropdownMenuItem>
                      {product.product_image && isValidUrl(product.product_image) && (
                        <DropdownMenuItem onClick={() => openWebView(product.product_image)}>
                          <Maximize2 className="mr-2 h-4 w-4" />
                          Open Web View
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toggleProductStatus(product.id, product.is_active)}>
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
                        className="text-red-600 focus:text-red-600"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Delete Template
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card className="border-border/40 shadow-lg">
          <CardHeader>
            <CardTitle>Templates List</CardTitle>
            <CardDescription>
              Showing {products.length} of {total} templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No templates found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Template</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Technology</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                              <Layout className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{product.product_name || "N/A"}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {product.title || "N/A"}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Tag className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {product.tags || "No tags"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.product_image && isValidUrl(product.product_image) ? (
                            <div className="relative">
                              <div className="h-16 w-24 rounded border overflow-hidden bg-gray-100">
                                <iframe
                                  src={product.product_image}
                                  className="w-full h-full scale-75 origin-top-left"
                                  title="Preview"
                                  sandbox="allow-same-origin"
                                  loading="lazy"
                                />
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="absolute -right-2 -top-2 h-6 w-6 p-0 rounded-full bg-white shadow"
                                onClick={() => openWebView(product.product_image)}
                                title="Open in Web View"
                              >
                                <Maximize2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="h-16 w-24 rounded border flex items-center justify-center bg-muted">
                              <Image className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getCategoryColor(product.category_name)}>
                            {product.category_name || "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-green-600">
                            {formatCurrency(product.product_price || 0)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <ShoppingBag className="h-3 w-3 text-green-500" />
                                <span className="text-sm font-medium">{product.total_sales || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Download className="h-3 w-3 text-blue-500" />
                                <span className="text-sm font-medium">{product.total_downloads || 0}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{(product.avg_rating || 0).toFixed(1)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3 text-purple-500" />
                                <span className="text-sm font-medium">{product.total_reviews || 0}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTechnologyIcon(product.technology)}
                            <span className="text-sm">{product.technology || "N/A"}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {product.file_size || "N/A"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {product.created_at ? formatDate(product.created_at) : "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.is_active ? "default" : "secondary"}
                            className={`gap-1 ${!product.is_active ? "bg-yellow-500/10 text-yellow-700" : ""}`}
                          >
                            {product.is_active ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {product.product_image && isValidUrl(product.product_image) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openWebView(product.product_image)}
                                className="h-8 w-8 p-0"
                                title="Open in Web View"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchProductDetails(product.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(product.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleProductStatus(product.id, product.is_active)}
                              className="h-8 w-8 p-0"
                            >
                              {product.is_active ? (
                                <ToggleLeft className="h-4 w-4" />
                              ) : (
                                <ToggleRight className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <Card className="border-border/40 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1} to{" "}
                  {Math.min(page * pageSize, total)} of {total} templates
                </div>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(parseInt(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="25">25 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                    <SelectItem value="100">100 / page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(3, totalPages))].map((_, i) => {
                    const pageNum = Math.max(1, Math.min(page - 1, totalPages - 3)) + i;
                    if (pageNum <= totalPages) {
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    return null;
                  })}
                  {totalPages > 3 && (
                    <span className="text-sm px-2">...</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Web View Dialog */}
      <Dialog open={webViewDialog} onOpenChange={setWebViewDialog} modal={false}>
        <DialogContent className={`max-w-[95vw] max-h-[95vh] p-0 ${webViewState.isFullscreen ? 'w-screen h-screen' : 'w-[90vw] h-[90vh]'}`}>
          {/* Web View Header */}
          <div className={`sticky top-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between ${!webViewState.showControls ? 'hidden' : ''}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <div className="text-sm font-medium truncate" title={webViewState.url}>
                  {webViewState.url.length > 50 ? `${webViewState.url.substring(0, 50)}...` : webViewState.url}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Device Mode Toggle */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  size="sm"
                  variant={webViewState.deviceMode === 'desktop' ? 'default' : 'ghost'}
                  onClick={() => changeDeviceMode('desktop')}
                  className="h-8 w-8 p-0"
                  title="Desktop"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={webViewState.deviceMode === 'tablet' ? 'default' : 'ghost'}
                  onClick={() => changeDeviceMode('tablet')}
                  className="h-8 w-8 p-0"
                  title="Tablet"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={webViewState.deviceMode === 'mobile' ? 'default' : 'ghost'}
                  onClick={() => changeDeviceMode('mobile')}
                  className="h-8 w-8 p-0"
                  title="Mobile"
                >
                  <SmartphoneIcon className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => changeZoom(webViewState.zoomLevel - 25)}
                  disabled={webViewState.zoomLevel <= 25}
                  className="h-8 w-8 p-0"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium w-12 text-center">
                  {webViewState.zoomLevel}%
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => changeZoom(webViewState.zoomLevel + 25)}
                  disabled={webViewState.zoomLevel >= 200}
                  className="h-8 w-8 p-0"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Control Buttons */}
              <Button
                size="sm"
                variant="ghost"
                onClick={reloadWebView}
                className="h-8 w-8 p-0"
                title="Reload"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleLock}
                className="h-8 w-8 p-0"
                title={webViewState.isLocked ? 'Unlock Navigation' : 'Lock Navigation'}
              >
                {webViewState.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
                title={webViewState.isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {webViewState.isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={openInNewTab}
                className="h-8 w-8 p-0"
                title="Open in New Tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setWebViewDialog(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Navigation Bar */}
          <div className={`sticky top-14 z-40 bg-muted px-4 py-2 flex items-center gap-2 border-b ${!webViewState.showControls ? 'hidden' : ''}`}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateWebView('back')}
              className="h-7 px-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateWebView('forward')}
              className="h-7 px-2"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateWebView('home')}
              className="h-7 px-2"
            >
              <Home className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <Input
                value={webViewState.url}
                onChange={(e) => setWebViewState(prev => ({ ...prev, url: e.target.value }))}
                className="h-7 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    reloadWebView();
                  }
                }}
              />
            </div>
          </div>
          
          {/* Web View Container */}
          <div className="flex-1 overflow-hidden relative">
            {webViewState.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Loading web view...</p>
                </div>
              </div>
            )}
            
            {webViewState.hasError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background">
                <div className="text-center space-y-4 p-8">
                  <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Failed to Load</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Unable to load the web view. The URL might be invalid or blocked.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={reloadWebView} variant="outline">
                      <RotateCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                    <Button onClick={() => setWebViewDialog(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`relative ${webViewState.deviceMode !== 'desktop' ? 'flex items-center justify-center p-8' : ''}`}>
                <div 
                  className={`bg-white shadow-lg overflow-hidden border-4 border-gray-800 rounded-xl mx-auto
                    ${webViewState.deviceMode === 'tablet' ? 'w-[768px] h-[1024px]' : ''}
                    ${webViewState.deviceMode === 'mobile' ? 'w-[375px] h-[667px]' : ''}
                    ${webViewState.deviceMode === 'desktop' ? 'w-full h-full' : ''}`}
                >
                  <iframe
                    ref={webViewRef}
                    src={webViewState.url}
                    className={`w-full h-full border-0 ${webViewState.isLocked ? 'pointer-events-none' : ''}`}
                    style={{
                      transform: `scale(${webViewState.zoomLevel / 100})`,
                      transformOrigin: 'top left',
                      width: webViewState.deviceMode === 'desktop' ? '100%' : '100%',
                      height: webViewState.deviceMode === 'desktop' ? '100%' : '100%',
                    }}
                    title="Product Web View"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                    allow="camera; microphone; geolocation; payment"
                    onLoad={handleWebViewLoad}
                    onError={handleWebViewError}
                  />
                </div>
              </div>
            )}
            
            {/* Floating Controls */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-10 w-10 p-0 rounded-full shadow-lg"
                onClick={() => setWebViewState(prev => ({ ...prev, showControls: !prev.showControls }))}
                title={webViewState.showControls ? 'Hide Controls' : 'Show Controls'}
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-10 w-10 p-0 rounded-full shadow-lg"
                onClick={reloadWebView}
                title="Reload"
              >
                <RotateCw className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className={`sticky bottom-0 bg-background border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between ${!webViewState.showControls ? 'hidden' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${webViewState.hasError ? 'bg-destructive' : webViewState.isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <span>
                  {webViewState.hasError ? 'Error' : webViewState.isLoading ? 'Loading...' : 'Connected'}
                </span>
              </div>
              <div>Device: {webViewState.deviceMode}</div>
              <div>Zoom: {webViewState.zoomLevel}%</div>
              <div>Navigation: {webViewState.isLocked ? 'Locked' : 'Unlocked'}</div>
            </div>
            <div className="text-xs">
              {isValidUrl(webViewState.url) ? 'Secure Connection' : 'Local Content'}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl">Edit Template</DialogTitle>
            <DialogDescription>
              Update template information and settings
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[70vh] px-1">
            <div className="space-y-6 p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="product_name" className="text-sm font-medium">
                    Product Name
                  </Label>
                  <Input
                    id="product_name"
                    value={editForm.product_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, product_name: e.target.value })
                    }
                    placeholder="Enter product name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    placeholder="Enter template title"
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="product_price" className="text-sm font-medium">
                    Price
                  </Label>
                  <Input
                    id="product_price"
                    type="number"
                    step="0.01"
                    value={editForm.product_price}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        product_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="category_name" className="text-sm font-medium">
                    Category
                  </Label>
                  <Select
                    value={editForm.category_name}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, category_name: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories && categories.length > 0 && categories.map((category) => (
                        <SelectItem key={category?.name} value={category?.slug}>
                          {category?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="technology" className="text-sm font-medium">
                    Technology
                  </Label>
                  <Input
                    id="technology"
                    value={editForm.technology}
                    onChange={(e) =>
                      setEditForm({ ...editForm, technology: e.target.value })
                    }
                    placeholder="e.g., React, Next.js, Vue"
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="licenseType" className="text-sm font-medium">
                    License Type
                  </Label>
                  <Input
                    id="licenseType"
                    value={editForm.licenseType}
                    onChange={(e) =>
                      setEditForm({ ...editForm, licenseType: e.target.value })
                    }
                    placeholder="e.g., MIT, Commercial"
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="file_size" className="text-sm font-medium">
                    File Size
                  </Label>
                  <Input
                    id="file_size"
                    value={editForm.file_size}
                    onChange={(e) =>
                      setEditForm({ ...editForm, file_size: e.target.value })
                    }
                    placeholder="e.g., 5.2 MB"
                    className="h-11"
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label htmlFor="tags" className="text-sm font-medium">
                    Tags (comma-separated)
                  </Label>
                  <Input
                    id="tags"
                    value={editForm.tags}
                    onChange={(e) =>
                      setEditForm({ ...editForm, tags: e.target.value })
                    }
                    placeholder="e.g., responsive, modern, clean"
                    className="h-11"
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    placeholder="Describe the template features and benefits"
                    rows={4}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label htmlFor="template_features" className="text-sm font-medium">
                    Template Features
                  </Label>
                  <Textarea
                    id="template_features"
                    value={editForm.template_features}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        template_features: e.target.value,
                      })
                    }
                    placeholder="List key features (one per line)"
                    rows={4}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl">Template Details</DialogTitle>
            <DialogDescription>
              Complete information about this template
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[75vh] px-1">
            {selectedProduct && (
              <div className="space-y-6 p-1">
                {/* Header */}
                <div className="flex items-start gap-6">
                  <div className="h-32 w-32 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    {selectedProduct.product_image && isValidUrl(selectedProduct.product_image) ? (
                      <div className="relative w-full h-full">
                        <iframe
                          src={selectedProduct.product_image}
                          className="w-full h-full rounded-xl"
                          title="Product Preview"
                          sandbox="allow-same-origin"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute bottom-2 right-2 h-8 w-8 p-0"
                          onClick={() => openWebView(selectedProduct.product_image)}
                          title="Open in Web View"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Image className="h-12 w-12 text-primary/30" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedProduct.product_name || "N/A"}</h2>
                        <p className="text-muted-foreground mt-1">{selectedProduct.title || "N/A"}</p>
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(selectedProduct.product_price || 0)}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge className={`${getCategoryColor(selectedProduct.category_name)} text-white`}>
                        {selectedProduct.category_name || "Uncategorized"}
                      </Badge>
                      <Badge className={getTechnologyColor(selectedProduct.technology)}>
                        {getTechnologyIcon(selectedProduct.technology)}
                        {selectedProduct.technology || "N/A"}
                      </Badge>
                      <Badge variant={selectedProduct.is_active ? "default" : "secondary"}>
                        {selectedProduct.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{selectedProduct.licenseType || "N/A"}</Badge>
                    </div>
                    
                    {/* Web View Button */}
                    {selectedProduct.product_image && isValidUrl(selectedProduct.product_image) && (
                      <div className="mt-4">
                        <Button
                          onClick={() => openWebView(selectedProduct.product_image)}
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open Web View
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seller Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Seller Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {selectedProduct.seller_username?.charAt(0).toUpperCase() || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedProduct.seller_username || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{selectedProduct.seller_email || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Description & Features */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedProduct.description || "No description provided"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Template Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedProduct.template_features ? (
                        <ul className="space-y-2">
                          {selectedProduct.template_features.split('\n').map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No features listed</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Stats Grid */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Performance Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/5 to-green-600/5">
                        <div className="text-2xl font-bold text-green-600">{selectedProduct.total_sales || 0}</div>
                        <p className="text-sm text-muted-foreground mt-1">Total Sales</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-600/5">
                        <div className="text-2xl font-bold text-blue-600">{selectedProduct.total_downloads || 0}</div>
                        <p className="text-sm text-muted-foreground mt-1">Downloads</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-500/5 to-yellow-600/5">
                        <div className="text-2xl font-bold text-yellow-600">{(selectedProduct.avg_rating || 0).toFixed(1)}</div>
                        <p className="text-sm text-muted-foreground mt-1">Average Rating</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-purple-600/5">
                        <div className="text-2xl font-bold text-purple-600">{selectedProduct.total_reviews || 0}</div>
                        <p className="text-sm text-muted-foreground mt-1">Reviews</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">File Size</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <HardDrive className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedProduct.file_size || "N/A"}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tags</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedProduct.tags ? (
                            selectedProduct.tags.split(',').map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No tags</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Created Date</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedProduct.created_at ? formatDate(selectedProduct.created_at) : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setDetailsDialog(false)}>
              Close
            </Button>
            {selectedProduct && (
              <>
                {selectedProduct.product_image && isValidUrl(selectedProduct.product_image) && (
                  <Button
                    variant="secondary"
                    onClick={() => openWebView(selectedProduct.product_image)}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Web View
                  </Button>
                )}
                <Button onClick={() => openEditDialog(selectedProduct.id)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Template
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add missing imports
import { Info } from "lucide-react";
import { Save } from "lucide-react";

export default TemplatesManagement;