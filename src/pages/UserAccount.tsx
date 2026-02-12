import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  FileText, 
  Package, 
  Receipt, 
  Settings, 
  User,
  Download,
  Eye,
  ShoppingBag,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Edit,
  Save,
  X,
  Mail,
  UserCircle,
  Lock,
  Bell,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { BASE_URL } from "@/config";
import { formatDate, formatCurrency } from "@/lib/utils";

// ============================================================
// Type Definitions
// ============================================================

interface PurchaseStats {
  total_purchases: number;
  total_spent: number;
  total_products: number;
  pending_purchases: number;
}

interface PurchaseListItem {
  id: string;
  purchase_date: string;
  status: string;
  total_amount: number;
  items_count: number;
  payment_method: string;
}

interface PurchaseItemDetail {
  product_id: number;
  product_title: string;
  product_slug: string;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
  download_link: string | null;
}

interface PurchaseDetail {
  id: string;
  purchase_date: string;
  status: string;
  payment_method: string;
  total_amount: number;
  base_amount: number;
  gst_amount: number;
  gst_percentage: number;
  items: PurchaseItemDetail[];
}

const UserAccount = () => {
  const { user, isAuthenticated, isLoading: loading } = useAuth();
  const navigate = useNavigate();

  // Profile State
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "" });
  
  // Settings State
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [prefs, setPrefs] = useState({
    marketing_emails: true,
    update_emails: true,
  });

  // Purchase State
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [purchases, setPurchases] = useState<PurchaseListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseDetail | null>(null);

  // Show loader while auth context is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (after loading)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  // Fetch user profile
  useEffect(() => {
    if (loading || !user || !user.token) return;
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/users/user/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch user profile");
        const data = await response.json();
        setUserData(data);
        setFormData({
          full_name: data.full_name,
          email: data.email,
        });
      } catch (error) {
        console.error(error);
        toast.error("Error fetching user profile");
      }
    };
    fetchProfile();
  }, [user, loading]);

  // ============================================================
  // Purchase API Calls
  // ============================================================

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/buyer/purchases/stats/summary`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics");
    }
  };

  const fetchPurchases = async () => {
    try {
      const params: any = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const res = await axios.get(`${BASE_URL}/buyer/purchases/list`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params,
      });
      setPurchases(res.data);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast.error("Failed to load purchases");
    }
  };

  const fetchPurchaseDetail = async (purchaseId: string) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/buyer/purchases/${purchaseId}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setSelectedPurchase(res.data);
      setShowDetailDialog(true);
    } catch (error) {
      console.error("Error fetching purchase detail:", error);
      toast.error("Failed to load purchase details");
    }
  };

 const previewInvoice = async (purchaseId: string) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/buyer/purchases/${purchaseId}/invoice/preview`,
      {
        headers: { Authorization: `Bearer ${user?.token}` },
        responseType: "blob",
      }
    );

    // Create a blob URL and open it in a new tab
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");

    // Optional: Clean up the blob URL after some time
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error("Error previewing invoice:", error);
    toast.error("Failed to preview invoice");
  }
};

  const downloadInvoice = async (purchaseId: string) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/buyer/purchases/${purchaseId}/invoice/download`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${purchaseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  const downloadProduct = async (
    purchaseId: string,
    productId: number,
    productSlug: string
  ) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/buyer/purchases/${purchaseId}/download/${productId}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      const { download_link, filename } = res.data;

      const link = document.createElement("a");
      link.href = download_link;
      link.setAttribute("download", filename || `${productSlug}.zip`);
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Product download started");
    } catch (error) {
      console.error("Error downloading product:", error);
      toast.error("Failed to download product");
    }
  };

  // Load purchases data
  useEffect(() => {
    if (loading || !user || !user.token) return;
    const loadData = async () => {
      await Promise.all([fetchStats(), fetchPurchases()]);
    };
    loadData();
  }, [user, loading]);

  useEffect(() => {
    if (!loading && user) {
      fetchPurchases();
    }
  }, [statusFilter, user, loading]);

  // ============================================================
  // Profile Handlers
  // ============================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put(
        `${BASE_URL}/users/user/profile`,
        formData,
        {
          ...(isAuthenticated && user?.token
            ? { headers: { Authorization: `Bearer ${user.token}` } }
            : {}),
        }
      );
      setUserData({ ...userData, ...formData });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  // ============================================================
  // Settings Handlers
  // ============================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${BASE_URL}/users/user/password-update`,
        form,
        {
          ...(isAuthenticated && user?.token
            ? { headers: { Authorization: `Bearer ${user.token}` } }
            : {}),
        }
      );
      toast.success("Password updated!");
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error updating password");
    }
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrefs({ ...prefs, [e.target.id]: e.target.checked });
  };

  const savePrefs = async () => {
    try {
      await axios.post(
        `${BASE_URL}/users/user/email-preferences`,
        prefs,
        {
          ...(isAuthenticated && user?.token
            ? { headers: { Authorization: `Bearer ${user.token}` } }
            : {}),
        }
      );
      toast.success("Preferences saved!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error updating Preferences");
    }
  };

  // ============================================================
  // Helper Functions
  // ============================================================

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 shadow-sm">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-sm">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Conditional rendering
  if (loading || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 lg:py-10 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                My Account
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Manage your profile, purchases, and preferences
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-200">
              <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                <AvatarImage src={userData.username} alt={userData.full_name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                  {userData.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="font-semibold text-sm">{userData.full_name}</p>
                <p className="text-xs text-muted-foreground">{userData.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-200"
            >
              <UserCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="purchases"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-200"
            >
              <Package className="mr-2 mb-2 h-4 w-4" />
              <span className="hidden sm:inline">Purchases</span>
              <span className="sm:hidden">Orders</span>
            </TabsTrigger>
            <TabsTrigger 
              value="invoices"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-200"
            >
              <Receipt className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Invoices</span>
              <span className="sm:hidden">Bills</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-200"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                <CardTitle className="flex items-center gap-1">
                  <UserCircle className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  View and update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 ring-4 ring-primary/20 transition-all group-hover:ring-primary/40">
                        <AvatarImage src={userData.avatar} alt={userData.full_name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-3xl font-bold">
                          {userData.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Edit className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="shadow-sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Change Avatar
                    </Button>
                  </div>

                  {/* Form Section */}
                  <div className="flex-1 space-y-6">
                    {isEditing ? (
                      <>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="full_name" className="text-sm font-medium flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              Full Name
                            </Label>
                            <Input
                              id="full_name"
                              name="full_name"
                              value={formData.full_name}
                              onChange={handleInputChange}
                              className="border-slate-300 focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                              <Mail className="h-4 w-4 text-primary" />
                              Email Address
                            </Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="border-slate-300 focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button 
                            onClick={handleSaveProfile}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                full_name: userData.full_name,
                                email: userData.email,
                              });
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>Full Name</span>
                            </div>
                            <p className="text-lg font-semibold">{userData.full_name}</p>
                          </div>
                          <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span>Email Address</span>
                            </div>
                            <p className="text-lg font-semibold break-all">{userData.email}</p>
                          </div>
                          <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Member Since</span>
                            </div>
                            <p className="text-lg font-semibold">{userData.created_at}</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setIsEditing(true)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-6">
            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90 mb-1">Total Orders</p>
                        <p className="text-3xl font-bold">{stats.total_purchases}</p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-full">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90 mb-1">Total Spent</p>
                        <p className="text-3xl font-bold">{formatCurrency(stats.total_spent)}</p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-full">
                        <CreditCard className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90 mb-1">Products</p>
                        <p className="text-3xl font-bold">{stats.total_products}</p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-full">
                        <Package className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-amber-600 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90 mb-1">Pending</p>
                        <p className="text-3xl font-bold">{stats.pending_purchases}</p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-full">
                        <Clock className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Filter Purchases
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] border-slate-300 focus:ring-2 focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">✓ Success</SelectItem>
                      <SelectItem value="pending">⏱ Pending</SelectItem>
                      <SelectItem value="failed">✗ Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Table */}
            <Card className="hidden md:block border-0 shadow-lg bg-white/80 backdrop-blur overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>
                  {purchases.length} purchase(s) found
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead className="font-semibold">Order ID</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Items</TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Payment</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((purchase) => (
                        <TableRow 
                          key={purchase.id} 
                          className="hover:bg-blue-50/50 transition-colors"
                        >
                          <TableCell className="font-mono text-sm">
                            #{purchase.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>{formatDate(purchase.purchase_date)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 p-1.5 rounded">
                                <Package className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">{purchase.items_count}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-lg">
                            {formatCurrency(purchase.total_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium">
                              {purchase.payment_method}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fetchPurchaseDetail(purchase.id)}
                                className="hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {purchase.status === "success" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => previewInvoice(purchase.id)}
                                    className="hover:bg-blue-50"
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                                    onClick={() => downloadInvoice(purchase.id)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {purchases.length === 0 && (
                    <div className="text-center py-16">
                      <div className="bg-gradient-to-br from-slate-100 to-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="h-12 w-12 text-slate-400" />
                      </div>
                      <p className="text-xl font-semibold text-slate-700 mb-2">No purchases yet</p>
                      <p className="text-slate-500 mb-6">Start shopping to see your orders here</p>
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                        Browse Templates
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {purchases.length > 0 ? (
                purchases.map((purchase) => (
                  <Card 
                    key={purchase.id} 
                    className="border-0 shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 p-2 rounded-lg">
                                <Receipt className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-mono text-sm font-semibold">
                                #{purchase.id.slice(0, 8)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(purchase.purchase_date)}</span>
                            </div>
                          </div>
                          {getStatusBadge(purchase.status)}
                        </div>

                        {/* Details */}
                        <div className="flex items-center justify-between py-4 border-t border-b border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                              <Package className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Items</p>
                              <p className="font-semibold">{purchase.items_count}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Total</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                              {formatCurrency(purchase.total_amount)}
                            </p>
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className="font-medium">
                            {purchase.payment_method}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 hover:bg-blue-50"
                            onClick={() => fetchPurchaseDetail(purchase.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          {purchase.status === "success" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => previewInvoice(purchase.id)}
                                className="hover:bg-blue-50"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                                onClick={() => downloadInvoice(purchase.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                  <CardContent className="py-16 text-center">
                    <div className="bg-gradient-to-br from-slate-100 to-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="h-12 w-12 text-slate-400" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 mb-2">No purchases yet</p>
                    <p className="text-sm text-slate-500 mb-6">Start shopping to see your orders here</p>
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                      Browse Templates
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Invoices
                </CardTitle>
                <CardDescription>
                  Access and download invoices for your purchases
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {purchases.filter(p => p.status === "success").length > 0 ? (
                  <div className="space-y-4">
                    {purchases
                      .filter(p => p.status === "success")
                      .map((purchase) => (
                        <div
                          key={purchase.id}
                          className="group p-5 border border-slate-200 rounded-xl hover:border-primary hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-slate-50"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                <FileText className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  Invoice #{purchase.id.slice(0, 12)}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatDate(purchase.purchase_date)}
                                  <span className="mx-2">•</span>
                                  <span className="font-semibold text-primary">
                                    {formatCurrency(purchase.total_amount)}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => previewInvoice(purchase.id)}
                                className="hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => downloadInvoice(purchase.id)}
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-br from-slate-100 to-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Receipt className="h-12 w-12 text-slate-400" />
                    </div>
                    <p className="text-xl font-semibold text-slate-700 mb-2">No invoices available</p>
                    <p className="text-slate-500">Your invoices will appear here after successful purchases</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Password Change Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 max-w-2xl">
                  <div className="space-y-2">
                    <Label htmlFor="current_password" className="text-sm font-medium">
                      Current Password
                    </Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={form.current_password}
                      onChange={handleChange}
                      placeholder="Enter current password"
                      className="border-slate-300 focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new_password" className="text-sm font-medium">
                        New Password
                      </Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={form.new_password}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        className="border-slate-300 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password" className="text-sm font-medium">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        value={form.confirm_password}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        className="border-slate-300 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Preferences Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Manage your email notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6 max-w-2xl">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <Label htmlFor="marketing_emails" className="font-semibold cursor-pointer">
                          Marketing Emails
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about new products and offers
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      id="marketing_emails"
                      className="w-5 h-5 text-primary focus:ring-2 focus:ring-primary rounded cursor-pointer"
                      checked={prefs.marketing_emails}
                      onChange={handleToggle}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Bell className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <Label htmlFor="update_emails" className="font-semibold cursor-pointer">
                          Product Updates
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about product improvements
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      id="update_emails"
                      className="w-5 h-5 text-primary focus:ring-2 focus:ring-primary rounded cursor-pointer"
                      checked={prefs.update_emails}
                      onChange={handleToggle}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-slate-50/50">
                <Button 
                  onClick={savePrefs}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Purchase Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Purchase Details
            </DialogTitle>
            <DialogDescription className="text-base">
              Order ID: <span className="font-mono font-semibold">#{selectedPurchase?.id}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-6 py-4">
              {/* Purchase Info */}
              <Card className="border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                  <CardTitle className="text-lg">Order Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Purchase Date</span>
                      </div>
                      <p className="font-semibold text-lg">
                        {formatDate(selectedPurchase.purchase_date)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4" />
                        <span>Status</span>
                      </div>
                      {getStatusBadge(selectedPurchase.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        <span>Payment Method</span>
                      </div>
                      <Badge variant="outline" className="text-base px-3 py-1">
                        {selectedPurchase.payment_method}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items - Desktop */}
              <Card className="hidden sm:block border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead className="font-semibold">Product</TableHead>
                        <TableHead className="text-center font-semibold">Quantity</TableHead>
                        <TableHead className="text-right font-semibold">Price</TableHead>
                        <TableHead className="text-right font-semibold">Subtotal</TableHead>
                        <TableHead className="text-center font-semibold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPurchase.items.map((item) => (
                        <TableRow key={item.product_id} className="hover:bg-blue-50/50">
                          <TableCell>
                            <div>
                              <p className="font-semibold">{item.product_title}</p>
                              <p className="text-sm text-muted-foreground font-mono">
                                {item.product_slug}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{item.quantity}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.price_per_unit)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-lg">
                            {formatCurrency(item.subtotal)}
                          </TableCell>
                          <TableCell className="text-center">
                            {selectedPurchase.status === "success" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  downloadProduct(
                                    selectedPurchase.id,
                                    item.product_id,
                                    item.product_slug
                                  )
                                }
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Items - Mobile */}
              <Card className="sm:hidden border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {selectedPurchase.items.map((item) => (
                    <div
                      key={item.product_id}
                      className="p-4 border-2 border-slate-200 rounded-xl space-y-3 hover:border-primary transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-base">{item.product_title}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {item.product_slug}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Quantity</p>
                          <Badge variant="outline" className="mt-1">{item.quantity}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-xl font-bold text-primary mt-1">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </div>
                      </div>
                      {selectedPurchase.status === "success" && (
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                          onClick={() =>
                            downloadProduct(
                              selectedPurchase.id,
                              item.product_id,
                              item.product_slug
                            )
                          }
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Product
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Billing Summary */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    Billing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-base">
                      <span className="text-muted-foreground">Subtotal (Before Tax)</span>
                      <span className="font-semibold">
                        {formatCurrency(selectedPurchase.base_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-muted-foreground">
                        GST ({selectedPurchase.gst_percentage}%)
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(selectedPurchase.gst_amount)}
                      </span>
                    </div>
                    <div className="border-t-2 border-slate-300 pt-4 flex justify-between items-center">
                      <span className="text-xl font-bold">Total Amount</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {formatCurrency(selectedPurchase.total_amount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {selectedPurchase.status === "success" && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg text-base py-6"
                    onClick={() => previewInvoice(selectedPurchase.id)}
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    Preview Invoice
                  </Button>
                  <Button
                    className="flex-1 border-2 text-base py-6"
                    variant="outline"
                    onClick={() => downloadInvoice(selectedPurchase.id)}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download Invoice
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserAccount;