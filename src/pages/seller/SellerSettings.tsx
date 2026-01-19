// seller/settings.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { BASE_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  DollarSign,
  Info,
  Loader2,
  Eye,
  EyeOff,
  User,
  Bell,
  Shield,
  Percent,
  Globe,
  Twitter,
  Linkedin,
  Palette,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Save,
  Key,
  Mail,
  ShoppingCart,
  Star
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
interface SellerProfile {
  id: number;
  user_id: number;
  display_name: string;
  bio: string;
  website_url: string;
  twitter_url: string;
  dribbble_url: string;
  behance_url: string;
  linkedin_url: string;
  commission_rate: number;
  seller_rate: number;
  total_sales: number;
  commission_tier: string;
  email_notifications: boolean;
  marketing_emails: boolean;
  sale_notifications: boolean;
  review_notifications: boolean;
}

interface CommissionInfo {
  current_tier: {
    tier: string;
    platform_rate: number;
    seller_rate: number;
    next_tier: string | null;
  };
  total_sales: number;
  commission_rate: number;
  seller_rate: number;
  tiers: Array<{
    name: string;
    min_sales: number;
    platform_rate: number;
    seller_rate: number;
  }>;
}

const SellerSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile state
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [commissionInfo, setCommissionInfo] = useState<CommissionInfo | null>(null);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    display_name: "",
    bio: "",
    website_url: "",
    twitter_url: "",
    dribbble_url: "",
    behance_url: "",
    linkedin_url: "",
  });
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    marketing_emails: true,
    sale_notifications: true,
    review_notifications: true,
  });

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
    fetchCommissionInfo();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/seller/seller_profile`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      
      setProfile(res.data);
      setProfileForm({
        display_name: res.data.display_name || "",
        bio: res.data.bio || "",
        website_url: res.data.website_url || "",
        twitter_url: res.data.twitter_url || "",
        dribbble_url: res.data.dribbble_url || "",
        behance_url: res.data.behance_url || "",
        linkedin_url: res.data.linkedin_url || "",
      });
      setNotifications({
        email_notifications: res.data.email_notifications,
        marketing_emails: res.data.marketing_emails,
        sale_notifications: res.data.sale_notifications,
        review_notifications: res.data.review_notifications,
      });
    } catch (error) {
      console.error("Fetch profile error:", error);
      toast.error("Failed to load profile");
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchCommissionInfo = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/dash/seller/seller_commission`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setCommissionInfo(res.data);
    } catch (error) {
      console.error("Fetch commission error:", error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.put(
        `${BASE_URL}/dash/seller/seller_profile`,
        profileForm,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setProfile(res.data);
      toast.success("Profile updated successfully", {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update profile", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.put(
        `${BASE_URL}/dash/seller/seller_notifications`,
        notifications,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setProfile(res.data);
      toast.success("Notification settings updated", {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update settings", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords do not match", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
      return;
    }

    if (passwordForm.new_password.length < 8) {
      toast.error("Password must be at least 8 characters long", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/dash/seller/seller_change-password`,
        passwordForm,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      toast.success("Password changed successfully", {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to change password", {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case "bronze":
        return "bg-amber-800 text-amber-50";
      case "silver":
        return "bg-gray-300 text-gray-800";
      case "gold":
        return "bg-yellow-500 text-yellow-900";
      case "platinum":
        return "bg-blue-300 text-blue-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
        <p className="mt-6 text-lg text-muted-foreground animate-pulse">
          Loading your settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Account Settings
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Manage your profile, earnings, and preferences
            </p>
          </div>
        </div>
        <Separator />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Navigation */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="sticky top-6 border-border/40 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <nav className="space-y-1">
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => setActiveTab("profile")}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
                <Button
                  variant={activeTab === "commission" ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => setActiveTab("commission")}
                >
                  <Percent className="h-4 w-4" />
                  Commission
                </Button>
                <Button
                  variant={activeTab === "notifications" ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </Button>
                <Button
                  variant={activeTab === "security" ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => setActiveTab("security")}
                >
                  <Shield className="h-4 w-4" />
                  Security
                </Button>
              </nav>
              
              {/* Stats Summary */}
              {commissionInfo && (
                <div className="mt-8 pt-6 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Tier</span>
                    <Badge className={getTierColor(commissionInfo.current_tier.tier)}>
                      {commissionInfo.current_tier.tier}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Earnings</span>
                      <span className="font-semibold text-green-600">
                        <CurrencyRupeeIcon className="h-4 w-4 text-green-600" /> {((commissionInfo.total_sales * commissionInfo.seller_rate) / 100).toFixed(2)}
                      </span>
                    </div>
                    <Progress 
                      value={(commissionInfo.total_sales / (commissionInfo.tiers[commissionInfo.tiers.length - 1]?.min_sales || 10000)) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      <CurrencyRupeeIcon className="h-4 w-4 text-red-500" /> {commissionInfo.total_sales.toLocaleString()} of <CurrencyRupeeIcon className="h-4 w-4 text-red-500" /> {commissionInfo.tiers[commissionInfo.tiers.length - 1]?.min_sales.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <Card className="border-border/40 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Profile Information</CardTitle>
                      <CardDescription>
                        Customize how you appear to customers
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="display_name" className="text-sm font-medium">
                        Display Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="display_name"
                          placeholder="Your name or studio name"
                          value={profileForm.display_name}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, display_name: e.target.value })
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="website_url" className="text-sm font-medium">
                        Website URL
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="website_url"
                          placeholder="https://your-website.com"
                          value={profileForm.website_url}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, website_url: e.target.value })
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="bio" className="text-sm font-medium">
                      Bio
                    </Label>
                    <div className="relative">
                      <textarea
                        id="bio"
                        className="w-full min-h-32 rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder:text-muted-foreground resize-none"
                        placeholder="Tell potential customers about yourself, your expertise, and what inspires your work..."
                        value={profileForm.bio}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, bio: e.target.value })
                        }
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                        {profileForm.bio.length}/500
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Social Profiles</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                        <Input
                          placeholder="Twitter URL"
                          value={profileForm.twitter_url}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, twitter_url: e.target.value })
                          }
                          className="pl-10"
                        />
                      </div>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
                        <Input
                          placeholder="LinkedIn URL"
                          value={profileForm.linkedin_url}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, linkedin_url: e.target.value })
                          }
                          className="pl-10"
                        />
                      </div>
                      <div className="relative">
                        <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-500" />
                        <Input
                          placeholder="Dribbble URL"
                          value={profileForm.dribbble_url}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, dribbble_url: e.target.value })
                          }
                          className="pl-10"
                        />
                      </div>
                      <div className="relative">
                        <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                        <Input
                          placeholder="Behance URL"
                          value={profileForm.behance_url}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, behance_url: e.target.value })
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={loading}
                    className="gap-2 px-6"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Profile
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Commission Tab */}
          {activeTab === "commission" && commissionInfo && (
            <div className="space-y-6">
              <Card className="border-border/40 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Percent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Commission Dashboard</CardTitle>
                        <CardDescription>
                          Track your earnings and commission structure
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={getTierColor(commissionInfo.current_tier.tier)}>
                      {commissionInfo.current_tier.tier} Tier
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-6">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-primary/5 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Your Rate</p>
                          <p className="text-3xl font-bold mt-2 text-green-600">
                            {commissionInfo.seller_rate}%
                          </p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Earnings per sale
                      </p>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-blue-500/5 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                          <p className="text-3xl font-bold mt-2">
                            <CurrencyRupeeIcon className="h-6 w-6 text-blue-600" /> {commissionInfo.total_sales.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <CurrencyRupeeIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Lifetime revenue
                      </p>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-amber-500/5 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Your Earnings</p>
                          <p className="text-3xl font-bold mt-2 text-amber-600">
                            <CurrencyRupeeIcon className="h-6 w-6 text-amber-600" /> {((commissionInfo.total_sales * commissionInfo.seller_rate) / 100).toFixed(2)}
                          </p>
                        </div>
                        <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                          <CurrencyRupeeIcon className="h-6 w-6 text-amber-600" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Total earned
                      </p>
                    </div>
                  </div>

                  {/* Commission Example */}
                  <div className="rounded-xl border p-6 bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="flex items-center gap-3 mb-4">
                      <Info className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Example Sale Breakdown</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
                        <span className="font-medium">Template Price</span>
                        < span className="font-bold"><CurrencyRupeeIcon className="h-4 w-4 text-green-600" />50.00</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                            <span>Platform Fee ({commissionInfo.commission_rate}%)</span>
                          </div>
                          <span className="font-medium text-red-500">
                            - <CurrencyRupeeIcon className="h-4 w-4 text-red-500" /> {((50 * commissionInfo.commission_rate) / 100).toFixed(2)}
                          </span>
                        </div>
                        <Progress value={commissionInfo.commission_rate} className="h-2 bg-red-100" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span>Your Earnings ({commissionInfo.seller_rate}%)</span>
                          </div>
                          <span className="font-bold text-green-600">
                            <CurrencyRupeeIcon className="h-4 w-4 text-green-600" /> {((50 * commissionInfo.seller_rate) / 100).toFixed(2)}
                          </span>
                        </div>
                        <Progress value={commissionInfo.seller_rate} className="h-2 bg-green-100" />
                      </div>
                    </div>
                  </div>

                  {/* Commission Tiers */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Commission Tiers</h3>
                      <Badge variant="outline" className="gap-2">
                        <TrendingUp className="h-3 w-3" />
                        Higher tiers = better rates
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {commissionInfo.tiers.map((tier, index) => {
                        const isCurrent = tier.name.toLowerCase() === commissionInfo.current_tier.tier;
                        const isNext = commissionInfo.current_tier.next_tier === tier.name;
                        
                        return (
                          <div
                            key={tier.name}
                            className={`relative p-4 rounded-xl border transition-all hover:shadow-md ${
                              isCurrent
                                ? "border-primary bg-gradient-to-r from-primary/10 to-primary/5"
                                : "border-border/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  isCurrent ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}>
                                  <span className="font-bold">{index + 1}</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{tier.name}</span>
                                    {isCurrent && (
                                      <Badge className="bg-primary">Current</Badge>
                                    )}
                                    {isNext && (
                                      <Badge variant="outline" className="border-green-500 text-green-600">
                                        Next Goal
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Minimum sales: <CurrencyRupeeIcon className="h-4 w-4 text-red-500" /> {tier.min_sales.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">
                                  {tier.seller_rate}%
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Your rate
                                </p>
                              </div>
                            </div>
                            
                            {isNext && commissionInfo && (
                              <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-200 dark:border-green-900/30">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                    Progress to next tier
                                  </span>
                                  <span className="text-sm font-medium">
                                    {((commissionInfo.total_sales / tier.min_sales) * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={(commissionInfo.total_sales / tier.min_sales) * 100} 
                                  className="h-2 mt-2 bg-green-100"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                  Need <CurrencyRupeeIcon className="h-4 w-4 text-red-500" /> {(tier.min_sales - commissionInfo.total_sales).toLocaleString()} more
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <Card className="border-border/40 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Notification Preferences</CardTitle>
                      <CardDescription>
                        Control how and when we communicate with you
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl border transition-all ${
                      notifications.email_notifications ? "border-primary/30 bg-primary/5" : "border-border/50"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            notifications.email_notifications ? "bg-primary/10" : "bg-muted"
                          }`}>
                            <Mail className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <Label htmlFor="email_notifications" className="font-medium cursor-pointer">
                              Email Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Receive important account updates and security alerts
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="email_notifications"
                          checked={notifications.email_notifications}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, email_notifications: checked })
                          }
                        />
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border transition-all ${
                      notifications.sale_notifications ? "border-green-500/30 bg-green-500/5" : "border-border/50"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            notifications.sale_notifications ? "bg-green-500/10" : "bg-muted"
                          }`}>
                            <ShoppingCart className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <Label htmlFor="sale_notifications" className="font-medium cursor-pointer">
                              Sale Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Get instant alerts when customers purchase your templates
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="sale_notifications"
                          checked={notifications.sale_notifications}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, sale_notifications: checked })
                          }
                          className="data-[state=checked]:bg-green-600"
                        />
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border transition-all ${
                      notifications.review_notifications ? "border-amber-500/30 bg-amber-500/5" : "border-border/50"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            notifications.review_notifications ? "bg-amber-500/10" : "bg-muted"
                          }`}>
                            <Star className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <Label htmlFor="review_notifications" className="font-medium cursor-pointer">
                              Review Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Stay updated with customer feedback and ratings
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="review_notifications"
                          checked={notifications.review_notifications}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, review_notifications: checked })
                          }
                          className="data-[state=checked]:bg-amber-600"
                        />
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border transition-all ${
                      notifications.marketing_emails ? "border-blue-500/30 bg-blue-500/5" : "border-border/50"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            notifications.marketing_emails ? "bg-blue-500/10" : "bg-muted"
                          }`}>
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <Label htmlFor="marketing_emails" className="font-medium cursor-pointer">
                              Marketing Emails
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Receive tips, promotions, and platform updates
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="marketing_emails"
                          checked={notifications.marketing_emails}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, marketing_emails: checked })
                          }
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button 
                    onClick={handleSaveNotifications} 
                    disabled={loading}
                    className="gap-2 px-6"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <Card className="border-border/40 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Security Settings</CardTitle>
                      <CardDescription>
                        Manage your password and account security
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl border bg-gradient-to-r from-primary/5 to-primary/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Key className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">Change Password</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current_password" className="text-sm font-medium">
                            Current Password
                          </Label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="current_password"
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordForm.current_password}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  current_password: e.target.value,
                                })
                              }
                              className="pl-10 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() =>
                                setShowPasswords({
                                  ...showPasswords,
                                  current: !showPasswords.current,
                                })
                              }
                            >
                              {showPasswords.current ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new_password" className="text-sm font-medium">
                              New Password
                            </Label>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="new_password"
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordForm.new_password}
                                onChange={(e) =>
                                  setPasswordForm({
                                    ...passwordForm,
                                    new_password: e.target.value,
                                  })
                                }
                                className="pl-10 pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() =>
                                  setShowPasswords({
                                    ...showPasswords,
                                    new: !showPasswords.new,
                                  })
                                }
                              >
                                {showPasswords.new ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirm_password" className="text-sm font-medium">
                              Confirm Password
                            </Label>
                            <div className="relative">
                              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="confirm_password"
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordForm.confirm_password}
                                onChange={(e) =>
                                  setPasswordForm({
                                    ...passwordForm,
                                    confirm_password: e.target.value,
                                  })
                                }
                                className="pl-10 pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() =>
                                  setShowPasswords({
                                    ...showPasswords,
                                    confirm: !showPasswords.confirm,
                                  })
                                }
                              >
                                {showPasswords.confirm ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Password Strength Indicator */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">Password Strength</span>
                            <span className={`text-xs font-medium ${
                              passwordForm.new_password.length >= 8 
                                ? "text-green-600" 
                                : "text-muted-foreground"
                            }`}>
                              {passwordForm.new_password.length >= 8 ? "Strong" : "Weak"}
                            </span>
                          </div>
                          <Progress 
                            value={Math.min((passwordForm.new_password.length / 8) * 100, 100)} 
                            className={`h-1 ${
                              passwordForm.new_password.length >= 8 
                                ? "bg-green-500" 
                                : "bg-red-500"
                            }`}
                          />
                          <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                            <li className={`flex items-center gap-2 ${
                              passwordForm.new_password.length >= 8 ? "text-green-600" : ""
                            }`}>
                              {passwordForm.new_password.length >= 8 ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                              )}
                              At least 8 characters
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                              Include numbers and special characters
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={loading}
                    className="gap-2 px-6"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4" />
                    )}
                    Update Password
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerSettings;