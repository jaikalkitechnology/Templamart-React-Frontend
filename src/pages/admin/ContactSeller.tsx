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
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  FileSpreadsheet,
  ExternalLink,
  User,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  AlertCircle,
  MoreVertical,
  RefreshCw,
  Loader2,
  Shield,
  Briefcase,
  Globe,
  MessageSquare,
  ChevronRight,
  Sparkles,
  BarChart3
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

interface RegistrationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface ContactSellerBasic {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  username: string;
  company_name: string;
  gst_number: string;
  status: string;
  created_at: string;
}

interface ContactSellerDetail {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  username: string;
  company_name: string;
  company_type: string;
  company_registration_number: string | null;
  company_address: string;
  company_city: string;
  company_state: string;
  company_pincode: string;
  company_country: string;
  gst_number: string;
  business_description: string | null;
  years_in_business: number | null;
  expected_monthly_revenue: number | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

// ============================================================
// Main Component
// ============================================================

const ContactSellerManagement = () => {
  const { user } = useAuth();

  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [stats, setStats] = useState<RegistrationStats | null>(null);

  // Registrations
  const [registrations, setRegistrations] = useState<ContactSellerBasic[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Dialogs
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Selected registration
  const [selectedRegistration, setSelectedRegistration] =
    useState<ContactSellerDetail | null>(null);

  // Form data
  const [approveForm, setApproveForm] = useState({
    password: "",
    admin_notes: "",
  });

  const [rejectForm, setRejectForm] = useState({
    admin_notes: "",
  });

  // ============================================================
  // API Calls
  // ============================================================

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/contact-seller/contact-seller/admin/stats`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics");
    }
  };

  const fetchRegistrations = async (status?: string) => {
    try {
      const endpoint = status
        ? `${BASE_URL}/dash/contact-seller/admin/all?status=${status}`
        : `${BASE_URL}/dash/contact-seller/admin/all`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      
      let sortedData = res.data;
      if (sortBy === "newest") {
        sortedData = sortedData.sort((a: ContactSellerBasic, b: ContactSellerBasic) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (sortBy === "oldest") {
        sortedData = sortedData.sort((a: ContactSellerBasic, b: ContactSellerBasic) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
      
      setRegistrations(sortedData);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to load registrations");
    }
  };

  const fetchRegistrationDetail = async (id: number) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/dash/contact-seller/admin/${id}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setSelectedRegistration(res.data);
      setShowDetailDialog(true);
    } catch (error) {
      console.error("Error fetching registration detail:", error);
      toast.error("Failed to load registration details");
    }
  };

  const approveRegistration = async () => {
    if (!selectedRegistration) return;

    if (!approveForm.password) {
      toast.error("Please enter a password for the seller account");
      return;
    }

    if (approveForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/dash/contact-seller/admin/${selectedRegistration.id}/approve`,
        {
          password: approveForm.password,
          admin_notes: approveForm.admin_notes || null,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      toast.success("Seller registration approved successfully!");
      setShowApproveDialog(false);
      setShowDetailDialog(false);
      setApproveForm({ password: "", admin_notes: "" });
      setSelectedRegistration(null);
      fetchStats();
      fetchRegistrations(activeTab === "all" ? undefined : activeTab);
    } catch (error: any) {
      console.error("Error approving registration:", error);
      toast.error(
        error.response?.data?.detail || "Failed to approve registration"
      );
    }
  };

  const rejectRegistration = async () => {
    if (!selectedRegistration) return;

    if (!rejectForm.admin_notes) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/dash/contact-seller/admin/${selectedRegistration.id}/reject`,
        {
          admin_notes: rejectForm.admin_notes,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      toast.success("Seller registration rejected");
      setShowRejectDialog(false);
      setShowDetailDialog(false);
      setRejectForm({ admin_notes: "" });
      setSelectedRegistration(null);
      fetchStats();
      fetchRegistrations(activeTab === "all" ? undefined : activeTab);
    } catch (error: any) {
      console.error("Error rejecting registration:", error);
      toast.error(
        error.response?.data?.detail || "Failed to reject registration"
      );
    }
  };

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStats(),
      fetchRegistrations(activeTab === "all" ? undefined : activeTab),
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
      await Promise.all([fetchStats(), fetchRegistrations("pending")]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const status = activeTab === "all" ? undefined : activeTab;
      fetchRegistrations(status);
    }
  }, [activeTab, sortBy]);

  // ============================================================
  // Helpers
  // ============================================================

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200 px-3 py-1">
            <Clock className="h-3 w-3 mr-1 animate-pulse" />
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200 px-3 py-1">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "from-amber-500 to-yellow-500";
      case "approved":
        return "from-emerald-500 to-green-500";
      case "rejected":
        return "from-red-500 to-pink-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      reg.full_name.toLowerCase().includes(searchLower) ||
      reg.email.toLowerCase().includes(searchLower) ||
      reg.username.toLowerCase().includes(searchLower) ||
      reg.company_name.toLowerCase().includes(searchLower) ||
      reg.gst_number.toLowerCase().includes(searchLower)
    );
  });

  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="w-8 h-8 text-emerald-500/60 animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground">Loading seller registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600/10 via-emerald-500/5 to-background p-8 border border-emerald-200/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
              Seller Registrations
            </h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
              Review and manage seller registration requests with comprehensive verification
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="text-sm px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
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
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-2 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-700">
                <Users className="h-4 w-4" />
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-800">
                {stats.total}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-muted-foreground">
                  All time submissions
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +24%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-amber-300 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700">
                <Clock className="h-4 w-4" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-800">
                {stats.pending}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Awaiting Action</span>
                  <span>{Math.round((stats.pending / stats.total) * 100)}%</span>
                </div>
                <Progress 
                  value={(stats.pending / Math.max(stats.total, 1)) * 100} 
                  className="h-2 bg-amber-100" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-800">
                {stats.approved}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                <span className="font-medium">Success Rate:</span>{" "}
                {Math.round((stats.approved / Math.max(stats.total - stats.pending, 1)) * 100)}%
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-red-300 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -translate-y-12 translate-x-12"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
                <XCircle className="h-4 w-4" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-800">
                {stats.rejected}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                <span className="font-medium">Rejection Rate:</span>{" "}
                {Math.round((stats.rejected / Math.max(stats.total - stats.pending, 1)) * 100)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button variant="outline" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Button>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Advanced Filters
        </Button>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Date Range
        </Button>
      </div>

      {/* Main Content */}
      <Card className="border-2 shadow-sm">
        <CardContent className="p-0">
          <div className="px-6 pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <TabsList className="grid w-full md:w-auto grid-cols-4">
                  <TabsTrigger 
                    value="pending" 
                    className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white"
                  >
                    <Clock className="h-4 w-4" />
                    Pending ({stats?.pending || 0})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="approved"
                    className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approved ({stats?.approved || 0})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rejected"
                    className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                  >
                    <XCircle className="h-4 w-4" />
                    Rejected ({stats?.rejected || 0})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="all"
                    className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
                  >
                    <Users className="h-4 w-4" />
                    All ({stats?.total || 0})
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px] pl-10">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <TabsContent value={activeTab} className="m-0">
                <div className="pb-6">
                  {/* Search */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search by name, email, company, GST number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>

                  {/* Registrations Table */}
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader className={`bg-gradient-to-r ${getStatusColor(activeTab)}/10 to-white/50`}>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-semibold">Applicant Details</TableHead>
                          <TableHead className="font-semibold">Company</TableHead>
                          <TableHead className="font-semibold">GST Info</TableHead>
                          <TableHead className="font-semibold">Applied On</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRegistrations.map((registration) => (
                          <TableRow 
                            key={registration.id} 
                            className="group hover:bg-gradient-to-r hover:from-emerald-500/5 hover:via-emerald-500/2 hover:to-transparent transition-colors"
                          >
                            <TableCell>
                              <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                                    <User className="h-5 w-5 text-emerald-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate group-hover:text-emerald-600 transition-colors">
                                      {registration.full_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      <Mail className="h-3 w-3 inline mr-1" />
                                      {registration.email}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      @{registration.username}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span>{registration.phone_number}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-50 flex items-center justify-center">
                                    <Building2 className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {registration.company_name}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-50 flex items-center justify-center">
                                    <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="font-mono text-sm font-semibold">
                                      {registration.gst_number}
                                    </p>
                                    <Badge variant="outline" className="text-xs mt-1 border-purple-200">
                                      GST Registered
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {formatDate(registration.created_at)}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(registration.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(registration.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-emerald-500/10"
                                  onClick={() => fetchRegistrationDetail(registration.id)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {registration.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 hover:bg-emerald-500/10"
                                      onClick={() => {
                                        fetchRegistrationDetail(registration.id);
                                        setTimeout(() => setShowApproveDialog(true), 100);
                                      }}
                                      title="Approve"
                                    >
                                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 hover:bg-red-500/10"
                                      onClick={() => {
                                        fetchRegistrationDetail(registration.id);
                                        setTimeout(() => setShowRejectDialog(true), 100);
                                      }}
                                      title="Reject"
                                    >
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => fetchRegistrationDetail(registration.id)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    {registration.status === "pending" && (
                                      <>
                                        <DropdownMenuItem onClick={() => {
                                          fetchRegistrationDetail(registration.id);
                                          setTimeout(() => setShowApproveDialog(true), 100);
                                        }}>
                                          <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                          fetchRegistrationDetail(registration.id);
                                          setTimeout(() => setShowRejectDialog(true), 100);
                                        }}>
                                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                          Reject
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {filteredRegistrations.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="font-medium text-lg">No registrations found</h3>
                        <p className="text-muted-foreground mt-1">
                          {search ? "Try adjusting your search criteria" : "No registrations in this category"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Registration Details
            </DialogTitle>
            <DialogDescription>
              Review seller registration application
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-6 py-4">
              {/* Header with Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    Application #{selectedRegistration.id}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Submitted on {formatDate(selectedRegistration.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedRegistration.status)}
                  {selectedRegistration.status === "approved" && (
                    <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      KYC Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Personal Information Card */}
              <Card className="border-2 border-emerald-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 p-3 bg-emerald-50/50 rounded-lg">
                      <Label className="text-muted-foreground">Full Name</Label>
                      <p className="font-medium text-lg">
                        {selectedRegistration.full_name}
                      </p>
                    </div>
                    <div className="space-y-2 p-3 bg-emerald-50/50 rounded-lg">
                      <Label className="text-muted-foreground">Username</Label>
                      <p className="font-medium text-lg">
                        @{selectedRegistration.username}
                      </p>
                    </div>
                    <div className="space-y-2 p-3 bg-emerald-50/50 rounded-lg">
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedRegistration.email}
                      </p>
                    </div>
                    <div className="space-y-2 p-3 bg-emerald-50/50 rounded-lg">
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedRegistration.phone_number}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information Card */}
              <Card className="border-2 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                    <Building2 className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Company Name</Label>
                      <p className="font-medium text-lg">
                        {selectedRegistration.company_name}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Company Type</Label>
                      <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800">
                        {selectedRegistration.company_type}
                      </Badge>
                    </div>
                  </div>

                  {selectedRegistration.company_registration_number && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Registration Number</Label>
                      <p className="font-medium font-mono">
                        {selectedRegistration.company_registration_number}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Registered Address
                    </Label>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="font-medium">
                        {selectedRegistration.company_address}
                      </p>
                      <p className="text-sm mt-1">
                        {selectedRegistration.company_city},{" "}
                        {selectedRegistration.company_state} -{" "}
                        {selectedRegistration.company_pincode}
                      </p>
                      <p className="text-sm">{selectedRegistration.company_country}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* GST Information Card */}
              <Card className="border-2 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
                    <FileSpreadsheet className="h-5 w-5" />
                    GST Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                      <Label className="text-muted-foreground">GST Number</Label>
                      <p className="font-mono text-xl font-bold text-purple-800">
                        {selectedRegistration.gst_number}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm text-muted-foreground">
                        GST verified and registered business
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Details Card */}
              {(selectedRegistration.business_description ||
                selectedRegistration.years_in_business ||
                selectedRegistration.expected_monthly_revenue) && (
                <Card className="border-2 border-amber-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                      <Briefcase className="h-5 w-5" />
                      Business Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedRegistration.business_description && (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Business Description</Label>
                        <p className="text-sm p-3 bg-amber-50 rounded-lg">
                          {selectedRegistration.business_description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRegistration.years_in_business && (
                        <div className="space-y-2 p-3 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg">
                          <Label className="text-muted-foreground">Years in Business</Label>
                          <p className="text-2xl font-bold text-amber-800">
                            {selectedRegistration.years_in_business} years
                          </p>
                        </div>
                      )}

                      {selectedRegistration.expected_monthly_revenue && (
                        <div className="space-y-2 p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
                          <Label className="text-muted-foreground">Expected Monthly Revenue</Label>
                          <p className="text-2xl font-bold text-emerald-800 flex items-center">
                            <IndianRupee className="h-6 w-6 mr-1" />
                            {selectedRegistration.expected_monthly_revenue.toLocaleString('en-IN')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Links Card */}
              {(selectedRegistration.portfolio_url ||
                selectedRegistration.linkedin_url ||
                selectedRegistration.website_url) && (
                <Card className="border-2 border-cyan-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-cyan-700">
                      <Globe className="h-5 w-5" />
                      Online Presence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedRegistration.portfolio_url && (
                      <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                            <Briefcase className="h-4 w-4 text-cyan-600" />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Portfolio</Label>
                          </div>
                        </div>
                        <a
                          href={selectedRegistration.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {selectedRegistration.linkedin_url && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">LinkedIn</Label>
                          </div>
                        </div>
                        <a
                          href={selectedRegistration.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {selectedRegistration.website_url && (
                      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                            <Globe className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Website</Label>
                          </div>
                        </div>
                        <a
                          href={selectedRegistration.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          Visit <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Additional Message */}
              {selectedRegistration.message && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Additional Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm p-3 bg-gray-50 rounded-lg">
                      {selectedRegistration.message}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Admin Notes */}
              {selectedRegistration.admin_notes && (
                <Card className="border-2 border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Admin Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{selectedRegistration.admin_notes}</p>
                      {selectedRegistration.reviewed_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Reviewed on {formatDate(selectedRegistration.reviewed_at)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              {selectedRegistration.status === "pending" && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    className="flex-1 gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                    onClick={() => {
                      setShowDetailDialog(false);
                      setShowApproveDialog(true);
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Registration
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                    onClick={() => {
                      setShowDetailDialog(false);
                      setShowRejectDialog(true);
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Registration
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Approve Seller Registration
            </DialogTitle>
            <DialogDescription>
              Create seller account for {selectedRegistration?.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold text-emerald-900">Ready to Approve!</div>
                  <div className="text-sm text-emerald-700">
                    This will create a verified seller account
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Password for Seller Account{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Enter password"
                value={approveForm.password}
                onChange={(e) =>
                  setApproveForm({ ...approveForm, password: e.target.value })
                }
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 6 characters. This will be the initial password for the seller's account.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Admin Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this approval..."
                value={approveForm.admin_notes}
                onChange={(e) =>
                  setApproveForm({
                    ...approveForm,
                    admin_notes: e.target.value,
                  })
                }
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 p-4 border border-blue-200">
              <div className="text-sm font-medium text-blue-900 mb-2">
                This will create:
              </div>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Seller account with KYC verified status</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Seller profile with company details</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Company record with GST information</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Wallet and Payout wallet (both with ₹0 balance)</span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setShowDetailDialog(true);
                setApproveForm({ password: "", admin_notes: "" });
              }}
              className="h-11"
            >
              Cancel
            </Button>
            <Button 
              onClick={approveRegistration}
              className="h-11 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Seller Registration
            </DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedRegistration?.full_name}
              's application
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold text-red-900">Reject Application</div>
                  <div className="text-sm text-red-700">
                    This action cannot be undone
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Reason for Rejection <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Explain why this application is being rejected..."
                value={rejectForm.admin_notes}
                onChange={(e) =>
                  setRejectForm({ admin_notes: e.target.value })
                }
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This reason will be stored in admin notes and visible to administrators.
              </p>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-red-50 to-orange-50 p-4 border border-red-200">
              <div className="text-sm text-red-800">
                <AlertCircle className="h-4 w-4 inline mr-2 mb-1" />
                <strong>Warning:</strong> This action will mark the application
                as rejected. The applicant will need to submit a new application
                if they want to reapply.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setShowDetailDialog(true);
                setRejectForm({ admin_notes: "" });
              }}
              className="h-11"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={rejectRegistration}
              className="h-11 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactSellerManagement;