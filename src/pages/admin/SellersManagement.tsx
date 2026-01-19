// sellers-management.tsx
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Eye,
  TrendingUp,
  Package,
  DollarSign,
  Edit,
  UserX,
  UserCheck,
  Download,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  ShoppingBag,
  History,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Filter,
  MoreVertical,
  Users,
  BarChart3,
  Calendar,
  Shield,
  CreditCard,
  Building,
  Phone,
  Mail,
  Globe,
  File,
  Wallet,
  Star,
  ShoppingCart,
  Download as DownloadIcon,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Award,
  Target,
  PieChart,
  TrendingDown,
  CalendarDays,
  BadgeCheck,
  Clock,
  FileCheck,
  MapPin,
  Building2,
  Percent,
  WalletCards,
  Receipt,
  Tag,
  Save,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Seller {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  kyc_verified: boolean;
  created_at: string;
  is_active: boolean;
  stats?: {
    total_products: number;
    total_sales: number;
    total_downloads: number;
    avg_rating: number;
    total_revenue: number;
    total_earning: number;
    wallet_balance: number;
    commission_tier: string;
  };
}

interface SellerDetail {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  kyc_verified: boolean;
  email_verified: boolean;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
  kyc_data: KYCData | null;
  profile_data: ProfileData | null;
}

interface KYCData {
  id: number;
  company_name: string;
  state: string;
  city: string;
  pin_code: string;
  mobile_number: string;
  pan_number: string;
  aadhaar_number: string;
  gst_number: string | null;
  is_verified: boolean;
  verified_at: string | null;
  has_pan_attachment: boolean;
  has_aadhaar_attachment: boolean;
  has_gst_attachment: boolean;
  has_bank_attachment: boolean;
  has_address_proof: boolean;
}

interface ProfileData {
  display_name: string;
  bio: string;
  website_url: string;
  commission_rate: number;
  seller_rate: number;
  total_sales: number;
  commission_tier: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  status: string;
  total_sales: number;
  total_downloads: number;
  created_at: string;
}

interface SaleHistoryItem {
  id: string;
  txn_id: string | null;
  product_name: string;
  buyer_name: string;
  buyer_email: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  status: string;
  purchase_date: string;
}

interface SalesHistoryResponse {
  items: SaleHistoryItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const SellersManagement = () => {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    totalSellers: 0,
    activeSellers: 0,
    kycVerified: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalProducts: 0,
  });
  
  // Dialog states
  const [detailDialog, setDetailDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [kycDialog, setKycDialog] = useState(false);
  const [productsDialog, setProductsDialog] = useState(false);
  const [salesDialog, setSalesDialog] = useState(false);
  const [activationDialog, setActivationDialog] = useState(false);
  const [kycApprovalDialog, setKycApprovalDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  
  // Data states
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [sellerDetail, setSellerDetail] = useState<SellerDetail | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleHistoryItem[]>([]);
  const [salesPage, setSalesPage] = useState(1);
  const [salesPageSize, setSalesPageSize] = useState(50);
  const [salesTotalPages, setSalesTotalPages] = useState(0);
  const [salesTotalRecords, setSalesTotalRecords] = useState(0);
  
  // Form states
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone_number: "",
    email: "",
  });
  const [activationAction, setActivationAction] = useState<boolean>(true);
  const [kycApproval, setKycApproval] = useState<boolean>(true);
  const [uploadForm, setUploadForm] = useState({
    attachment_type: "pan",
    file: null as File | null,
  });

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/dash/sellers`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setSellers(res.data);
      
      // Calculate stats
      const totalSellers = res.data.length;
      const activeSellers = res.data.filter((s: Seller) => s.is_active).length;
      const kycVerified = res.data.filter((s: Seller) => s.kyc_verified).length;
      let totalRevenue = 0;
      let totalRating = 0;
      let ratedSellers = 0;
      let totalProducts = 0;
      
      res.data.forEach((seller: Seller) => {
        if (seller.stats) {
          totalRevenue += seller.stats.total_revenue;
          totalProducts += seller.stats.total_products;
          if (seller.stats.avg_rating > 0) {
            totalRating += seller.stats.avg_rating;
            ratedSellers++;
          }
        }
      });
      
      setStats({
        totalSellers,
        activeSellers,
        kycVerified,
        totalRevenue,
        averageRating: ratedSellers > 0 ? totalRating / ratedSellers : 0,
        totalProducts,
      });
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error("Failed to fetch sellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellerStats = async (sellerId: number) => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/sellers/${sellerId}/stats`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setSellers((prev) =>
        prev.map((seller) =>
          seller.id === sellerId ? { ...seller, stats: res.data.stats } : seller
        )
      );
    } catch (error) {
      console.error("Error fetching seller stats:", error);
      toast.error("Failed to fetch seller statistics");
    }
  };

  const fetchSellerDetails = async (sellerId: number) => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/sellers/${sellerId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setSellerDetail(res.data);
      setDetailDialog(true);
    } catch (error) {
      console.error("Error fetching seller details:", error);
      toast.error("Failed to fetch seller details");
    }
  };

  const fetchSellerProducts = async (sellerId: number) => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/sellers/${sellerId}/products`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setSellerProducts(res.data);
      setProductsDialog(true);
    } catch (error) {
      console.error("Error fetching seller products:", error);
      toast.error("Failed to fetch seller products");
    }
  };

  const fetchSalesHistory = async (sellerId: number, page: number = 1) => {
    try {
      const res = await axios.get<SalesHistoryResponse>(
        `${BASE_URL}/dash/sellers/${sellerId}/sales-history?page=${page}&page_size=${salesPageSize}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setSalesHistory(res.data.items);
      setSalesPage(res.data.page);
      setSalesTotalPages(res.data.total_pages);
      setSalesTotalRecords(res.data.total);
      setSalesDialog(true);
    } catch (error) {
      console.error("Error fetching sales history:", error);
      toast.error("Failed to fetch sales history");
    }
  };

  const handleUpdateSeller = async () => {
    if (!selectedSeller) return;

    try {
      await axios.put(
        `${BASE_URL}/dash/sellers/${selectedSeller.id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      toast.success("Seller updated successfully");
      setEditDialog(false);
      fetchSellers();
    } catch (error: any) {
      console.error("Error updating seller:", error);
      toast.error(error.response?.data?.detail || "Failed to update seller");
    }
  };

  const handleToggleActivation = async () => {
    if (!selectedSeller) return;

    try {
      await axios.post(
        `${BASE_URL}/dash/sellers/${selectedSeller.id}/activate`,
        { is_active: activationAction },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      toast.success(
        `Seller ${activationAction ? "activated" : "deactivated"} successfully`
      );
      setActivationDialog(false);
      fetchSellers();
    } catch (error) {
      console.error("Error toggling activation:", error);
      toast.error("Failed to update seller status");
    }
  };

  const handleKYCApproval = async () => {
    if (!selectedSeller) return;

    try {
      await axios.post(
        `${BASE_URL}/dash/sellers/${selectedSeller.id}/kyc/approve`,
        { is_verified: kycApproval },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      toast.success(kycApproval ? "KYC approved" : "KYC rejected");
      setKycApprovalDialog(false);
      fetchSellers();
      if (sellerDetail) {
        fetchSellerDetails(selectedSeller.id);
      }
    } catch (error) {
      console.error("Error approving/rejecting KYC:", error);
      toast.error("Failed to process KYC");
    }
  };

  const handleFileUpload = async () => {
    if (!selectedSeller || !uploadForm.file) {
      toast.error("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadForm.file);

    try {
      await axios.post(
        `${BASE_URL}/dash/sellers/${selectedSeller.id}/kyc/upload/${uploadForm.attachment_type}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Document uploaded successfully");
      setUploadDialog(false);
      setUploadForm({ attachment_type: "pan", file: null });
      if (sellerDetail) {
        fetchSellerDetails(selectedSeller.id);
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.response?.data?.detail || "Failed to upload document");
    }
  };

  const openUploadDialog = (seller: Seller, attachmentType: string) => {
    setSelectedSeller(seller);
    setUploadForm({ attachment_type: attachmentType, file: null });
    setUploadDialog(true);
  };

  const downloadKYCDocument = async (
    sellerId: number,
    attachmentType: string
  ) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/dash/sellers/${sellerId}/kyc/download/${attachmentType}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${attachmentType}_${sellerId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Document downloaded successfully");
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  const openEditDialog = (seller: Seller) => {
    setSelectedSeller(seller);
    setEditForm({
      full_name: seller.full_name || "",
      phone_number: "",
      email: seller.email,
    });
    setEditDialog(true);
  };

  const openActivationDialog = (seller: Seller, activate: boolean) => {
    setSelectedSeller(seller);
    setActivationAction(activate);
    setActivationDialog(true);
  };

  const openKYCApprovalDialog = (seller: Seller, approve: boolean) => {
    setSelectedSeller(seller);
    setKycApproval(approve);
    setKycApprovalDialog(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.username.toLowerCase().includes(search.toLowerCase()) ||
      seller.email.toLowerCase().includes(search.toLowerCase()) ||
      (seller.full_name && seller.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusColor = (status: boolean) => {
    return status ? "bg-green-500" : "bg-red-500";
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "gold": return "bg-yellow-500";
      case "silver": return "bg-gray-400";
      case "bronze": return "bg-amber-700";
      case "platinum": return "bg-blue-400";
      default: return "bg-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="h-12 w-12 animate-pulse text-primary" />
          </div>
        </div>
        <p className="mt-6 text-lg text-muted-foreground animate-pulse">
          Loading sellers...
        </p>
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
              Sellers Management
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Monitor and manage all marketplace sellers
            </p>
          </div>
          <Button onClick={fetchSellers} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <Separator />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border/40 shadow-lg bg-gradient-to-br from-blue-500/5 to-blue-600/5">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-medium">Total Sellers</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSellers}</div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Active</span>
                  <span className="font-medium">{stats.activeSellers}</span>
                </div>
                <Progress value={(stats.activeSellers / stats.totalSellers) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-lg bg-gradient-to-br from-green-500/5 to-green-600/5">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-medium">KYC Verified</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10">
              <Shield className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.kycVerified}</div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Verification Rate</span>
                  <span className="font-medium">
                    {stats.totalSellers > 0 ? ((stats.kycVerified / stats.totalSellers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <Progress value={(stats.kycVerified / stats.totalSellers) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-lg bg-gradient-to-br from-purple-500/5 to-purple-600/5">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-medium">Total Revenue</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Avg Rating</span>
                  <span className="font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {stats.averageRating.toFixed(1)}
                  </span>
                </div>
                <Progress value={stats.averageRating * 20} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-border/40 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sellers by name, email, or username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" className="gap-2 h-12">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSellers.map((seller) => (
          <Card 
            key={seller.id} 
            className={`border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30 ${
              !seller.is_active ? "opacity-75" : ""
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-background">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(seller.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {seller.username}
                      {seller.kyc_verified && (
                        <BadgeCheck className="h-4 w-4 text-green-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">{seller.email}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => fetchSellerStats(seller.id)}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Stats
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => fetchSellerDetails(seller.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openEditDialog(seller)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Seller
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => fetchSellerProducts(seller.id)}>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      View Products
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => fetchSalesHistory(seller.id)}>
                      <History className="h-4 w-4 mr-2" />
                      Sales History
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge 
                  variant={seller.is_active ? "default" : "destructive"} 
                  className="gap-1"
                >
                  {seller.is_active ? (
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
                <Badge 
                  variant={seller.kyc_verified ? "default" : "outline"} 
                  className="gap-1"
                >
                  {seller.kyc_verified ? (
                    <>
                      <Shield className="h-3 w-3" />
                      KYC Verified
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" />
                      KYC Pending
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              {seller.stats ? (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Products</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatNumber(seller.stats.total_products)}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Sales</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatNumber(seller.stats.total_sales)}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">Revenue</span>
                      </div>
                      <p className="text-2xl font-bold text-amber-600">
                        {formatCurrency(seller.stats.total_revenue)}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Rating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">
                          {seller.stats.avg_rating.toFixed(1)}
                        </p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(seller.stats!.avg_rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Earnings & Wallet */}
                  <div className="space-y-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Total Earnings</span>
                        </div>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(seller.stats.total_earning)}
                        </p>
                      </div>
                      <Badge className={getTierColor(seller.stats?.commission_tier)}>
                        {seller.stats?.commission_tier || "Standard"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Wallet Balance</span>
                        <span className="font-semibold">
                          {formatCurrency(seller.stats.wallet_balance)}
                        </span>
                      </div>
                      <Progress 
                        value={(seller.stats.wallet_balance / (seller.stats.total_earning || 1)) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Button 
                    variant="outline" 
                    onClick={() => fetchSellerStats(seller.id)}
                    className="gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Load Performance Data
                  </Button>
                </div>
              )}
            </CardContent>
            
            <CardContent className="pt-0 border-t">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchSellerDetails(seller.id)}
                  className="flex-1 gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Details
                </Button>
                {seller.is_active ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openActivationDialog(seller, false)}
                    className="flex-1 gap-2"
                  >
                    <UserX className="h-4 w-4" />
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => openActivationDialog(seller, true)}
                    className="flex-1 gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    Activate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Seller Details Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl">Seller Details</DialogTitle>
            <DialogDescription>
              Complete information about the seller
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(90vh-200px)]">
            {sellerDetail && (
              <div className="space-y-6 p-1">
                {/* Header with avatar and basic info */}
                <div className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10">
                  <Avatar className="h-20 w-20 border-4 border-background">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(sellerDetail.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold">{sellerDetail.username}</h3>
                      <div className="flex gap-2">
                        <Badge variant={sellerDetail.is_active ? "default" : "destructive"}>
                          {sellerDetail.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={sellerDetail.email_verified ? "default" : "outline"}>
                          {sellerDetail.email_verified ? "Email Verified" : "Email Pending"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-1">{sellerDetail.email}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Joined {new Date(sellerDetail.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {sellerDetail.last_login && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Last login {new Date(sellerDetail.last_login).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Full Name</Label>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                          <UserCheck className="h-4 w-4 text-muted-foreground" />
                          <span>{sellerDetail.full_name || "Not provided"}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Phone Number</Label>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{sellerDetail.phone_number || "Not provided"}</span>
                        </div>
                      </div>
                    </div>
                    
                    {sellerDetail.profile_data && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Display Name</Label>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <span>{sellerDetail.profile_data.display_name || "Not set"}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Bio</Label>
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-sm">{sellerDetail.profile_data.bio || "No bio provided"}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Commission Tier</Label>
                            <Badge className={`${getTierColor(sellerDetail.profile_data.commission_tier)} text-white`}>
                              {sellerDetail.profile_data.commission_tier}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Commission Rate</Label>
                            <div className="flex items-center gap-3">
                              <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/20 flex-1">
                                <div className="text-xl font-bold text-red-600">
                                  {sellerDetail.profile_data.commission_rate}%
                                </div>
                                <div className="text-xs text-muted-foreground">Platform</div>
                              </div>
                              <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20 flex-1">
                                <div className="text-xl font-bold text-green-600">
                                  {sellerDetail.profile_data.seller_rate}%
                                </div>
                                <div className="text-xs text-muted-foreground">Seller</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* KYC Information */}
                {sellerDetail.kyc_data && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        KYC Information
                      </CardTitle>
                      {!sellerDetail.kyc_data.is_verified && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const seller = sellers.find(s => s.id === sellerDetail.id);
                              if (seller) openKYCApprovalDialog(seller, true);
                            }}
                            className="gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const seller = sellers.find(s => s.id === sellerDetail.id);
                              if (seller) openKYCApprovalDialog(seller, false);
                            }}
                            className="gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* KYC Status */}
                      <div className={`p-4 rounded-xl ${
                        sellerDetail.kyc_data.is_verified 
                          ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30" 
                          : "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30"
                      }`}>
                        <div className="flex items-center gap-3">
                          {sellerDetail.kyc_data.is_verified ? (
                            <>
                              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-green-700 dark:text-green-300">KYC Verified</h4>
                                <p className="text-sm text-green-600 dark:text-green-400">
                                  Verified on {sellerDetail.kyc_data.verified_at ? new Date(sellerDetail.kyc_data.verified_at).toLocaleDateString() : "N/A"}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                <Clock className="h-5 w-5 text-yellow-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">KYC Pending Review</h4>
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                  Requires administrator approval
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Company Details */}
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          Company Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Company Name</Label>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>{sellerDetail.kyc_data.company_name}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Mobile Number</Label>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{sellerDetail.kyc_data.mobile_number}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">State</Label>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{sellerDetail.kyc_data.state}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">City</Label>
                            <div className="p-3 rounded-lg bg-muted">
                              <span>{sellerDetail.kyc_data.city}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Pin Code</Label>
                            <div className="p-3 rounded-lg bg-muted">
                              <span>{sellerDetail.kyc_data.pin_code}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Documents */}
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-primary" />
                          Documents
                        </h4>
                        
                        {/* PAN Card */}
                        <div className="border rounded-xl p-4 hover:border-primary/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">PAN Card</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{sellerDetail.kyc_data.pan_number}</p>
                            </div>
                            <div className="flex gap-2">
                              {sellerDetail.kyc_data.has_pan_attachment && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadKYCDocument(sellerDetail.id, "pan")}
                                  className="gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  const seller = sellers.find(s => s.id === sellerDetail.id);
                                  if (seller) openUploadDialog(seller, "pan");
                                }}
                                className="gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                Upload
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Aadhaar Card */}
                        <div className="border rounded-xl p-4 hover:border-primary/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-green-500" />
                                <span className="font-medium">Aadhaar Card</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{sellerDetail.kyc_data.aadhaar_number}</p>
                            </div>
                            <div className="flex gap-2">
                              {sellerDetail.kyc_data.has_aadhaar_attachment && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadKYCDocument(sellerDetail.id, "aadhaar")}
                                  className="gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  const seller = sellers.find(s => s.id === sellerDetail.id);
                                  if (seller) openUploadDialog(seller, "aadhaar");
                                }}
                                className="gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                Upload
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* GST Certificate */}
                        {sellerDetail.kyc_data.gst_number && (
                          <div className="border rounded-xl p-4 hover:border-primary/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Receipt className="h-4 w-4 text-purple-500" />
                                  <span className="font-medium">GST Certificate</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{sellerDetail.kyc_data.gst_number}</p>
                              </div>
                              <div className="flex gap-2">
                                {sellerDetail.kyc_data.has_gst_attachment && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => downloadKYCDocument(sellerDetail.id, "gst")}
                                    className="gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    const seller = sellers.find(s => s.id === sellerDetail.id);
                                    if (seller) openUploadDialog(seller, "gst");
                                  }}
                                  className="gap-2"
                                >
                                  <Upload className="h-4 w-4" />
                                  Upload
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bank Account Proof */}
                        <div className="border rounded-xl p-4 hover:border-primary/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <WalletCards className="h-4 w-4 text-amber-500" />
                                <span className="font-medium">Bank Account Proof</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Proof of bank account details</p>
                            </div>
                            <div className="flex gap-2">
                              {sellerDetail.kyc_data.has_bank_attachment && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadKYCDocument(sellerDetail.id, "bank")}
                                  className="gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  const seller = sellers.find(s => s.id === sellerDetail.id);
                                  if (seller) openUploadDialog(seller, "bank");
                                }}
                                className="gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                Upload
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Address Proof */}
                        <div className="border rounded-xl p-4 hover:border-primary/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-red-500" />
                                <span className="font-medium">Address Proof</span>
                              </div>
                              <p className="text-sm text-muted-foreground">Proof of business address</p>
                            </div>
                            <div className="flex gap-2">
                              {sellerDetail.kyc_data.has_address_proof && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadKYCDocument(sellerDetail.id, "address_proof")}
                                  className="gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  const seller = sellers.find(s => s.id === sellerDetail.id);
                                  if (seller) openUploadDialog(seller, "address_proof");
                                }}
                                className="gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                Upload
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Seller Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Seller Information</DialogTitle>
            <DialogDescription>
              Update seller's personal and contact information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                placeholder="Enter seller's full name"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone_number"
                value={editForm.phone_number}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone_number: e.target.value })
                }
                placeholder="Enter phone number"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                placeholder="Enter email address"
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSeller} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Products Dialog */}
      <Dialog open={productsDialog} onOpenChange={setProductsDialog}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl">Seller Products</DialogTitle>
            <DialogDescription>
              All products listed by this seller
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[300px]">Product Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellerProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{product.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-green-600">
                        {formatCurrency(product.price)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "active" ? "default" : "secondary"
                        }
                        className="gap-1"
                      >
                        {product.status === "active" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">{formatNumber(product.total_sales)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DownloadIcon className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">{formatNumber(product.total_downloads)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(product.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Sales History Dialog */}
      <Dialog open={salesDialog} onOpenChange={setSalesDialog}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl">Sales History</DialogTitle>
            <DialogDescription>
              Transaction history for this seller ({salesTotalRecords} total sales)
            </DialogDescription>
          </DialogHeader>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold">{salesTotalRecords}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        salesHistory.reduce((sum, sale) => sum + sale.total_amount, 0)
                      )}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {salesHistory.length > 0
                        ? formatCurrency(
                            salesHistory.reduce((sum, sale) => sum + sale.total_amount, 0) /
                            salesHistory.length
                          )
                        : formatCurrency(0)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {salesHistory.length > 0
                        ? ((salesHistory.filter(s => s.status === "success").length / salesHistory.length) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <CheckCircle className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <ScrollArea className="h-[50vh]">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[120px]">Order ID</TableHead>
                  <TableHead className="w-[150px]">TXN ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesHistory.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs">
                      <div className="bg-muted p-2 rounded">
                        {sale.id}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {sale.txn_id ? (
                        <div className="bg-muted p-2 rounded truncate">
                          {sale.txn_id}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium max-w-[250px] truncate" title={sale.product_name}>
                        {sale.product_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{sale.buyer_name}</span>
                        <span className="text-xs text-muted-foreground truncate" title={sale.buyer_email}>
                          {sale.buyer_email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-bold">
                        {sale.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        {formatCurrency(sale.price_per_unit)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-lg">
                        {formatCurrency(sale.total_amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sale.status === "success"
                            ? "default"
                            : sale.status === "pending"
                            ? "outline"
                            : "destructive"
                        }
                        className="gap-1"
                      >
                        {sale.status === "success" && <CheckCircle className="h-3 w-3" />}
                        {sale.status === "pending" && <Clock className="h-3 w-3" />}
                        {sale.status === "failed" && <XCircle className="h-3 w-3" />}
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="text-sm font-medium">
                          {new Date(sale.purchase_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(sale.purchase_date).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {(salesPage - 1) * salesPageSize + 1} to{" "}
                {Math.min(salesPage * salesPageSize, salesTotalRecords)} of{" "}
                {salesTotalRecords} sales
              </div>
              <Select
                value={salesPageSize.toString()}
                onValueChange={(value) => {
                  setSalesPageSize(parseInt(value));
                  setSalesPage(1);
                  if (selectedSeller) {
                    fetchSalesHistory(selectedSeller.id, 1);
                  }
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
                onClick={() => {
                  setSalesPage(1);
                  if (selectedSeller) fetchSalesHistory(selectedSeller.id, 1);
                }}
                disabled={salesPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = salesPage - 1;
                  setSalesPage(newPage);
                  if (selectedSeller) fetchSalesHistory(selectedSeller.id, newPage);
                }}
                disabled={salesPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                {[...Array(Math.min(3, salesTotalPages))].map((_, i) => {
                  const pageNum = Math.max(1, Math.min(salesPage - 1, salesTotalPages - 3)) + i;
                  if (pageNum <= salesTotalPages) {
                    return (
                      <Button
                        key={pageNum}
                        variant={salesPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setSalesPage(pageNum);
                          if (selectedSeller) fetchSalesHistory(selectedSeller.id, pageNum);
                        }}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  return null;
                })}
                {salesTotalPages > 3 && (
                  <span className="text-sm px-2">...</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = salesPage + 1;
                  setSalesPage(newPage);
                  if (selectedSeller) fetchSalesHistory(selectedSeller.id, newPage);
                }}
                disabled={salesPage === salesTotalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSalesPage(salesTotalPages);
                  if (selectedSeller) fetchSalesHistory(selectedSeller.id, salesTotalPages);
                }}
                disabled={salesPage === salesTotalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activation Confirmation Dialog */}
      <AlertDialog open={activationDialog} onOpenChange={setActivationDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {activationAction ? (
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
              )}
              <AlertDialogTitle className="text-xl">
                {activationAction ? "Activate Seller" : "Deactivate Seller"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              {activationAction
                ? "Are you sure you want to activate this seller account? They will be able to list products and receive orders."
                : "Are you sure you want to deactivate this seller account? They will not be able to list new products or receive orders."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleActivation}
              className={activationAction ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {activationAction ? "Activate Seller" : "Deactivate Seller"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* KYC Approval Confirmation Dialog */}
      <AlertDialog open={kycApprovalDialog} onOpenChange={setKycApprovalDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {kycApproval ? (
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              )}
              <AlertDialogTitle className="text-xl">
                {kycApproval ? "Approve KYC" : "Reject KYC"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              {kycApproval
                ? "Are you sure you want to approve this seller's KYC? They will be marked as verified and can start selling."
                : "Are you sure you want to reject this seller's KYC? They will need to resubmit their documents."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleKYCApproval}
              className={kycApproval ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {kycApproval ? "Approve KYC" : "Reject KYC"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upload KYC Document Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Upload Document</DialogTitle>
            <DialogDescription>
              Upload or replace KYC document for verification
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="attachment_type" className="text-sm font-medium">
                Document Type
              </Label>
              <Select
                value={uploadForm.attachment_type}
                onValueChange={(value) =>
                  setUploadForm({ ...uploadForm, attachment_type: value })
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pan">PAN Card</SelectItem>
                  <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                  <SelectItem value="gst">GST Certificate</SelectItem>
                  <SelectItem value="bank">Bank Account Proof</SelectItem>
                  <SelectItem value="address_proof">Address Proof</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file" className="text-sm font-medium">
                Select File
              </Label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                   onClick={() => document.getElementById('file')?.click()}>
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, JPG, PNG files (Max 10MB)
                </p>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setUploadForm({ ...uploadForm, file });
                  }}
                  className="hidden"
                />
              </div>
              {uploadForm.file && (
                <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">{uploadForm.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadForm({ ...uploadForm, file: null })}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleFileUpload} 
              disabled={!uploadForm.file}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellersManagement;

// Add missing Save icon import
