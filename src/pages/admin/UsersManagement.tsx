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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Eye,
  UserPlus,
  ShoppingBag,
  Key,
  UserX,
  UserCheck,
  Users,
  Store,
  Download,
  Filter,
  MoreVertical,
  CreditCard,
  Package,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Globe,
  BarChart3,
  Wallet,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ============================================================
// Type Definitions (unchanged)
// ============================================================

interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_sellers: number;
  active_sellers: number;
  inactive_sellers: number;
}

interface UserBasic {
  id: number;
  username: string;
  email: string;
  role: number;
  full_name: string | null;
  phone_number: string | null;
  kyc_verified: boolean;
  email_verified: boolean;
  created_at: string;
  is_active: boolean;
  last_login: string | null;
}

interface SellerProfileDetail {
  display_name: string | null;
  bio: string | null;
  website_url: string | null;
  twitter_url: string | null;
  dribbble_url: string | null;
  behance_url: string | null;
  linkedin_url: string | null;
  commission_rate: number;
  seller_rate: number;
  total_sales: number;
  commission_tier: string;
  email_notifications: boolean;
  marketing_emails: boolean;
  sale_notifications: boolean;
  review_notifications: boolean;
}

interface SellerDetail {
  user: UserBasic;
  profile: SellerProfileDetail | null;
  wallet_balance: number;
  payout_wallet_balance: number;
  total_products: number;
  total_sales: number;
  total_orders: number;
}

interface PurchaseDetail {
  id: string;
  total_amount: number;
  purchase_date: string;
  status: string;
  product_count: number;
}

interface BuyerDetail {
  user: UserBasic;
  total_purchases: number;
  total_orders: number;
  recent_purchases: PurchaseDetail[];
}

// ============================================================
// Main Component
// ============================================================

const UsersManagement = () => {
  const { user } = useAuth();

  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("buyers");
  const [stats, setStats] = useState<UserStats | null>(null);

  // Buyers
  const [buyers, setBuyers] = useState<UserBasic[]>([]);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [buyerStatusFilter, setBuyerStatusFilter] = useState<string>("all");

  // Sellers
  const [sellers, setSellers] = useState<UserBasic[]>([]);
  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerStatusFilter, setSellerStatusFilter] = useState<string>("all");

  // Dialogs
  const [showCreateBuyerDialog, setShowCreateBuyerDialog] = useState(false);
  const [showCreateSellerDialog, setShowCreateSellerDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Selected user
  const [selectedUser, setSelectedUser] = useState<UserBasic | null>(null);
  const [buyerDetails, setBuyerDetails] = useState<BuyerDetail | null>(null);
  const [sellerDetails, setSellerDetails] = useState<SellerDetail | null>(null);

  // Form data
  const [createBuyerForm, setCreateBuyerForm] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
  });

  const [createSellerForm, setCreateSellerForm] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
    display_name: "",
    bio: "",
    commission_rate: 8,
  });

  const [newPassword, setNewPassword] = useState("");

  // ============================================================
  // API Calls (unchanged)
  // ============================================================

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/users/stats`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchBuyers = async () => {
    try {
      const params: any = {};
      if (buyerStatusFilter !== "all") {
        params.is_active = buyerStatusFilter === "active";
      }
      if (buyerSearch) {
        params.search = buyerSearch;
      }

      const res = await axios.get(`${BASE_URL}/dash/users/buyers`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params,
      });
      setBuyers(res.data);
    } catch (error) {
      console.error("Error fetching buyers:", error);
      toast.error("Failed to load buyers");
    }
  };

  const fetchSellers = async () => {
    try {
      const params: any = {};
      if (sellerStatusFilter !== "all") {
        params.is_active = sellerStatusFilter === "active";
      }
      if (sellerSearch) {
        params.search = sellerSearch;
      }

      const res = await axios.get(`${BASE_URL}/dash/users/sellers`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        params,
      });
      setSellers(res.data);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error("Failed to load sellers");
    }
  };

  const createBuyer = async () => {
    try {
      await axios.post(`${BASE_URL}/dash/users/buyers`, createBuyerForm, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      toast.success("Buyer created successfully");
      setShowCreateBuyerDialog(false);
      setCreateBuyerForm({
        username: "",
        email: "",
        password: "",
        full_name: "",
        phone_number: "",
      });
      fetchBuyers();
      fetchStats();
    } catch (error: any) {
      console.error("Error creating buyer:", error);
      toast.error(error.response?.data?.detail || "Failed to create buyer");
    }
  };

  const createSeller = async () => {
    try {
      await axios.post(`${BASE_URL}/dash/users/sellers`, createSellerForm, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      toast.success("Seller created successfully");
      setShowCreateSellerDialog(false);
      setCreateSellerForm({
        username: "",
        email: "",
        password: "",
        full_name: "",
        phone_number: "",
        display_name: "",
        bio: "",
        commission_rate: 8,
      });
      fetchSellers();
      fetchStats();
    } catch (error: any) {
      console.error("Error creating seller:", error);
      toast.error(error.response?.data?.detail || "Failed to create seller");
    }
  };

  const viewBuyerDetails = async (buyerId: number) => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/users/buyers/${buyerId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setBuyerDetails(res.data);
      setSelectedUser(res.data.user);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error("Error fetching buyer details:", error);
      toast.error("Failed to load buyer details");
    }
  };

  const viewSellerDetails = async (sellerId: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/dash/users/sellers/${sellerId}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setSellerDetails(res.data);
      setSelectedUser(res.data.user);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error("Error fetching seller details:", error);
      toast.error("Failed to load seller details");
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await axios.patch(
        `${BASE_URL}/dash/users/${userId}/status`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      toast.success(
        `User ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
      fetchBuyers();
      fetchSellers();
      fetchStats();
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast.error(error.response?.data?.detail || "Failed to update status");
    }
  };

  const changePassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      await axios.patch(
        `${BASE_URL}/dash/users/${selectedUser.id}/password`,
        { new_password: newPassword },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      toast.success("Password changed successfully");
      setShowPasswordDialog(false);
      setNewPassword("");
      setSelectedUser(null);
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    }
  };

  // ============================================================
  // Effects (unchanged)
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchBuyers(), fetchSellers()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchBuyers();
    }
  }, [buyerSearch, buyerStatusFilter]);

  useEffect(() => {
    if (!loading) {
      fetchSellers();
    }
  }, [sellerSearch, sellerStatusFilter]);

  // ============================================================
  // Helpers
  // ============================================================

  const getRoleBadge = (role: number) => {
    switch (role) {
      case 1:
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1">
            Admin
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1">
            Seller
          </Badge>
        );
      case 3:
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
            Buyer
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 border-emerald-200 px-3 py-1">
        <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
        Active
      </Badge>
    ) : (
      <Badge className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-gray-300 px-3 py-1">
        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
        Inactive
      </Badge>
    );
  };

  const getKycBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 border-emerald-200">
        <ShieldCheck className="w-3 h-3 mr-1" />
        Verified
      </Badge>
    ) : (
      <Badge variant="outline" className="text-amber-700 border-amber-300">
        <AlertCircle className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
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
              <Users className="w-8 h-8 text-primary/60 animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground">Loading users data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Users Management
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
            Manage buyers, sellers, and their permissions with comprehensive
            analytics and controls
          </p>
        </div>
      </div>

      {/* Statistics Cards with Modern Design */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                Total Buyers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_users}</div>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-sm">
                  <span className="text-emerald-600 font-semibold">
                    {stats.active_users}
                  </span>{" "}
                  active
                </div>
                <div className="text-sm">
                  <span className="text-gray-600 font-semibold">
                    {stats.inactive_users}
                  </span>{" "}
                  inactive
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Store className="h-4 w-4" />
                Total Sellers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_sellers}</div>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-sm">
                  <span className="text-emerald-600 font-semibold">
                    {stats.active_sellers}
                  </span>{" "}
                  active
                </div>
                <div className="text-sm">
                  <span className="text-gray-600 font-semibold">
                    {stats.inactive_sellers}
                  </span>{" "}
                  inactive
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-green-500/30 transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.total_users + stats.total_sellers}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                    style={{
                      width: `${
                        ((stats.active_users + stats.active_sellers) /
                          (stats.total_users + stats.total_sellers)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-emerald-600">
                  {Math.round(
                    ((stats.active_users + stats.active_sellers) /
                      (stats.total_users + stats.total_sellers)) *
                      100
                  )}
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Active users rate
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">+12.5%</div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-emerald-600">This month</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowCreateBuyerDialog(true)}
          >
            <UserPlus className="h-4 w-4" />
            Add Buyer
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowCreateSellerDialog(true)}
          >
            <Store className="h-4 w-4" />
            Add Seller
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Last updated: {formatDate(new Date().toISOString())}
          </div>
        </div>
      </div>

      {/* Tabs with Enhanced Design */}
      <Card className="border-2 shadow-sm">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6 pt-6">
              <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2">
                <TabsTrigger
                  value="buyers"
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white"
                >
                  <Users className="h-4 w-4" />
                  Buyers ({stats?.total_users})
                </TabsTrigger>
                <TabsTrigger
                  value="sellers"
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
                >
                  <Store className="h-4 w-4" />
                  Sellers ({stats?.total_sellers})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* BUYERS TAB */}
            <TabsContent value="buyers" className="m-0">
              <div className="px-6 pb-6">
                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search buyers by name, email, or username..."
                      value={buyerSearch}
                      onChange={(e) => setBuyerSearch(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Select
                        value={buyerStatusFilter}
                        onValueChange={setBuyerStatusFilter}
                      >
                        <SelectTrigger className="w-[180px] pl-10 h-11">
                          <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active Only</SelectItem>
                          <SelectItem value="inactive">Inactive Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Buyers Table */}
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="font-semibold">Contact</TableHead>
                        <TableHead className="font-semibold">Verification</TableHead>
                        <TableHead className="font-semibold">Joined</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buyers.map((buyer) => (
                        <TableRow
                          key={buyer.id}
                          className="group hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/2 hover:to-transparent transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold group-hover:text-primary transition-colors">
                                  {buyer.username}
                                </p>
                                {buyer.full_name && (
                                  <p className="text-sm text-muted-foreground">
                                    {buyer.full_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{buyer.email}</span>
                              </div>
                              {buyer.phone_number && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">
                                    {buyer.phone_number}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              {getKycBadge(buyer.kyc_verified)}
                              {buyer.email_verified ? (
                                <Badge
                                  variant="outline"
                                  className="text-emerald-700 border-emerald-200"
                                >
                                  Email Verified
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-amber-700 border-amber-200"
                                >
                                  Email Pending
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {formatDate(buyer.created_at)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(buyer.is_active)}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                                onClick={() => viewBuyerDetails(buyer.id)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-blue-500/10"
                                onClick={() => {
                                  setSelectedUser(buyer);
                                  setShowPasswordDialog(true);
                                }}
                                title="Change Password"
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toggleUserStatus(buyer.id, buyer.is_active)
                                    }
                                  >
                                    {buyer.is_active ? (
                                      <>
                                        <UserX className="h-4 w-4 mr-2" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                    View Purchases
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {buyers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="font-medium text-lg">No buyers found</h3>
                      <p className="text-muted-foreground mt-1">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* SELLERS TAB */}
            <TabsContent value="sellers" className="m-0">
              <div className="px-6 pb-6">
                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search sellers by name, email, or display name..."
                      value={sellerSearch}
                      onChange={(e) => setSellerSearch(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Select
                        value={sellerStatusFilter}
                        onValueChange={setSellerStatusFilter}
                      >
                        <SelectTrigger className="w-[180px] pl-10 h-11">
                          <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active Only</SelectItem>
                          <SelectItem value="inactive">Inactive Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Sellers Table */}
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-blue-50 to-cyan-50/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Seller</TableHead>
                        <TableHead className="font-semibold">Contact</TableHead>
                        <TableHead className="font-semibold">Verification</TableHead>
                        <TableHead className="font-semibold">Joined</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sellers.map((seller) => (
                        <TableRow
                          key={seller.id}
                          className="group hover:bg-gradient-to-r hover:from-blue-500/5 hover:via-blue-500/2 hover:to-transparent transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/5 flex items-center justify-center">
                                <Store className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold group-hover:text-blue-600 transition-colors">
                                  {seller.username}
                                </p>
                                {seller.full_name && (
                                  <p className="text-sm text-muted-foreground">
                                    {seller.full_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{seller.email}</span>
                              </div>
                              {seller.phone_number && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">
                                    {seller.phone_number}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              {getKycBadge(seller.kyc_verified)}
                              {seller.email_verified ? (
                                <Badge
                                  variant="outline"
                                  className="text-emerald-700 border-emerald-200"
                                >
                                  Email Verified
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-amber-700 border-amber-200"
                                >
                                  Email Pending
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {formatDate(seller.created_at)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(seller.is_active)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-blue-500/10"
                                onClick={() => viewSellerDetails(seller.id)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-blue-500/10"
                                onClick={() => {
                                  setSelectedUser(seller);
                                  setShowPasswordDialog(true);
                                }}
                                title="Change Password"
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toggleUserStatus(seller.id, seller.is_active)
                                    }
                                  >
                                    {seller.is_active ? (
                                      <>
                                        <UserX className="h-4 w-4 mr-2" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Wallet className="h-4 w-4 mr-2" />
                                    View Earnings
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Package className="h-4 w-4 mr-2" />
                                    View Products
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {sellers.length === 0 && (
                    <div className="text-center py-12">
                      <Store className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="font-medium text-lg">No sellers found</h3>
                      <p className="text-muted-foreground mt-1">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Buyer Dialog */}
      <Dialog open={showCreateBuyerDialog} onOpenChange={setShowCreateBuyerDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New Buyer
            </DialogTitle>
            <DialogDescription>
              Add a new buyer account to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Username *</Label>
              <Input
                placeholder="Enter username"
                value={createBuyerForm.username}
                onChange={(e) =>
                  setCreateBuyerForm({ ...createBuyerForm, username: e.target.value })
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="Enter email"
                value={createBuyerForm.email}
                onChange={(e) =>
                  setCreateBuyerForm({ ...createBuyerForm, email: e.target.value })
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                placeholder="Enter password"
                value={createBuyerForm.password}
                onChange={(e) =>
                  setCreateBuyerForm({ ...createBuyerForm, password: e.target.value })
                }
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Enter full name"
                  value={createBuyerForm.full_name}
                  onChange={(e) =>
                    setCreateBuyerForm({ ...createBuyerForm, full_name: e.target.value })
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  placeholder="Enter phone"
                  value={createBuyerForm.phone_number}
                  onChange={(e) =>
                    setCreateBuyerForm({
                      ...createBuyerForm,
                      phone_number: e.target.value,
                    })
                  }
                  className="h-11"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateBuyerDialog(false)}
              className="h-11"
            >
              Cancel
            </Button>
            <Button onClick={createBuyer} className="h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
              Create Buyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Seller Dialog */}
      <Dialog
        open={showCreateSellerDialog}
        onOpenChange={setShowCreateSellerDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Create New Seller
            </DialogTitle>
            <DialogDescription>
              Add a new seller account with complete profile information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username *</Label>
                <Input
                  placeholder="Enter username"
                  value={createSellerForm.username}
                  onChange={(e) =>
                    setCreateSellerForm({
                      ...createSellerForm,
                      username: e.target.value,
                    })
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={createSellerForm.email}
                  onChange={(e) =>
                    setCreateSellerForm({
                      ...createSellerForm,
                      email: e.target.value,
                    })
                  }
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                placeholder="Enter password"
                value={createSellerForm.password}
                onChange={(e) =>
                  setCreateSellerForm({
                    ...createSellerForm,
                    password: e.target.value,
                  })
                }
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Enter full name"
                  value={createSellerForm.full_name}
                  onChange={(e) =>
                    setCreateSellerForm({
                      ...createSellerForm,
                      full_name: e.target.value,
                    })
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  placeholder="Enter phone number"
                  value={createSellerForm.phone_number}
                  onChange={(e) =>
                    setCreateSellerForm({
                      ...createSellerForm,
                      phone_number: e.target.value,
                    })
                  }
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                placeholder="Enter display name"
                value={createSellerForm.display_name}
                onChange={(e) =>
                  setCreateSellerForm({
                    ...createSellerForm,
                    display_name: e.target.value,
                  })
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                placeholder="Enter seller bio"
                value={createSellerForm.bio}
                onChange={(e) =>
                  setCreateSellerForm({
                    ...createSellerForm,
                    bio: e.target.value,
                  })
                }
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Commission Rate (%)</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Enter commission rate"
                  value={createSellerForm.commission_rate}
                  onChange={(e) =>
                    setCreateSellerForm({
                      ...createSellerForm,
                      commission_rate: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  max="100"
                  step="0.1"
                  className="h-11"
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Platform fee:{" "}
                  <span className="font-semibold">
                    {createSellerForm.commission_rate}%
                  </span>
                </p>
                <p className="text-xs text-emerald-600">
                  Seller receives:{" "}
                  <span className="font-semibold">
                    {100 - createSellerForm.commission_rate}%
                  </span>
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateSellerDialog(false)}
              className="h-11"
            >
              Cancel
            </Button>
            <Button onClick={createSeller} className="h-11 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              Create Seller
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUser?.role === 2 ? (
                <Store className="h-5 w-5 text-blue-600" />
              ) : (
                <Users className="h-5 w-5 text-primary" />
              )}
              {selectedUser?.role === 2 ? "Seller" : "Buyer"} Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* User Info Card */}
            {selectedUser && (
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>User Information</span>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(selectedUser.role)}
                      {getStatusBadge(selectedUser.is_active)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        {selectedUser.username}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {selectedUser.email}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">
                        {selectedUser.full_name || (
                          <span className="text-muted-foreground">Not provided</span>
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {selectedUser.phone_number || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Joined</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(selectedUser.created_at)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Last Login</p>
                      <p className="font-medium">
                        {selectedUser.last_login
                          ? formatDate(selectedUser.last_login)
                          : "Never"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">
                        KYC: {selectedUser.kyc_verified ? "Verified" : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">
                        Email: {selectedUser.email_verified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seller-specific details */}
            {sellerDetails && sellerDetails.profile && (
              <>
                {/* Seller Profile Card */}
                <Card className="border-2 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                      <Globe className="h-5 w-5" />
                      Seller Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Display Name</p>
                        <p className="font-medium">
                          {sellerDetails.profile.display_name || "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Commission Tier</p>
                        <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800">
                          {sellerDetails.profile.commission_tier}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Commission Rate</p>
                        <p className="font-medium text-blue-600">
                          {sellerDetails.profile.commission_rate}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Seller Rate</p>
                        <p className="font-medium text-emerald-600">
                          {sellerDetails.profile.seller_rate}%
                        </p>
                      </div>
                    </div>
                    {sellerDetails.profile.bio && (
                      <div className="space-y-1 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Bio</p>
                        <p className="text-sm bg-gray-50 p-3 rounded-lg">
                          {sellerDetails.profile.bio}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sales Statistics Card */}
                <Card className="border-2 border-emerald-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                      <BarChart3 className="h-5 w-5" />
                      Sales Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1 p-3 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Wallet Balance</p>
                        <p className="text-xl font-bold text-blue-700">
                          {formatCurrency(sellerDetails.wallet_balance)}
                        </p>
                      </div>
                      <div className="space-y-1 p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Payout Balance</p>
                        <p className="text-xl font-bold text-emerald-700">
                          {formatCurrency(sellerDetails.payout_wallet_balance)}
                        </p>
                      </div>
                      <div className="space-y-1 p-3 bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Products</p>
                        <p className="text-xl font-bold text-purple-700">
                          {sellerDetails.total_products}
                        </p>
                      </div>
                      <div className="space-y-1 p-3 bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                        <p className="text-xl font-bold text-amber-700">
                          {formatCurrency(sellerDetails.total_sales)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold">
                          {sellerDetails.total_orders}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Buyer-specific details */}
            {buyerDetails && (
              <>
                {/* Purchase Statistics Card */}
                <Card className="border-2 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-primary">
                      <ShoppingBag className="h-5 w-5" />
                      Purchase Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Purchases</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(buyerDetails.total_purchases)}
                        </p>
                      </div>
                      <div className="space-y-1 p-4 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {buyerDetails.total_orders}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Purchases Card */}
                {buyerDetails.recent_purchases.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Recent Purchases
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order ID</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Products</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {buyerDetails.recent_purchases.map((purchase) => (
                              <TableRow key={purchase.id} className="group">
                                <TableCell>
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {purchase.id.slice(0, 10)}...
                                  </code>
                                </TableCell>
                                <TableCell className="font-semibold">
                                  {formatCurrency(purchase.total_amount)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {purchase.product_count} items
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      purchase.status === "success"
                                        ? "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border-emerald-200"
                                        : purchase.status === "pending"
                                        ? "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200"
                                        : "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-200"
                                    }
                                  >
                                    {purchase.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {formatDate(purchase.purchase_date)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for{" "}
              <span className="font-semibold text-primary">
                {selectedUser?.username}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setNewPassword("");
                setSelectedUser(null);
              }}
              className="h-11"
            >
              Cancel
            </Button>
            <Button 
              onClick={changePassword} 
              className="h-11 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
            >
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;