import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Package, Receipt, Settings, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { BASE_URL } from "@/config";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const UserAccount = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [prefs, setPrefs] = useState({
    marketing_emails: true,
    update_emails: true,
  });

  // Wait for auth to load, then redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please login to access your account");
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch user profile once auth is ready
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.token) {
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoadingData(true);
        const response = await fetch(`${BASE_URL}/users/user/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        setUserData(data);
        setFormData({
          full_name: data.full_name || "",
          email: data.email || "",
        });
      } catch (error) {
        console.error(error);
        toast.error("Error fetching user profile");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProfile();
  }, [authLoading, isAuthenticated, user?.token]);

  // Fetch purchase history
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.token) {
      return;
    }

    axios
      .get(`${BASE_URL}/users/user/purchase-history`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then((res) => setPurchaseHistory(res.data || []))
      .catch((err) => {
        console.error(err);
        // Don't show error for purchase history, might be empty
      });
  }, [authLoading, isAuthenticated, user?.token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!user?.token) {
      toast.error("Not authenticated");
      return;
    }

    try {
      await axios.put(
        `${BASE_URL}/users/user/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!user?.token) {
      toast.error("Not authenticated");
      return;
    }

    if (form.new_password !== form.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.new_password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/users/user/password-update`,
        form,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      toast.success("Password updated successfully!");
      setForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error updating password");
    }
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrefs({ ...prefs, [e.target.id]: e.target.checked });
  };

  const savePrefs = async () => {
    if (!user?.token) {
      toast.error("Not authenticated");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/users/user/email-preferences`,
        prefs,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      toast.success("Preferences saved!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error updating preferences");
    }
  };

  const downloadInvoice = (orderId: string) => {
    toast.success(`Downloading invoice for order ${orderId}`, {
      description: "Your invoice will be downloaded shortly.",
    });
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
          <div className="space-y-4 mt-8">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Show loading while fetching user data
  if (isLoadingData) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-bold mb-2">Loading Profile</h2>
            <p className="text-muted-foreground">
              Please wait while we fetch your data...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no user data after loading, show error
  if (!userData && !isLoadingData) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Unable to Load Profile</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading your profile data.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-8 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">My Account</h1>
      <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
        Manage your profile, view purchase history, and download templates
      </p>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4 md:mb-6 grid grid-cols-2 md:grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="profile" className="text-xs md:text-sm">
            <User className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Profile</span>
            <span className="sm:hidden">Info</span>
          </TabsTrigger>
          <TabsTrigger value="purchases" className="text-xs md:text-sm">
            <Package className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Purchases</span>
            <span className="sm:hidden">Buy</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="text-xs md:text-sm">
            <Receipt className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Invoices</span>
            <span className="sm:hidden">Bills</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs md:text-sm">
            <Settings className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Profile Information</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                View and update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-20 w-20 md:h-24 md:w-24">
                    <AvatarImage src={userData?.avatar} alt={userData?.full_name} />
                    <AvatarFallback className="text-lg md:text-xl">
                      {userData?.full_name?.charAt(0) || user?.username?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="text-xs md:text-sm">
                    Change Avatar
                  </Button>
                </div>

                <div className="flex-1 space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-sm md:text-base">Full Name</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className="h-10 md:h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm md:text-base">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="h-10 md:h-11"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleSaveProfile} className="text-sm md:text-base">
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              full_name: userData?.full_name || "",
                              email: userData?.email || "",
                            });
                          }}
                          className="text-sm md:text-base"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="font-medium text-sm md:text-base">Full Name</p>
                        <p className="text-sm md:text-base text-muted-foreground">
                          {userData?.full_name || user?.username || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-sm md:text-base">Email Address</p>
                        <p className="text-sm md:text-base text-muted-foreground">
                          {userData?.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-sm md:text-base">Member Since</p>
                        <p className="text-sm md:text-base text-muted-foreground">
                          {userData?.created_at || "N/A"}
                        </p>
                      </div>
                      <Button onClick={() => setIsEditing(true)} className="text-sm md:text-base">
                        Edit Profile
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Purchase History</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                View and download your purchased templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {purchaseHistory.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {purchaseHistory.map((purchase: any) => (
                    <div
                      key={purchase.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border rounded-lg gap-3"
                    >
                      <div>
                        <h3 className="font-medium text-sm md:text-base">{purchase.template}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Purchased on: {purchase.date}
                        </p>
                        <p className="text-xs md:text-sm font-medium">
                          ${purchase.price?.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild 
                          className="flex-1 sm:flex-none text-xs md:text-sm"
                        >
                          <a href={`/template/${purchase.templateId}`}>View</a>
                        </Button>
                        <Button size="sm" className="flex-1 sm:flex-none text-xs md:text-sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12">
                  <Package className="h-12 w-12 md:h-16 md:w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    You haven&apos;t purchased any templates yet.
                  </p>
                  <Button className="text-sm md:text-base" asChild>
                    <a href="/templates">Browse Templates</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Invoices</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Access and download invoices for your purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {purchaseHistory.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {purchaseHistory.map((purchase: any) => (
                    <div
                      key={purchase.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border rounded-lg gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground flex-shrink-0" />
                        <div>
                          <h3 className="font-medium text-sm md:text-base">
                            Invoice #{purchase.id}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {purchase.date} • ${purchase.price?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadInvoice(purchase.id)}
                        className="w-full sm:w-auto text-xs md:text-sm"
                      >
                        Download PDF
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12">
                  <Receipt className="h-12 w-12 md:h-16 md:w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm md:text-base text-muted-foreground">
                    No invoices available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Account Settings</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Manage your account preferences and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm md:text-base">Change Password</Label>
                <div className="grid gap-3">
                  <Input
                    id="current_password"
                    type="password"
                    value={form.current_password}
                    onChange={handleChange}
                    placeholder="Current password"
                    className="h-10 md:h-11 text-sm md:text-base"
                  />
                  <Input
                    id="new_password"
                    type="password"
                    value={form.new_password}
                    onChange={handleChange}
                    placeholder="New password"
                    className="h-10 md:h-11 text-sm md:text-base"
                  />
                  <Input
                    id="confirm_password"
                    type="password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    className="h-10 md:h-11 text-sm md:text-base"
                  />
                </div>
                <Button className="mt-2 text-sm md:text-base" onClick={handleSubmit}>
                  Update Password
                </Button>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-medium text-sm md:text-base">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketing_emails" className="text-sm md:text-base">
                      Marketing emails
                    </Label>
                    <input
                      type="checkbox"
                      id="marketing_emails"
                      className="h-4 w-4 md:h-5 md:w-5 rounded border-gray-300 cursor-pointer"
                      checked={prefs.marketing_emails}
                      onChange={handleToggle}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="update_emails" className="text-sm md:text-base">
                      Product updates
                    </Label>
                    <input
                      type="checkbox"
                      id="update_emails"
                      className="h-4 w-4 md:h-5 md:w-5 rounded border-gray-300 cursor-pointer"
                      checked={prefs.update_emails}
                      onChange={handleToggle}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto text-sm md:text-base"
                onClick={() => {
                  setForm({ current_password: "", new_password: "", confirm_password: "" });
                  setPrefs({ marketing_emails: true, update_emails: true });
                }}
              >
                Reset
              </Button>
              <Button onClick={savePrefs} className="w-full sm:w-auto text-sm md:text-base">
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserAccount;