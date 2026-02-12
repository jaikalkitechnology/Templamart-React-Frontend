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
  ArrowLeft,
  Sparkles,
  Target,
  Shield,
  Globe,
  Award,
  TrendingUp,
  Calculator,
  RefreshCw,
  Rocket,
  BadgeCheck,
  Clock,
  Mail,
  Phone,
  MapPin,
  User,
  Store,
  FileUp,
  Lock,
  ChevronRight,
  ChevronLeft,
  Home,
  Users as UsersIcon,
  BarChart3,
  HelpCircle,
  Star,
  Percent,
  ShieldCheck,
  Briefcase,
  Building,
  FileDigit,
  Hash,
  Calendar,
  Link as LinkIcon,
  MessageSquare,
  Loader2,
  IndianRupee,
} from "lucide-react";
import { BASE_URL } from "@/config";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { Link } from "react-router-dom";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/50 p-4">
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

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-1/4 w-60 h-60 bg-cyan-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-6">
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 mb-4">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Join Our Marketplace</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Become a Seller
            </span>
            <br />
            <span className="text-slate-800">Start Your Journey With Us</span>
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join our marketplace and start earning by selling your templates
          </p>
        </div>

        {/* Info Tabs */}
        <Tabs defaultValue="how-it-works" className="mb-8 md:mb-12">
          <TabsList className="w-full h-auto grid grid-cols-3 p-1 bg-white/80 backdrop-blur-sm border">
            <TabsTrigger value="how-it-works" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500">
              <Rocket className="h-4 w-4" />
              <span className="hidden sm:inline">How It Works</span>
              <span className="sm:hidden">Process</span>
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Requirements</span>
              <span className="sm:hidden">Requirements</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">FAQ</span>
              <span className="sm:hidden">FAQ</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="how-it-works" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mb-2">
                        1
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Submit Application</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Fill out the registration form with your company and GST details.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-indigo-50/50">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FileCheck className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold mb-2">
                        2
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Admin Review</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Our team reviews your application within 2-5 business days.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold mb-2">
                        3
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Start Selling</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Once approved, start uploading and selling your templates.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Why sell on TemplaMarT?</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-3">
                      {[
                        "Access to a global marketplace with thousands of potential customers",
                        "Competitive commission rates with up to 92% revenue share",
                        "Secure payment processing and monthly payouts",
                        "Dedicated seller dashboard to track sales and analytics",
                      ].map((item, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="bg-white/80 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-full bg-blue-100">
                          <Percent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-blue-700">92% Revenue Share</h4>
                          <p className="text-sm text-slate-600">Keep most of your earnings</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100">
                          <Globe className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-green-700">Global Reach</h4>
                          <p className="text-sm text-slate-600">Sell to customers worldwide</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requirements" className="mt-6">
            <Card className="border-0 bg-gradient-to-br from-white to-blue-50/50 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Seller Requirements</h3>
                </div>
                
                <p className="text-slate-600 mb-6">
                  To become a seller on TemplaMarT, you need to meet the following requirements:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="group bg-white border rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all">
                    <div className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-4">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">Valid Company Registration</h4>
                    <p className="text-sm text-slate-600">
                      You must have a registered company (Private Limited, LLP, Proprietorship, etc.) with valid registration documents.
                    </p>
                  </div>

                  <div className="group bg-white border rounded-xl p-5 hover:shadow-lg hover:border-indigo-300 transition-all">
                    <div className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white mb-4">
                      <FileSpreadsheet className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">GST Registration (Mandatory)</h4>
                    <p className="text-sm text-slate-600">
                      A valid 15-digit GST number is mandatory for all sellers. Upload your GST certificate during registration.
                    </p>
                  </div>

                  <div className="group bg-white border rounded-xl p-5 hover:shadow-lg hover:border-green-300 transition-all">
                    <div className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white mb-4">
                      <FileCheck className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">Quality Standards</h4>
                    <p className="text-sm text-slate-600">
                      Your templates must be original, high-quality, and meet our technical requirements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="mt-6">
            <Card className="border-0 bg-gradient-to-br from-white to-indigo-50/50 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                    <HelpCircle className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Frequently Asked Questions</h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      question: "Why is GST registration mandatory?",
                      answer: "As per Indian tax regulations, all digital marketplaces must collect GST. Having a valid GST number ensures compliance and enables us to process your payments correctly."
                    },
                    {
                      question: "How long does approval take?",
                      answer: "Our team typically reviews applications within 2-5 business days. You'll receive an email notification once your application is reviewed."
                    },
                    {
                      question: "What documents do I need?",
                      answer: "You'll need your company registration details, GST number, and GST certificate. Additional documents may be requested during verification."
                    },
                    {
                      question: "What is the commission rate?",
                      answer: "Our standard commission is 8%, meaning you keep 92% of each sale. This rate may improve based on your sales volume and tier."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="bg-white/80 border rounded-xl p-5 hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">
                          {index + 1}
                        </span>
                        {faq.question}
                      </h4>
                      <p className="text-slate-600 text-sm pl-8">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Main Registration Form */}
        <Card className="mb-8 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-8">
            {/* Progress Bar - Mobile Responsive */}
            <div className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-center md:text-left">Seller Registration</h2>
              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 -z-10 mx-12 hidden md:block"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 -translate-y-1/2 -z-10 mx-12 hidden md:block transition-all duration-500"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                ></div>

                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      step >= stepNumber 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 border-transparent text-white scale-110' 
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}>
                      {step > stepNumber ? (
                        <CheckCircle className="h-5 w-5 md:h-6 md:w-6" />
                      ) : (
                        <span className="font-semibold text-sm md:text-base">{stepNumber}</span>
                      )}
                    </div>
                    <span className={`text-xs md:text-sm font-medium mt-2 text-center ${step >= stepNumber ? 'text-slate-800' : 'text-slate-500'}`}>
                      {stepNumber === 1 ? 'Personal' : stepNumber === 2 ? 'Company & GST' : 'Verify'}
                    </span>
                    <span className="absolute -top-8 text-xs font-medium text-slate-600 hidden md:block">
                      Step {stepNumber}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Personal Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="full_name" className="flex items-center gap-2 text-slate-700">
                        <User className="h-4 w-4" />
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          required
                          className="pl-10 h-12 border-slate-300 focus:border-blue-500"
                          placeholder="John Doe"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <User className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="username" className="flex items-center gap-2 text-slate-700">
                        <BadgeCheck className="h-4 w-4" />
                        Username <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          className="pl-10 h-12 border-slate-300 focus:border-blue-500"
                          placeholder="johndoe"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <BadgeCheck className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        Letters, numbers, underscores only
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="email" className="flex items-center gap-2 text-slate-700">
                        <Mail className="h-4 w-4" />
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="pl-10 h-12 border-slate-300 focus:border-blue-500"
                          placeholder="you@example.com"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        You'll need to verify this email address
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="phone_number" className="flex items-center gap-2 text-slate-700">
                        <Phone className="h-4 w-4" />
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          required
                          className="pl-10 h-12 border-slate-300 focus:border-blue-500"
                          placeholder="+91 98765 43210"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Phone className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mt-6">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="accept_terms"
                        name="accept_terms"
                        checked={formData.accept_terms}
                        onChange={handleChange}
                        required
                        className="h-5 w-5 mt-1 text-blue-600 rounded"
                      />
                      <Label htmlFor="accept_terms" className="text-slate-700 cursor-pointer">
                        I agree to the{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          className="text-blue-600 font-medium hover:text-blue-800 hover:underline"
                        >
                          Terms & Conditions
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy"
                          target="_blank"
                          className="text-blue-600 font-medium hover:text-blue-800 hover:underline"
                        >
                          Privacy Policy
                        </a>
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                    disabled={!formData.accept_terms}
                  >
                    Continue to Company Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* STEP 2: Company & GST Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
                      <Building className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Company & GST Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="company_name" className="flex items-center gap-2 text-slate-700">
                        <Building2 className="h-4 w-4" />
                        Company Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="company_name"
                          name="company_name"
                          value={formData.company_name}
                          onChange={handleChange}
                          required
                          className="pl-10 h-12 border-slate-300 focus:border-blue-500"
                          placeholder="Your Company Name"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Building2 className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="company_type" className="flex items-center gap-2 text-slate-700">
                        <Briefcase className="h-4 w-4" />
                        Company Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.company_type}
                        onValueChange={(value) =>
                          handleSelectChange("company_type", value)
                        }
                      >
                        <SelectTrigger className="h-12 border-slate-300 focus:border-blue-500">
                          <SelectValue placeholder="Select company type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Private Limited">Private Limited</SelectItem>
                          <SelectItem value="LLP">LLP</SelectItem>
                          <SelectItem value="Partnership">Partnership</SelectItem>
                          <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                          <SelectItem value="Public Limited">Public Limited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="company_registration_number" className="flex items-center gap-2 text-slate-700">
                        <FileDigit className="h-4 w-4" />
                        Company Registration Number
                      </Label>
                      <div className="relative">
                        <Input
                          id="company_registration_number"
                          name="company_registration_number"
                          value={formData.company_registration_number}
                          onChange={handleChange}
                          className="pl-10 h-12 border-slate-300 focus:border-blue-500"
                          placeholder="CIN/LLPIN Number"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <FileDigit className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="gst_number" className="flex items-center gap-2 text-slate-700">
                        <Hash className="h-4 w-4" />
                        GST Number (15 digits) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="gst_number"
                          name="gst_number"
                          value={formData.gst_number}
                          onChange={handleChange}
                          maxLength={15}
                          placeholder="22AAAAA0000A1Z5"
                          required
                          className="pl-10 h-12 border-slate-300 focus:border-blue-500"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Hash className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        Enter your 15-digit GST identification number
                      </p>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <Label htmlFor="gst_certificate" className="flex items-center gap-2 text-slate-700">
                        <FileUp className="h-4 w-4" />
                        Upload GST Certificate (Optional)
                      </Label>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                        <input
                          id="gst_certificate"
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                        />
                        <label htmlFor="gst_certificate" className="cursor-pointer">
                          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                          <p className="text-slate-700 font-medium mb-1">Click to upload GST certificate</p>
                          <p className="text-sm text-slate-500">PDF or image file (max 5MB)</p>
                        </label>
                        {gstFile && (
                          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">{gstFile.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <Label htmlFor="company_address" className="flex items-center gap-2 text-slate-700">
                        <MapPin className="h-4 w-4" />
                        Company Address <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="company_address"
                        name="company_address"
                        value={formData.company_address}
                        onChange={handleChange}
                        rows={3}
                        required
                        className="border-slate-300 focus:border-blue-500"
                        placeholder="Full company address including street, area, etc."
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="company_city" className="text-slate-700">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="company_city"
                        name="company_city"
                        value={formData.company_city}
                        onChange={handleChange}
                        required
                        className="h-12 border-slate-300 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="company_state" className="text-slate-700">
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="company_state"
                        name="company_state"
                        value={formData.company_state}
                        onChange={handleChange}
                        required
                        className="h-12 border-slate-300 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="company_pincode" className="text-slate-700">
                        Pincode <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="company_pincode"
                        name="company_pincode"
                        value={formData.company_pincode}
                        onChange={handleChange}
                        maxLength={6}
                        required
                        className="h-12 border-slate-300 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <Label htmlFor="business_description" className="flex items-center gap-2 text-slate-700">
                        <Store className="h-4 w-4" />
                        Business Description
                      </Label>
                      <Textarea
                        id="business_description"
                        name="business_description"
                        value={formData.business_description}
                        onChange={handleChange}
                        rows={3}
                        className="border-slate-300 focus:border-blue-500"
                        placeholder="Tell us about your business and what you plan to sell"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="years_in_business" className="flex items-center gap-2 text-slate-700">
                        <Calendar className="h-4 w-4" />
                        Years in Business
                      </Label>
                      <div className="relative">
                        <Input
                          id="years_in_business"
                          name="years_in_business"
                          type="number"
                          value={formData.years_in_business}
                          onChange={handleChange}
                          min="0"
                          className="pl-10 h-12 border-slate-300 focus:border-blue-500"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Calendar className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="expected_monthly_revenue" className="flex items-center gap-2 text-slate-700">
                        <TrendingUp className="h-4 w-4" />
                        Expected Monthly Revenue (₹)
                      </Label>
                      <div className="relative">
                        <Input
                          id="expected_monthly_revenue"
                          name="expected_monthly_revenue"
                          type="number"
                          value={formData.expected_monthly_revenue}
                          onChange={handleChange}
                          min="0"
                          className="pl-10 h-12 border-slate-300 focus:border-blue-500"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <IndianRupee className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="portfolio_url" className="flex items-center gap-2 text-slate-700">
                        <LinkIcon className="h-4 w-4" />
                        Portfolio URL
                      </Label>
                      <div className="relative">
                        <Input
                          id="portfolio_url"
                          name="portfolio_url"
                          type="url"
                          value={formData.portfolio_url}
                          onChange={handleChange}
                          className="pl-10 h-12 border-slate-300 focus:border-blue-500"
                          placeholder="https://..."
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <LinkIcon className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="linkedin_url" className="flex items-center gap-2 text-slate-700">
                        <UsersIcon className="h-4 w-4" />
                        LinkedIn URL
                      </Label>
                      <div className="relative">
                        <Input
                          id="linkedin_url"
                          name="linkedin_url"
                          type="url"
                          value={formData.linkedin_url}
                          onChange={handleChange}
                          className="pl-10 h-12 border-slate-300 focus:border-blue-500"
                          placeholder="https://linkedin.com/..."
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <UsersIcon className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="website_url" className="flex items-center gap-2 text-slate-700">
                        <Globe className="h-4 w-4" />
                        Website URL
                      </Label>
                      <div className="relative">
                        <Input
                          id="website_url"
                          name="website_url"
                          type="url"
                          value={formData.website_url}
                          onChange={handleChange}
                          className="pl-10 h-12 border-slate-300 focus:border-blue-500"
                          placeholder="https://..."
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Globe className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <Label htmlFor="message" className="flex items-center gap-2 text-slate-700">
                        <MessageSquare className="h-4 w-4" />
                        Additional Message
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={3}
                        className="border-slate-300 focus:border-blue-500"
                        placeholder="Any additional information you'd like to share"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1 h-12 border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                    >
                      Continue to Verification
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Captcha Verification */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Verification</h3>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-2xl p-6 md:p-8">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white mb-4">
                        <Calculator className="h-6 w-6" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 mb-2">Security Check</h4>
                      <p className="text-slate-600">
                        Please solve this simple math problem to verify you're human
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="inline-block bg-white border-2 border-blue-300 rounded-xl p-6 mb-4">
                          <p className="text-2xl md:text-3xl font-bold text-slate-800">{captchaQuestion}</p>
                        </div>
                        <p className="text-sm text-slate-500">Enter the answer below</p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="captcha_answer" className="text-slate-700">
                          Your Answer
                        </Label>
                        <div className="relative">
                          <Input
                            id="captcha_answer"
                            type="number"
                            value={captchaAnswer}
                            onChange={(e) => setCaptchaAnswer(e.target.value)}
                            placeholder="Enter your answer"
                            required
                            className="pl-10 h-12 border-slate-300 focus:border-blue-500 text-center text-lg"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Calculator className="h-5 w-5 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={loadCaptcha}
                        className="w-full h-12 border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Question
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1 h-12 border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Rocket className="mr-2 h-4 w-4" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: Success */}
              {step === 4 && (
                <div className="space-y-8 text-center py-8">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-50"></div>
                      <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-full">
                        <CheckCircle className="h-16 w-16 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800">Application Submitted!</h3>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto">
                      Thank you for your interest in becoming a seller on TemplaMarT. 
                      Your application has been submitted successfully.
                    </p>
                  </div>

                  <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-0 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-800">What's Next?</h4>
                      </div>
                      
                      <div className="space-y-4">
                        {[
                          {
                            icon: <FileCheck className="h-5 w-5 text-blue-600" />,
                            text: "Our team will review your application within 2-5 business days"
                          },
                          {
                            icon: <Mail className="h-5 w-5 text-indigo-600" />,
                            text: "You'll receive an email notification about your application status"
                          },
                          {
                            icon: <Rocket className="h-5 w-5 text-purple-600" />,
                            text: "Once approved, you can log in and start uploading your templates"
                          }
                        ].map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 p-2 rounded-lg bg-white border">
                              {item.icon}
                            </div>
                            <p className="text-slate-700 text-left">{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-4">
                      <BadgeCheck className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Application ID</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 mb-2">#{registrationId}</p>
                    <p className="text-sm text-slate-500">
                      Keep this ID for reference in any future communications
                    </p>
                  </div>

                  <Button 
                    onClick={() => navigate("/")} 
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Return to Home
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {step < 4 && (
          <div className="text-center py-6">
            <p className="text-slate-600 mb-4">
              Already have a seller account?
            </p>
            <Button 
              variant="outline" 
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              asChild
            >
              <a href="/login" className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Login Here
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BecomeSeller;