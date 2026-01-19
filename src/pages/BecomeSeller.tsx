import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CheckCircle,
  DollarSign,
  FileCheck,
  FileText,
  Package,
  Users,
  Upload,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { BASE_URL } from "@/config";
import { Helmet } from "react-helmet-async";
import axios from "axios";

const BecomeSeller = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<number | null>(null);

  // Captcha state
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaSessionId, setCaptchaSessionId] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  // File upload
  const [gstFile, setGstFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    // Personal Information
    full_name: "",
    email: "",
    phone_number: "",
    username: "",

    // Company Information
    company_name: "",
    company_type: "",
    company_registration_number: "",
    company_address: "",
    company_city: "",
    company_state: "",
    company_pincode: "",
    company_country: "India",

    // GST Information
    gst_number: "",

    // Business Details
    business_description: "",
    years_in_business: "",
    expected_monthly_revenue: "",

    // Additional Information
    portfolio_url: "",
    linkedin_url: "",
    website_url: "",

    // Message
    message: "",

    // Terms
    accept_terms: false,
  });

  // Load captcha on component mount
  useEffect(() => {
    loadCaptcha();
  }, []);

  const loadCaptcha = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/contact-seller/captcha`);
      setCaptchaQuestion(res.data.question);
      setCaptchaSessionId(res.data.session_id);
    } catch (error) {
      console.error("Error loading captcha:", error);
      toast.error("Failed to load captcha");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF and image files are allowed");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      setGstFile(file);
      toast.success("GST certificate selected");
    }
  };

  const validateStep1 = () => {
    const { full_name, email, phone_number, username } = formData;
    if (!full_name || !email || !phone_number || !username) {
      toast.error("Please fill all required personal information fields");
      return false;
    }
    if (!formData.accept_terms) {
      toast.error("Please accept the terms and conditions");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const {
      company_name,
      company_type,
      company_address,
      company_city,
      company_state,
      company_pincode,
      gst_number,
    } = formData;

    if (
      !company_name ||
      !company_type ||
      !company_address ||
      !company_city ||
      !company_state ||
      !company_pincode ||
      !gst_number
    ) {
      toast.error("Please fill all required company and GST information");
      return false;
    }

    // Validate GST number format
    if (gst_number.length !== 15) {
      toast.error("GST number must be 15 characters");
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (!captchaAnswer) {
      toast.error("Please solve the captcha");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep3()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        username: formData.username,
        company_name: formData.company_name,
        company_type: formData.company_type,
        company_registration_number: formData.company_registration_number || null,
        company_address: formData.company_address,
        company_city: formData.company_city,
        company_state: formData.company_state,
        company_pincode: formData.company_pincode,
        company_country: formData.company_country,
        gst_number: formData.gst_number,
        business_description: formData.business_description || null,
        years_in_business: formData.years_in_business
          ? parseInt(formData.years_in_business)
          : null,
        expected_monthly_revenue: formData.expected_monthly_revenue
          ? parseFloat(formData.expected_monthly_revenue)
          : null,
        portfolio_url: formData.portfolio_url || null,
        linkedin_url: formData.linkedin_url || null,
        website_url: formData.website_url || null,
        message: formData.message || null,
        captcha_answer: parseInt(captchaAnswer),
        captcha_session_id: captchaSessionId,
      };

      const response = await axios.post(
        `${BASE_URL}/contact-seller/register`,
        payload
      );

      const regId = response.data.id;
      setRegistrationId(regId);

      // Upload GST certificate if provided
      if (gstFile) {
        const formData = new FormData();
        formData.append("file", gstFile);

        await axios.post(
          `${BASE_URL}/contact-seller/${regId}/upload-gst`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      toast.success(
        "Registration submitted successfully! Our team will review your application."
      );
      setStep(4); // Success step
    } catch (error: any) {
      console.error("Error submitting registration:", error);
      const errorMessage =
        error.response?.data?.detail || "Failed to submit registration";
      toast.error(errorMessage);

      // Reload captcha on error
      loadCaptcha();
      setCaptchaAnswer("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How do I become a seller on Templamart?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Fill out the seller registration form with your company and GST details. Our team will review your application within 2-5 business days.",
                },
              },
              {
                "@type": "Question",
                name: "Is GST registration mandatory?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, all sellers must have a valid GST number to sell on Templamart.",
                },
              },
            ],
          })}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
        <p className="text-muted-foreground mb-8">
          Join our marketplace and start earning by selling your templates
        </p>

        <Tabs defaultValue="how-it-works" className="mb-8">
          <TabsList className="w-full">
            <TabsTrigger value="how-it-works" className="flex-1">
              How It Works
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex-1">
              Requirements
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex-1">
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="how-it-works" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium mb-2">1. Submit Application</h3>
                      <p className="text-sm text-muted-foreground">
                        Fill out the registration form with your company and GST
                        details.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <FileCheck className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium mb-2">2. Admin Review</h3>
                      <p className="text-sm text-muted-foreground">
                        Our team reviews your application within 2-5 business
                        days.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium mb-2">3. Start Selling</h3>
                      <p className="text-sm text-muted-foreground">
                        Once approved, start uploading and selling your templates.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-lg border p-6 bg-accent/20">
                <h3 className="text-lg font-medium mb-2">
                  Why sell on TemplaMarT?
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>
                      Access to a global marketplace with thousands of potential
                      customers
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>
                      Competitive commission rates with up to 92% revenue share
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Secure payment processing and monthly payouts</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>
                      Dedicated seller dashboard to track sales and analytics
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requirements" className="mt-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-medium">Seller Requirements</h3>
                <p>
                  To become a seller on TemplaMarT, you need to meet the
                  following requirements:
                </p>

                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-primary" />
                      Valid Company Registration
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      You must have a registered company (Private Limited, LLP,
                      Proprietorship, etc.) with valid registration documents.
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <FileSpreadsheet className="h-5 w-5 mr-2 text-primary" />
                      GST Registration (Mandatory)
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      A valid 15-digit GST number is mandatory for all sellers.
                      Upload your GST certificate during registration.
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <FileCheck className="h-5 w-5 mr-2 text-primary" />
                      Quality Standards
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Your templates must be original, high-quality, and meet our
                      technical requirements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="mt-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-medium">
                  Frequently Asked Questions
                </h3>

                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h4 className="font-medium mb-2">
                      Why is GST registration mandatory?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      As per Indian tax regulations, all digital marketplaces must
                      collect GST. Having a valid GST number ensures compliance
                      and enables us to process your payments correctly.
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h4 className="font-medium mb-2">
                      How long does approval take?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Our team typically reviews applications within 2-5 business
                      days. You'll receive an email notification once your
                      application is reviewed.
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h4 className="font-medium mb-2">
                      What documents do I need?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      You'll need your company registration details, GST number,
                      and GST certificate. Additional documents may be requested
                      during verification.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      What is the commission rate?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Our standard commission is 8%, meaning you keep 92% of each
                      sale. This rate may improve based on your sales volume and
                      tier.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Seller Registration</h2>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div
                  className={`flex items-center ${
                    step >= 1 ? "text-primary" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                      step >= 1
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    1
                  </div>
                  Personal
                </div>
                <div className="flex-1 h-0.5 bg-muted mx-2"></div>
                <div
                  className={`flex items-center ${
                    step >= 2 ? "text-primary" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                      step >= 2
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    2
                  </div>
                  Company & GST
                </div>
                <div className="flex-1 h-0.5 bg-muted mx-2"></div>
                <div
                  className={`flex items-center ${
                    step >= 3 ? "text-primary" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                      step >= 3
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    3
                  </div>
                  Verify
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">
                        Username <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="accept_terms"
                      name="accept_terms"
                      checked={formData.accept_terms}
                      onChange={handleChange}
                      required
                    />
                    <Label htmlFor="accept_terms">
                      I agree to the{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        className="text-primary underline"
                      >
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        className="text-primary underline"
                      >
                        Privacy Policy
                      </a>
                    </Label>
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full"
                    disabled={!formData.accept_terms}
                  >
                    Continue to Company Details
                  </Button>
                </div>
              )}

              {/* STEP 2: Company & GST Information */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Company & GST Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">
                        Company Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_type">
                        Company Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.company_type}
                        onValueChange={(value) =>
                          handleSelectChange("company_type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Private Limited">
                            Private Limited
                          </SelectItem>
                          <SelectItem value="LLP">LLP</SelectItem>
                          <SelectItem value="Partnership">Partnership</SelectItem>
                          <SelectItem value="Proprietorship">
                            Proprietorship
                          </SelectItem>
                          <SelectItem value="Public Limited">
                            Public Limited
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_registration_number">
                      Company Registration Number
                    </Label>
                    <Input
                      id="company_registration_number"
                      name="company_registration_number"
                      value={formData.company_registration_number}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gst_number">
                      GST Number (15 digits) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="gst_number"
                      name="gst_number"
                      value={formData.gst_number}
                      onChange={handleChange}
                      maxLength={15}
                      placeholder="22AAAAA0000A1Z5"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your 15-digit GST identification number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gst_certificate">
                      Upload GST Certificate (Optional)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="gst_certificate"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      {gstFile && (
                        <span className="text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          {gstFile.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PDF or image file (max 5MB)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_address">
                      Company Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="company_address"
                      name="company_address"
                      value={formData.company_address}
                      onChange={handleChange}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_city">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="company_city"
                        name="company_city"
                        value={formData.company_city}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_state">
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="company_state"
                        name="company_state"
                        value={formData.company_state}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_pincode">
                        Pincode <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="company_pincode"
                        name="company_pincode"
                        value={formData.company_pincode}
                        onChange={handleChange}
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_description">
                      Business Description
                    </Label>
                    <Textarea
                      id="business_description"
                      name="business_description"
                      value={formData.business_description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Tell us about your business and what you plan to sell"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="years_in_business">Years in Business</Label>
                      <Input
                        id="years_in_business"
                        name="years_in_business"
                        type="number"
                        value={formData.years_in_business}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expected_monthly_revenue">
                        Expected Monthly Revenue (₹)
                      </Label>
                      <Input
                        id="expected_monthly_revenue"
                        name="expected_monthly_revenue"
                        type="number"
                        value={formData.expected_monthly_revenue}
                        onChange={handleChange}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="portfolio_url">Portfolio URL</Label>
                      <Input
                        id="portfolio_url"
                        name="portfolio_url"
                        type="url"
                        value={formData.portfolio_url}
                        onChange={handleChange}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                      <Input
                        id="linkedin_url"
                        name="linkedin_url"
                        type="url"
                        value={formData.linkedin_url}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website_url">Website URL</Label>
                      <Input
                        id="website_url"
                        name="website_url"
                        type="url"
                        value={formData.website_url}
                        onChange={handleChange}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Any additional information you'd like to share"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex-1"
                    >
                      Continue to Verification
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Captcha Verification */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Verification</h3>

                  <div className="rounded-lg border p-6 bg-accent/20">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="captcha_answer" className="text-lg">
                          {captchaQuestion}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Please solve this simple math problem to verify you're
                          human
                        </p>
                      </div>

                      <Input
                        id="captcha_answer"
                        type="number"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder="Enter your answer"
                        required
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={loadCaptcha}
                      >
                        Refresh Question
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: Success */}
              {step === 4 && (
                <div className="space-y-4 text-center py-8">
                  <div className="flex justify-center">
                    <div className="bg-green-100 p-4 rounded-full">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold">Application Submitted!</h3>

                  <p className="text-muted-foreground">
                    Thank you for your interest in becoming a seller on
                    TemplaMarT. Your application has been submitted successfully.
                  </p>

                  <div className="rounded-lg border p-4 bg-accent/20 text-left">
                    <h4 className="font-medium mb-2">What's Next?</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                        <span>
                          Our team will review your application within 2-5
                          business days
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                        <span>
                          You'll receive an email notification about your
                          application status
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                        <span>
                          Once approved, you can log in and start uploading your
                          templates
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Application ID: <strong>#{registrationId}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Keep this ID for reference
                    </p>
                  </div>

                  <Button onClick={() => navigate("/")} className="mt-4">
                    Return to Home
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {step < 4 && (
          <div className="text-center">
            <p className="text-muted-foreground">
              Already have a seller account?{" "}
              <Button variant="link" className="p-0" asChild>
                <a href="/login">Login Here</a>
              </Button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BecomeSeller;