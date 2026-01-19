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
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

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
  const [activeTab, setActiveTab] = useState("pending");
  const [stats, setStats] = useState<RegistrationStats | null>(null);

  // Registrations
  const [registrations, setRegistrations] = useState<ContactSellerBasic[]>([]);
  const [search, setSearch] = useState("");

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
      const res = await axios.get(`${BASE_URL}/dash/contact-seller/admin/stats`, {
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
      setRegistrations(res.data);
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
  }, [activeTab]);

  // ============================================================
  // Helpers
  // ============================================================

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
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
          Seller Registrations
        </h2>
        <p className="text-muted-foreground">
          Review and manage seller registration requests
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.approved}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({stats?.pending || 0})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({stats?.approved || 0})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({stats?.rejected || 0})
          </TabsTrigger>
          <TabsTrigger value="all">All ({stats?.total || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, company, or GST number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Registrations Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all"
                  ? "All Registrations"
                  : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Registrations`}
              </CardTitle>
              <CardDescription>
                {filteredRegistrations.length} registration(s) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>GST Number</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {registration.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {registration.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              @{registration.username}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {registration.company_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">
                              {registration.gst_number}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(registration.created_at)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(registration.status)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              fetchRegistrationDetail(registration.id)
                            }
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredRegistrations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No registrations found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Review seller registration application
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-6 py-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Application #{selectedRegistration.id}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Submitted on {formatDate(selectedRegistration.created_at)}
                  </p>
                </div>
                {getStatusBadge(selectedRegistration.status)}
              </div>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Full Name</Label>
                      <p className="font-medium">
                        {selectedRegistration.full_name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Username</Label>
                      <p className="font-medium">
                        @{selectedRegistration.username}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedRegistration.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedRegistration.phone_number}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">
                          Company Name
                        </Label>
                        <p className="font-medium">
                          {selectedRegistration.company_name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Company Type
                        </Label>
                        <p className="font-medium">
                          {selectedRegistration.company_type}
                        </p>
                      </div>
                    </div>

                    {selectedRegistration.company_registration_number && (
                      <div>
                        <Label className="text-muted-foreground">
                          Registration Number
                        </Label>
                        <p className="font-medium">
                          {selectedRegistration.company_registration_number}
                        </p>
                      </div>
                    )}

                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </Label>
                      <p className="font-medium">
                        {selectedRegistration.company_address}
                        <br />
                        {selectedRegistration.company_city},{" "}
                        {selectedRegistration.company_state} -{" "}
                        {selectedRegistration.company_pincode}
                        <br />
                        {selectedRegistration.company_country}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* GST Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    GST Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label className="text-muted-foreground">GST Number</Label>
                    <p className="font-mono text-lg font-bold">
                      {selectedRegistration.gst_number}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Business Details */}
              {(selectedRegistration.business_description ||
                selectedRegistration.years_in_business ||
                selectedRegistration.expected_monthly_revenue) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Business Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedRegistration.business_description && (
                      <div>
                        <Label className="text-muted-foreground">
                          Business Description
                        </Label>
                        <p className="text-sm">
                          {selectedRegistration.business_description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {selectedRegistration.years_in_business && (
                        <div>
                          <Label className="text-muted-foreground">
                            Years in Business
                          </Label>
                          <p className="font-medium">
                            {selectedRegistration.years_in_business} years
                          </p>
                        </div>
                      )}

                      {selectedRegistration.expected_monthly_revenue && (
                        <div>
                          <Label className="text-muted-foreground">
                            Expected Monthly Revenue
                          </Label>
                          <p className="font-medium">
                            {formatCurrency(
                              selectedRegistration.expected_monthly_revenue
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Links */}
              {(selectedRegistration.portfolio_url ||
                selectedRegistration.linkedin_url ||
                selectedRegistration.website_url) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedRegistration.portfolio_url && (
                      <div className="flex items-center gap-2">
                        <Label className="text-muted-foreground w-24">
                          Portfolio:
                        </Label>
                        <a
                          href={selectedRegistration.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {selectedRegistration.portfolio_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {selectedRegistration.linkedin_url && (
                      <div className="flex items-center gap-2">
                        <Label className="text-muted-foreground w-24">
                          LinkedIn:
                        </Label>
                        <a
                          href={selectedRegistration.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {selectedRegistration.linkedin_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {selectedRegistration.website_url && (
                      <div className="flex items-center gap-2">
                        <Label className="text-muted-foreground w-24">
                          Website:
                        </Label>
                        <a
                          href={selectedRegistration.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {selectedRegistration.website_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Message */}
              {selectedRegistration.message && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Additional Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedRegistration.message}</p>
                  </CardContent>
                </Card>
              )}

              {/* Admin Notes */}
              {selectedRegistration.admin_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Admin Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedRegistration.admin_notes}</p>
                    {selectedRegistration.reviewed_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Reviewed on{" "}
                        {formatDate(selectedRegistration.reviewed_at)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              {selectedRegistration.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setShowDetailDialog(false);
                      setShowApproveDialog(true);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Registration
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setShowDetailDialog(false);
                      setShowRejectDialog(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
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
            <DialogTitle>Approve Seller Registration</DialogTitle>
            <DialogDescription>
              Create seller account for {selectedRegistration?.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
              />
              <p className="text-xs text-muted-foreground">
                This will be the initial password for the seller's account
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
              />
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                <strong>This will create:</strong>
              </p>
              <ul className="text-sm text-blue-900 mt-2 space-y-1 list-disc list-inside">
                <li>Seller account with KYC verified status</li>
                <li>Seller profile with company details</li>
                <li>Company record with GST information</li>
                <li>Wallet and Payout wallet (both with ₹0 balance)</li>
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
            >
              Cancel
            </Button>
            <Button onClick={approveRegistration}>
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
            <DialogTitle>Reject Seller Registration</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedRegistration?.full_name}
              's application
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
              />
              <p className="text-xs text-muted-foreground">
                This reason will be stored in admin notes
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-900">
                <strong>Warning:</strong> This action will mark the application
                as rejected. The applicant will need to submit a new application
                if they want to reapply.
              </p>
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
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={rejectRegistration}>
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