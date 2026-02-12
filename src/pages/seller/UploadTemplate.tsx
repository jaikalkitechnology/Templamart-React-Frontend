// seller/upload-template.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { BASE_URL } from "@/config";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  FileArchive,
  AlertCircle,
  CheckCircle,
  Package,
  Sparkles,
  Zap,
  Shield,
  Globe,
  DollarSign,
  Tag,
  User,
  FileCode,
  Layout,
  Palette,
  Clock,
  Rocket,
  Eye,
  Download,
  Info,
  Check,
  Cloud,
  Layers,
  Code,
  Cpu,
  FileText,
  Key,
  Box
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
interface Category {
  name: string;
  slug: string;
}



const UploadTemplate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  // Form state
  const [productData, setProductData] = useState({
    product_name: "",
    title: "",
    description: "",
    category_name: "",
    product_price: "",
    author: "",
    tags: "",
    licenseType: "standard",
    technology: "HTML",
    file_size: "NA",
    featured: false,
    responsive: true,
    documentation: true,
    support: true,
    updates: false,
  });

  // File state
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

const fetchCategories = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/dash/seller/products/cat-categories/list`,
      {
        headers: { Authorization: `Bearer ${user?.token}` },
      }
    );

    if (res.data && Array.isArray(res.data.categories)) {
      setCategories(res.data.categories);
    } else {
      setCategories([]);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    setCategories([]);
  }
};


  useEffect(() => {
    fetchCategories();
  }, []);

  const licenseTypes = [
    { value: "standard", label: "Standard License", description: "Single project use" },
    { value: "extended", label: "Extended License", description: "Multiple projects" },
    { value: "single", label: "Single Use", description: "One-time use only" },
    { value: "multiple", label: "Multiple Use", description: "Multiple clients" },
    { value: "unlimited", label: "Unlimited License", description: "Unrestricted use" },
  ];

  const technologies = [
    { value: "HTML", icon: <FileCode className="h-4 w-4" /> },
    { value: "React", icon: <Zap className="h-4 w-4" /> },
    { value: "Vue.js", icon: <Code className="h-4 w-4" /> },
    { value: "Angular", icon: <Layers className="h-4 w-4" /> },
    { value: "WordPress", icon: <Globe className="h-4 w-4" /> },
    { value: "Shopify", icon: <ShoppingBag className="h-4 w-4" /> },
    { value: "Webflow", icon: <Layout className="h-4 w-4" /> },
    { value: "Figma", icon: <PenTool className="h-4 w-4" /> },
  ];

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/zip" && !file.name.endsWith(".zip")) {
        setUploadError("Please upload a ZIP file");
        toast.error("Invalid file type. Please upload a ZIP file.");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setUploadError("Template file size must be less than 100MB");
        toast.error("File too large. Maximum size is 100MB.");
        return;
      }
      setTemplateFile(file);
      setProductData(prev => ({
        ...prev,
        file_size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      }));
      setUploadError(null);
      toast.success("Template file added successfully!");
    }
  };

  const handlePreviewUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/zip" && !file.name.endsWith(".zip")) {
        setUploadError("Please upload a ZIP file for preview");
        toast.error("Invalid file type. Please upload a ZIP file.");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setUploadError("Preview file size must be less than 100MB");
        toast.error("File too large. Maximum size is 100MB.");
        return;
      }
      setPreviewFile(file);
      setUploadError(null);
      toast.success("Preview file added successfully!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadError(null);
    setUploadSuccess(false);

    if (!templateFile) {
      setUploadError("Please upload the template file (full React project ZIP)");
      toast.error("Template file is required");
      setLoading(false);
      return;
    }

    if (!previewFile) {
      setUploadError("Please upload the preview file (dist + preview-meta.json ZIP)");
      toast.error("Preview file is required");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      
      formData.append("product_data", JSON.stringify(productData));
      formData.append("template_file", templateFile);
      formData.append("preview_file", previewFile);

      const res = await axios.post(`${BASE_URL}/dash/seller/products`, formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        },
      });

      setUploadSuccess(true);
      toast.success("Template uploaded successfully! Redirecting...");
      
      setTimeout(() => {
        navigate("/seller/templates");
      }, 2000);

    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMsg = error.response?.data?.detail || 
        error.response?.data?.message || 
        "Failed to upload template. Please try again.";
      setUploadError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setProductData(prev => ({ ...prev, [name]: checked }));
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: <Info className="h-4 w-4" /> },
    { number: 2, title: "Upload Files", icon: <Upload className="h-4 w-4" /> },
    { number: 3, title: "Review", icon: <Eye className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Upload New Template
              </h1>
              <p className="text-gray-600 mt-2">
                Share your amazing template with thousands of developers
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/seller/templates")}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-8">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2"></div>
            <div className="relative flex justify-between">
              {steps.map((step) => (
                <div key={step.number} className="relative z-10">
                  <div className={`flex flex-col items-center ${activeStep >= step.number ? 'text-purple-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${activeStep >= step.number ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-300'}`}>
                      {activeStep > step.number ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <span className="mt-2 text-sm font-medium">{step.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Info Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Template Information</CardTitle>
                    <CardDescription>
                      Fill in the details about your template
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="basic" className="space-y-6">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="basic" className="gap-2">
                      <Info className="h-4 w-4" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="technical" className="gap-2">
                      <Code className="h-4 w-4" />
                      Technical
                    </TabsTrigger>
                    <TabsTrigger value="features" className="gap-2">
                      <Zap className="h-4 w-4" />
                      Features
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <div className="grid gap-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="product_name" className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Template Name *
                          </Label>
                          <Input
                            id="product_name"
                            name="product_name"
                            placeholder="e.g., Modern Dashboard Pro"
                            value={productData.product_name}
                            onChange={handleInputChange}
                            className="h-12"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category_name" className="flex items-center gap-2">
                            <Layout className="h-4 w-4" />
                            Category *
                          </Label>
                          <Select
                            value={productData.category_name}
                            onValueChange={(value) =>
                              handleSelectChange("category_name", value)
                            }
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories && categories.length > 0 && categories.map((category) => (
                        <SelectItem key={category?.name} value={category?.slug}>
                          {category?.name}
                        </SelectItem>
                      ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Short Title *
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="Brief title for display cards"
                          value={productData.title}
                          onChange={handleInputChange}
                          className="h-12"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="flex items-center gap-2">
                          <PenTool className="h-4 w-4" />
                          Description *
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Describe your template in detail. Include key features, use cases, and what makes your template unique..."
                          rows={6}
                          value={productData.description}
                          onChange={handleInputChange}
                          className="resize-none"
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="product_price" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Price (₹) *
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              ₹
                            </span>
                            <Input
                              id="product_price"
                              name="product_price"
                              type="number"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              value={productData.product_price}
                              onChange={handleInputChange}
                              className="h-12 pl-8"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="author" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Author *
                          </Label>
                          <Input
                            id="author"
                            name="author"
                            placeholder="Your name or company"
                            value={productData.author}
                            onChange={handleInputChange}
                            className="h-12"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tags" className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Tags
                          </Label>
                          <Input
                            id="tags"
                            name="tags"
                            placeholder="dashboard, admin, responsive, modern"
                            value={productData.tags}
                            onChange={handleInputChange}
                            className="h-12"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          License Type *
                        </Label>
                        <Select
                          value={productData.licenseType}
                          onValueChange={(value) =>
                            handleSelectChange("licenseType", value)
                          }
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select license" />
                          </SelectTrigger>
                          <SelectContent>
                            {licenseTypes.map((license) => (
                              <SelectItem key={license.value} value={license.value}>
                                <div className="space-y-1">
                                  <div className="font-medium">{license.label}</div>
                                  <div className="text-xs text-gray-500">{license.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          Technology *
                        </Label>
                        <Select
                          value={productData.technology}
                          onValueChange={(value) =>
                            handleSelectChange("technology", value)
                          }
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select technology" />
                          </SelectTrigger>
                          <SelectContent>
                            {technologies.map((tech) => (
                              <SelectItem key={tech.value} value={tech.value}>
                                <div className="flex items-center gap-2">
                                  {tech.icon}
                                  {tech.value}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        File Size
                      </Label>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
                        <FileArchive className="h-8 w-8 text-blue-500" />
                        <div className="flex-1">
                          <div className="font-medium">Auto-calculated</div>
                          <div className="text-sm text-gray-500">
                            Will be calculated after file upload
                          </div>
                        </div>
                        <Badge variant="outline" className="text-lg">
                          {productData.file_size}
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="features" className="space-y-6">
                    <div className="grid gap-4">
                      {[
                        { id: 'featured', label: 'Mark as Featured', description: 'Showcase on homepage', icon: <Sparkles className="h-4 w-4" /> },
                        { id: 'responsive', label: 'Fully Responsive', description: 'Works on all devices', icon: <Smartphone className="h-4 w-4" /> },
                        { id: 'documentation', label: 'Includes Documentation', description: 'Detailed setup guide', icon: <FileText className="h-4 w-4" /> },
                        { id: 'support', label: 'Free Support', description: '6 months included', icon: <Shield className="h-4 w-4" /> },
                        { id: 'updates', label: 'Lifetime Updates', description: 'Get all future updates', icon: <Clock className="h-4 w-4" /> },
                      ].map((feature) => (
                        <div key={feature.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              {feature.icon}
                            </div>
                            <div>
                              <div className="font-medium">{feature.label}</div>
                              <div className="text-sm text-gray-500">{feature.description}</div>
                            </div>
                          </div>
                          <Switch
                            checked={productData[feature.id as keyof typeof productData] as boolean}
                            onCheckedChange={(checked) => handleSwitchChange(feature.id, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Upload & Actions */}
          <div className="space-y-6">
            {/* Upload Cards */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Upload Files
                </CardTitle>
                <CardDescription>
                  Upload your template files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Template File Upload */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <FileArchive className="h-4 w-4" />
                    Template File (Full React Project)
                  </Label>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${templateFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}`}>
                    <input
                      id="template-upload"
                      type="file"
                      accept=".zip,application/zip"
                      className="hidden"
                      onChange={handleTemplateUpload}
                    />
                    <label htmlFor="template-upload" className="cursor-pointer">
                      <div className="space-y-3">
                        <div className={`p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center ${templateFile ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          {templateFile ? <Check className="h-8 w-8" /> : <FileArchive className="h-8 w-8" />}
                        </div>
                        {templateFile ? (
                          <>
                            <div className="font-medium">{templateFile.name}</div>
                            <div className="text-sm text-gray-500">
                              {(templateFile.size / (1024 * 1024)).toFixed(2)} MB
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTemplateFile(null);
                              }}
                              className="mt-2"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="font-medium">Click to upload</div>
                            <div className="text-sm text-gray-500">
                              Full React project ZIP
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              Max 100MB
                            </div>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <Separator />

                {/* Preview File Upload */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview File (Dist + Meta)
                  </Label>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${previewFile ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'}`}>
                    <input
                      id="preview-upload"
                      type="file"
                      accept=".zip,application/zip"
                      className="hidden"
                      onChange={handlePreviewUpload}
                    />
                    <label htmlFor="preview-upload" className="cursor-pointer">
                      <div className="space-y-3">
                        <div className={`p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center ${previewFile ? 'bg-purple-100 text-purple-600' : 'bg-purple-100 text-purple-600'}`}>
                          {previewFile ? <Check className="h-8 w-8" /> : <Package className="h-8 w-8" />}
                        </div>
                        {previewFile ? (
                          <>
                            <div className="font-medium">{previewFile.name}</div>
                            <div className="text-sm text-gray-500">
                              {(previewFile.size / (1024 * 1024)).toFixed(2)} MB
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewFile(null);
                              }}
                              className="mt-2"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="font-medium">Click to upload</div>
                            <div className="text-sm text-gray-500">
                              Preview package ZIP
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              Contains dist/ + preview-meta.json
                            </div>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Progress & Actions */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Ready to Launch
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Upload Progress */}
                {loading && (
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Uploading...</span>
                      <span className="font-bold">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                    <div className="text-xs text-gray-500 text-center">
                      Please don't close this window
                    </div>
                  </div>
                )}

                {/* Error Alert */}
                {uploadError && !uploadSuccess && (
                  <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Upload Error</AlertTitle>
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}

                {/* Success Alert */}
                {uploadSuccess && (
                  <Alert className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 animate-in slide-in-from-top">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Success!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Template uploaded successfully! Redirecting...
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !templateFile || !previewFile}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-5 w-5 mr-2" />
                        Publish Template
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/seller/templates")}
                    className="w-full h-12"
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Upload
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Upload Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {[
                    { icon: <FileArchive className="h-4 w-4 text-blue-500" />, text: "Template ZIP: Full React project for download" },
                    { icon: <Package className="h-4 w-4 text-purple-500" />, text: "Preview ZIP: project_name/dist/ + preview-meta.json" },
                    { icon: <Globe className="h-4 w-4 text-green-500" />, text: "Preview will be available at: preview.templamart.com" },
                    { icon: <Download className="h-4 w-4 text-amber-500" />, text: "Max file size: 100MB per ZIP" },
                    { icon: <Sparkles className="h-4 w-4 text-pink-500" />, text: "Product image auto-generated from preview" },
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="p-1 bg-gray-50 rounded-lg mt-0.5">
                        {item.icon}
                      </div>
                      <span className="text-sm text-gray-600">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  Your files are secured with 256-bit encryption
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing icon components
const Smartphone = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const ShoppingBag = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const PenTool = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

export default UploadTemplate;