import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "@/config";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  Package,
  ShoppingCart,
  Users,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Grid3x3,
  Filter,
  Download,
  TrendingUp,
  BarChart3,
  Calendar,
  IndianRupee,
  Tag,
  Store,
  Star,
  MoreVertical,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  AlertCircle,
  Layers,
  Percent
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ============================================================
// Type Definitions
// ============================================================

interface ProductStats {
  total_products: number;
  active_products: number;
  inactive_products: number;
  total_categories: number;
  total_sellers: number;
}

interface SellerBasic {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
}

interface ProductListItem {
  id: number;
  title: string;
  slug: string;
  price: number;
  category_name: string | null;
  seller_id: number;
  seller_username: string;
  seller_email: string;
  seller_full_name: string | null;
  is_active: boolean;
  created_at: string;
  total_sales: number;
}

interface PaginatedProductResponse {
  products: ProductListItem[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface ProductDetail {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  discounted_price: number | null;
  category_id: number | null;
  category_name: string | null;
  seller_id: number;
  seller_username: string;
  seller_email: string;
  seller_full_name: string | null;
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  total_sales: number;
  total_revenue: number;
}

// ============================================================
// Main Component
// ============================================================

const ProductsManagement = () => {
  const { user } = useAuth();

  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ProductStats | null>(null);

  // Products
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [search, setSearch] = useState("");
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sellers
  const [sellers, setSellers] = useState<SellerBasic[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Dialogs
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [showBulkReassignDialog, setShowBulkReassignDialog] = useState(false);

  // Selected items
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(
    null
  );
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  // Form data
  const [reassignForm, setReassignForm] = useState({
    new_seller_id: "",
    admin_notes: "",
  });

  // ============================================================
  // API Calls
  // ============================================================

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/products/seller/stats`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics");
    }
  };

  const fetchProducts = async () => {
    try {
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };
      if (search) params.search = search;
      if (sellerFilter !== "all") params.seller_id = sellerFilter;
      if (statusFilter !== "all")
        params.is_active = statusFilter === "active";
      if (categoryFilter !== "all") params.category = categoryFilter;

      const res = await axios.get<PaginatedProductResponse>(
        `${BASE_URL}/dash/products/seller/list`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
          params,
        }
      );
      
      setProducts(res.data?.products);
      setTotalItems(res.data.total);
      setTotalPages(res.data.total_pages);
      
      // Extract unique categories from products
      const uniqueCategories = Array.from(
        new Set(res.data?.products.map(p => p.category_name).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const fetchSellers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/products/sellers/list`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setSellers(res.data);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error("Failed to load sellers");
    }
  };

  const fetchProductDetail = async (productId: number) => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/products/seller1/${productId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setSelectedProduct(res.data);
      setShowDetailDialog(true);
    } catch (error) {
      console.error("Error fetching product detail:", error);
      toast.error("Failed to load product details");
    }
  };

  const reassignProduct = async () => {
    if (!selectedProduct || !reassignForm.new_seller_id) {
      toast.error("Please select a seller");
      return;
    }

    try {
      const res = await axios.patch(
        `${BASE_URL}/dash/products/seller/${selectedProduct.id}/reassign`,
        {
          new_seller_id: parseInt(reassignForm.new_seller_id),
          admin_notes: reassignForm.admin_notes || null,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      toast.success(res.data.message);
      setShowReassignDialog(false);
      setShowDetailDialog(false);
      setReassignForm({ new_seller_id: "", admin_notes: "" });
      setSelectedProduct(null);
      fetchStats();
      fetchProducts();
    } catch (error: any) {
      console.error("Error reassigning product:", error);
      toast.error(
        error.response?.data?.detail || "Failed to reassign product"
      );
    }
  };

  const bulkReassign = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    if (!reassignForm.new_seller_id) {
      toast.error("Please select a seller");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/dash/products/seller/bulk-reassign`,
        {
          product_ids: selectedProducts,
          new_seller_id: parseInt(reassignForm.new_seller_id),
          admin_notes: reassignForm.admin_notes || null,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      toast.success(res.data.message);
      setShowBulkReassignDialog(false);
      setReassignForm({ new_seller_id: "", admin_notes: "" });
      setSelectedProducts([]);
      fetchStats();
      fetchProducts();
    } catch (error: any) {
      console.error("Error bulk reassigning:", error);
      toast.error(
        error.response?.data?.detail || "Failed to reassign products"
      );
    }
  };

  const toggleProductStatus = async (productId: number) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/dash/products/seller/${productId}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      toast.success(res.data.message);
      fetchProducts();
      fetchStats();
    } catch (error: any) {
      console.error("Error toggling status:", error);
      toast.error(error.response?.data?.detail || "Failed to update status");
    }
  };

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStats(),
      fetchProducts(),
      fetchSellers(),
    ]);
    setRefreshing(false);
    toast.success("Data refreshed successfully");
  };

  // ============================================================
  // Effects
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchProducts(), fetchSellers()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      setCurrentPage(1); // Reset to page 1 when filters change
    }
  }, [search, sellerFilter, statusFilter, categoryFilter]);

  useEffect(() => {
    if (!loading) {
      fetchProducts();
    }
  }, [currentPage, perPage]);

  useEffect(() => {
    if (!loading && currentPage === 1) {
      fetchProducts(); // Fetch when page is reset to 1
    }
  }, [search, sellerFilter, statusFilter, categoryFilter]);

  // ============================================================
  // Helpers
  // ============================================================

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 border-emerald-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-gray-300">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // ============================================================
  // Render
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-8 h-8 text-primary/60 animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground">Loading products data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/10 via-purple-500/5 to-background p-8 border border-purple-200/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-700 to-purple-600 bg-clip-text text-transparent">
              Products Management
            </h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
              Manage products, assign to sellers, and track performance
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                <Calendar className="w-3 h-3 inline mr-1" />
                Last updated: {formatDate(new Date().toISOString())}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={refreshAll}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            {selectedProducts.length > 0 && (
              <Button 
                onClick={() => setShowBulkReassignDialog(true)}
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Reassign {selectedProducts.length} Product(s)
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card className="relative overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700">
                <Package className="h-4 w-4" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-800">
                {stats.total_products}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{
                      width: `${((stats.active_products || 0) / (stats.total_products || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-emerald-600">
                  {Math.round(((stats.active_products || 0) / (stats.total_products || 1)) * 100)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Active rate</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-700">
                <CheckCircle className="h-4 w-4" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-800">
                {stats.active_products}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">+12.5%</span> this month
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-500/5 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
                <XCircle className="h-4 w-4" />
                Inactive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">
                {stats.inactive_products}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">-5.2%</span> this month
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
                <Layers className="h-4 w-4" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">
                {stats.total_categories}
              </div>
              <p className="text-xs text-muted-foreground">
                Available categories
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-amber-300 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700">
                <Users className="h-4 w-4" />
                Sellers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-800">
                {stats.total_sellers}
              </div>
              <p className="text-xs text-muted-foreground">
                Active sellers
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
        <Button variant="outline" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Button>
        <Button variant="outline" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Top Performers
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-2 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by product title, slug, seller name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Select value={sellerFilter} onValueChange={setSellerFilter}>
                  <SelectTrigger className="pl-10 h-11">
                    <SelectValue placeholder="All Sellers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sellers</SelectItem>
                    {sellers.map((seller) => (
                      <SelectItem key={seller.id} value={seller.id.toString()}>
                        {seller.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="pl-10 h-11">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="pl-10 h-11">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-2 shadow-sm">
        <CardContent className="p-0">
          <div className="px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold">Products List</h3>
                <p className="text-sm text-muted-foreground">
                  {totalItems} product(s) found · Page {currentPage} of {totalPages}
                  {selectedProducts.length > 0 && (
                    <span className="ml-2 text-purple-600 font-medium">
                      · {selectedProducts.length} selected
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  Show:
                </div>
                <Select
                  value={perPage.toString()}
                  onValueChange={(value) => {
                    setPerPage(parseInt(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-purple-50 to-pink-50/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedProducts.length === products.length &&
                          products.length > 0
                        }
                        onCheckedChange={toggleAllProducts}
                        className="border-gray-300"
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Price</TableHead>
                    <TableHead className="font-semibold">Seller</TableHead>
                    <TableHead className="font-semibold">Sales</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow 
                      key={product.id} 
                      className="group hover:bg-gradient-to-r hover:from-purple-500/5 hover:via-purple-500/2 hover:to-transparent transition-colors"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                          className="border-gray-300"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                              <Package className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate group-hover:text-purple-600 transition-colors">
                                {product.title}
                              </p>
                              <p className="text-sm text-muted-foreground truncate font-mono">
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                          <Tag className="h-3 w-3 mr-1" />
                          {product.category_name || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold flex items-center">
                          <IndianRupee className="h-4 w-4 mr-1 text-green-600" />
                          {product.price.toLocaleString('en-IN')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                              <Store className="h-3 w-3 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {product.seller_username}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {product.seller_email}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                              <ShoppingCart className="h-4 w-4 text-amber-600" />
                            </div>
                            {product.total_sales > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs rounded-full flex items-center justify-center">
                                {product.total_sales}
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-medium">
                            {product.total_sales} sold
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(product.is_active)}</TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(product.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-purple-500/10"
                            onClick={() => fetchProductDetail(product.id)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-blue-500/10"
                            onClick={() => toggleProductStatus(product.id)}
                            title={product.is_active ? "Deactivate" : "Activate"}
                          >
                            {product.is_active ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => fetchProductDetail(product.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleProductStatus(product.id)}>
                                {product.is_active ? (
                                  <XCircle className="h-4 w-4 mr-2" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                {product.is_active ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setSelectedProduct(product as any);
                                setShowReassignDialog(true);
                              }}>
                                <ArrowRightLeft className="h-4 w-4 mr-2" />
                                Reassign
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {products.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-medium text-lg">No products found</h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * perPage + 1} to{" "}
                  {Math.min(currentPage * perPage, totalItems)} of {totalItems}{" "}
                  products
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
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
                          onClick={() => goToPage(pageNum)}
                          className={`h-8 w-8 p-0 ${
                            currentPage === pageNum 
                              ? "bg-gradient-to-r from-purple-600 to-pink-600" 
                              : ""
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Product Details
            </DialogTitle>
            <DialogDescription>
              View and manage product information
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6 py-4">
              {/* Product Info Card */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Product Information</span>
                    {getStatusBadge(selectedProduct.is_active)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Title</Label>
                      <p className="font-medium text-lg border-l-4 border-purple-500 pl-3 py-1">
                        {selectedProduct.title}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Slug</Label>
                      <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                        {selectedProduct.slug}
                      </p>
                    </div>
                  </div>

                  {selectedProduct.short_description && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">
                        Short Description
                      </Label>
                      <p className="text-sm p-3 bg-blue-50 rounded-lg">
                        {selectedProduct.short_description}
                      </p>
                    </div>
                  )}

                  {selectedProduct.description && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">
                        Description
                      </Label>
                      <p className="text-sm p-3 bg-gray-50 rounded-lg">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Original Price</Label>
                      <p className="text-xl font-bold flex items-center">
                        <IndianRupee className="h-5 w-5 mr-1 text-gray-600" />
                        {selectedProduct.price.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {selectedProduct.discounted_price && (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">
                          Discounted Price
                        </Label>
                        <p className="text-xl font-bold text-green-600 flex items-center">
                          <IndianRupee className="h-5 w-5 mr-1" />
                          {selectedProduct.discounted_price.toLocaleString('en-IN')}
                        </p>
                        <div className="text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-flex items-center">
                          <Percent className="h-3 w-3 mr-1" />
                          {Math.round((1 - (selectedProduct.discounted_price / selectedProduct.price)) * 100)}% OFF
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Category</Label>
                      <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800">
                        <Tag className="h-3 w-3 mr-1" />
                        {selectedProduct.category_name || "Uncategorized"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Info Card */}
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                    <Store className="h-5 w-5" />
                    Current Seller
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Username</Label>
                      <p className="font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        {selectedProduct.seller_username}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedProduct.seller_email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Full Name</Label>
                      <p className="font-medium">
                        {selectedProduct.seller_full_name || "Not specified"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sales Stats Card */}
              <Card className="border-2 border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                    <TrendingUp className="h-5 w-5" />
                    Sales Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                        <Label className="text-muted-foreground">Total Sales</Label>
                        <div className="flex items-end gap-2">
                          <ShoppingCart className="h-6 w-6 text-purple-600" />
                          <p className="text-3xl font-bold text-purple-800">
                            {selectedProduct.total_sales}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total units sold across all platforms
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
                        <Label className="text-muted-foreground">Total Revenue</Label>
                        <div className="flex items-end gap-2">
                          <IndianRupee className="h-6 w-6 text-emerald-600" />
                          <p className="text-3xl font-bold text-emerald-800">
                            {selectedProduct.total_revenue.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total revenue generated from sales
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => {
                    setShowDetailDialog(false);
                    setShowReassignDialog(true);
                  }}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Reassign to Another Seller
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => toggleProductStatus(selectedProduct.id)}
                >
                  {selectedProduct.is_active ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {selectedProduct.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reassign Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-purple-600" />
              Reassign Product
            </DialogTitle>
            <DialogDescription>
              Assign "{selectedProduct?.title}" to a different seller
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="text-sm text-blue-900">
                <strong>Current Seller:</strong> {selectedProduct?.seller_username}
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                New Seller <span className="text-red-500">*</span>
              </Label>
              <Select
                value={reassignForm.new_seller_id}
                onValueChange={(value) =>
                  setReassignForm({ ...reassignForm, new_seller_id: value })
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select new seller" />
                </SelectTrigger>
                <SelectContent>
                  {sellers
                    .filter((s) => s.id !== selectedProduct?.seller_id)
                    .map((seller) => (
                      <SelectItem key={seller.id} value={seller.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">{seller.username}</div>
                            <div className="text-xs text-muted-foreground">{seller.email}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Admin Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this reassignment..."
                value={reassignForm.admin_notes}
                onChange={(e) =>
                  setReassignForm({
                    ...reassignForm,
                    admin_notes: e.target.value,
                  })
                }
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReassignDialog(false);
                setShowDetailDialog(true);
                setReassignForm({ new_seller_id: "", admin_notes: "" });
              }}
              className="h-11"
            >
              Cancel
            </Button>
            <Button 
              onClick={reassignProduct}
              className="h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Reassign Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reassign Dialog */}
      <Dialog
        open={showBulkReassignDialog}
        onOpenChange={setShowBulkReassignDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-purple-600" />
              Bulk Reassign Products
            </DialogTitle>
            <DialogDescription>
              Reassign {selectedProducts.length} selected product(s) to a new seller
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-purple-900">
                    {selectedProducts.length} Product(s) Selected
                  </div>
                  <div className="text-sm text-purple-700">
                    All selected products will be transferred
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                New Seller <span className="text-red-500">*</span>
              </Label>
              <Select
                value={reassignForm.new_seller_id}
                onValueChange={(value) =>
                  setReassignForm({ ...reassignForm, new_seller_id: value })
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select new seller" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{seller.username}</div>
                          <div className="text-xs text-muted-foreground">{seller.email}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Admin Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this bulk reassignment..."
                value={reassignForm.admin_notes}
                onChange={(e) =>
                  setReassignForm({
                    ...reassignForm,
                    admin_notes: e.target.value,
                  })
                }
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkReassignDialog(false);
                setReassignForm({ new_seller_id: "", admin_notes: "" });
              }}
              className="h-11"
            >
              Cancel
            </Button>
            <Button 
              onClick={bulkReassign}
              className="h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Reassign {selectedProducts.length} Product(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsManagement;