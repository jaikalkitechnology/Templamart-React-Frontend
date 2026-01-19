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
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

// ============================================================
// Type Definitions
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
  // API Calls
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
  // Effects
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
        return <Badge variant="destructive">Admin</Badge>;
      case 2:
        return <Badge variant="default">Seller</Badge>;
      case 3:
        return <Badge variant="secondary">Buyer</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  // ============================================================
  // Render
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Users Management
        </h2>
        <p className="text-muted-foreground">
          Manage buyers, sellers, and their permissions
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Buyers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">
                Active: {stats.active_users} | Inactive: {stats.inactive_users}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Store className="h-4 w-4" />
                Total Sellers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_sellers}</div>
              <p className="text-xs text-muted-foreground">
                Active: {stats.active_sellers} | Inactive:{" "}
                {stats.inactive_sellers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total_users + stats.total_sellers}
              </div>
              <p className="text-xs text-muted-foreground">
                Active:{" "}
                {stats.active_users + stats.active_sellers}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="buyers">Buyers ({stats?.total_users})</TabsTrigger>
          <TabsTrigger value="sellers">
            Sellers ({stats?.total_sellers})
          </TabsTrigger>
        </TabsList>

        {/* BUYERS TAB */}
        <TabsContent value="buyers" className="space-y-4">
          {/* Filters and Create Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search buyers..."
                      value={buyerSearch}
                      onChange={(e) => setBuyerSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={buyerStatusFilter}
                    onValueChange={setBuyerStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setShowCreateBuyerDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Buyer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buyers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Buyers List</CardTitle>
              <CardDescription>{buyers.length} buyers found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>KYC</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buyers.map((buyer) => (
                      <TableRow key={buyer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{buyer.username}</p>
                            {buyer.full_name && (
                              <p className="text-sm text-muted-foreground">
                                {buyer.full_name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{buyer.email}</TableCell>
                        <TableCell>
                          {buyer.kyc_verified ? (
                            <Badge className="bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(buyer.created_at)}</TableCell>
                        <TableCell>{getStatusBadge(buyer.is_active)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewBuyerDetails(buyer.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(buyer);
                                setShowPasswordDialog(true);
                              }}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={buyer.is_active ? "destructive" : "default"}
                              onClick={() =>
                                toggleUserStatus(buyer.id, buyer.is_active)
                              }
                            >
                              {buyer.is_active ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SELLERS TAB */}
        <TabsContent value="sellers" className="space-y-4">
          {/* Filters and Create Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search sellers..."
                      value={sellerSearch}
                      onChange={(e) => setSellerSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={sellerStatusFilter}
                    onValueChange={setSellerStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setShowCreateSellerDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Seller
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sellers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Sellers List</CardTitle>
              <CardDescription>{sellers.length} sellers found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>KYC</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sellers.map((seller) => (
                      <TableRow key={seller.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{seller.username}</p>
                            {seller.full_name && (
                              <p className="text-sm text-muted-foreground">
                                {seller.full_name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{seller.email}</TableCell>
                        <TableCell>
                          {seller.kyc_verified ? (
                            <Badge className="bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(seller.created_at)}</TableCell>
                        <TableCell>
                          {getStatusBadge(seller.is_active)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewSellerDetails(seller.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(seller);
                                setShowPasswordDialog(true);
                              }}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                seller.is_active ? "destructive" : "default"
                              }
                              onClick={() =>
                                toggleUserStatus(seller.id, seller.is_active)
                              }
                            >
                              {seller.is_active ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Buyer Dialog */}
      <Dialog open={showCreateBuyerDialog} onOpenChange={setShowCreateBuyerDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Buyer</DialogTitle>
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
              />
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="Enter full name"
                value={createBuyerForm.full_name}
                onChange={(e) =>
                  setCreateBuyerForm({ ...createBuyerForm, full_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                placeholder="Enter phone number"
                value={createBuyerForm.phone_number}
                onChange={(e) =>
                  setCreateBuyerForm({
                    ...createBuyerForm,
                    phone_number: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateBuyerDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={createBuyer}>Create Buyer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Seller Dialog */}
      <Dialog
        open={showCreateSellerDialog}
        onOpenChange={setShowCreateSellerDialog}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Seller</DialogTitle>
            <DialogDescription>
              Add a new seller account with profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
              />
            </div>
            <div className="space-y-2">
              <Label>Commission Rate (%)</Label>
              <Input
                type="number"
                placeholder="Enter commission rate"
                value={createSellerForm.commission_rate}
                onChange={(e) =>
                  setCreateSellerForm({
                    ...createSellerForm,
                    commission_rate: parseFloat(e.target.value),
                  })
                }
                min="0"
                max="100"
                step="0.1"
              />
              <p className="text-xs text-muted-foreground">
                Seller will receive: {100 - createSellerForm.commission_rate}%
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateSellerDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={createSeller}>Create Seller</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.role === 2 ? "Seller" : "Buyer"} Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* User Info */}
            {selectedUser && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-medium">{selectedUser.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">
                        {selectedUser.full_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        {selectedUser.phone_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Joined</p>
                      <p className="font-medium">
                        {formatDate(selectedUser.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStatusBadge(selectedUser.is_active)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seller-specific details */}
            {sellerDetails && sellerDetails.profile && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Seller Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Display Name
                        </p>
                        <p className="font-medium">
                          {sellerDetails.profile.display_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Commission Tier
                        </p>
                        <Badge>{sellerDetails.profile.commission_tier}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Commission Rate
                        </p>
                        <p className="font-medium">
                          {sellerDetails.profile.commission_rate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Seller Rate
                        </p>
                        <p className="font-medium">
                          {sellerDetails.profile.seller_rate}%
                        </p>
                      </div>
                    </div>
                    {sellerDetails.profile.bio && (
                      <div>
                        <p className="text-sm text-muted-foreground">Bio</p>
                        <p className="text-sm">{sellerDetails.profile.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sales Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Wallet Balance
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(sellerDetails.wallet_balance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Payout Balance
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(sellerDetails.payout_wallet_balance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Products
                        </p>
                        <p className="text-xl font-bold">
                          {sellerDetails.total_products}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Sales
                        </p>
                        <p className="text-xl font-bold">
                          {formatCurrency(sellerDetails.total_sales)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Orders
                        </p>
                        <p className="text-xl font-bold">
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Purchase Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Purchases
                        </p>
                        <p className="text-xl font-bold">
                          {formatCurrency(buyerDetails.total_purchases)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Orders
                        </p>
                        <p className="text-xl font-bold">
                          {buyerDetails.total_orders}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {buyerDetails.recent_purchases.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Recent Purchases
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                            <TableRow key={purchase.id}>
                              <TableCell className="font-mono text-xs">
                                {purchase.id.slice(0, 10)}...
                              </TableCell>
                              <TableCell className="font-semibold">
                                {formatCurrency(purchase.total_amount)}
                              </TableCell>
                              <TableCell>{purchase.product_count}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    purchase.status === "success"
                                      ? "default"
                                      : purchase.status === "pending"
                                      ? "secondary"
                                      : "destructive"
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
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.username}
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
              />
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
            >
              Cancel
            </Button>
            <Button onClick={changePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;