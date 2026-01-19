// seller/edit-template.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { BASE_URL } from "@/config";
import { useNavigate, useParams } from "react-router-dom";
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
  Loader2,
  Edit3,
  Save,
  Eye,
  Download,
  RefreshCw,
  Shield,
  Sparkles,
  Zap,
  Globe,
  DollarSign,
  Tag,
  User,
  FileCode,
  Layout,
  Palette,
  Clock,
  Rocket,
  Info,
  FileText,
  Key,
  Box,
  Layers,
  Cpu,
  Cloud,
  History,
  ArrowLeft,
  Settings,
  Image as ImageIcon,
  Link,
  Code
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const EditTemplate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { product_token } = useParams<{ product_token: string }>();
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

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
  
  // Existing file info
  const [existingFiles, setExistingFiles] = useState({
    template_url: "",
    preview_url: "",
    product_image: "",
    product_name: "",
    created_at: "",
  });

  const [fileStats, setFileStats] = useState({
    template_size: "0 MB",
    preview_size: "0 MB",
    downloads: 0,
    views: 0,
  });

  const categories = [
    { value: "Website Templates", icon: <Globe className="h-4 w-4" /> },
    { value: "UI Kits", icon: <Layout className="h-4 w-4" /> },
    { value: "Presentations", icon: <FileText className="h-4 w-4" /> },
    { value: "Graphics", icon: <Palette className="h-4 w-4" /> },
    { value: "Email Templates", icon: <Box className="h-4 w-4" /> },
    { value: "Dashboards", icon: <Cpu className="h-4 w-4" /> },
    { value: "Landing Pages", icon: <Sparkles className="h-4 w-4" /> },
    { value: "Mobile Apps", icon: <Smartphone className="h-4 w-4" /> },
  ];

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

  // Fetch existing product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/dash/seller/products/${product_token}/edit`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );

        const product = res.data;
        
        setProductData({
          product_name: product.product_name || "",
          title: product.title || "",
          description: product.description || "",
          category_name: product.category_name || "",
          product_price: product.product_price?.toString() || "",
          author: product.author || "",
          tags: product.tags || "",
          licenseType: product.licenseType || "standard",
          technology: product.technology || "HTML",
          file_size: product.file_size || "NA",
          featured: product.featured || false,
          responsive: product.responsive || true,
          documentation: product.documentation || true,
          support: product.support || true,
          updates: product.updates || false,
        });

        setExistingFiles({
          template_url: product.template_url || "",
          preview_url: product.preview_url || "",
          product_image: product.product_image || "",
          product_name: product.product_name || "",
          created_at: product.created_at || "",
        });

        // Simulate file stats (would come from API)
        setFileStats({
          template_size: product.file_size || "0 MB",
          preview_size: "5.2 MB",
          downloads: product.downloads || 0,
          views: product.views || 0,
        });

        toast.success("Template loaded successfully!");

      } catch (error: any) {
        console.error("Fetch error:", error);
        const errorMsg = error.response?.data?.detail || "Failed to load template";
        setUploadError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setFetchLoading(false);
      }
    };

    if (product_token && user?.token) {
      fetchProduct();
    }
  }, [product_token, user?.token]);

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
      toast.success("New template file selected!");
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
      toast.success("New preview file selected!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      
      // Append product data as JSON
      formData.append("product_data", JSON.stringify(productData));
      
      // Append files only if they're being replaced
      if (templateFile) {
        formData.append("template_file", templateFile);
      }
      if (previewFile) {
        formData.append("preview_file", previewFile);
      }

      const res = await axios.put(
        `${BASE_URL}/dash/seller/products/${product_token}`,
        formData,
        {
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
        }
      );

      setUploadSuccess(true);
      toast.success("Template updated successfully! Redirecting...");
      
      setTimeout(() => {
        navigate("/seller/templates");
      }, 2000);

    } catch (error: any) {
      console.error("Update error:", error);
      const errorMsg = error.response?.data?.detail || 
        error.response?.data?.message || 
        "Failed to update template. Please try again.";
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

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading template details...</p>
          <p className="text-sm text-gray-400">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/seller/templates")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Edit Template
                </h1>
                <p className="text-gray-600 mt-2">
                  Update and improve your template details
                </p>
              </div>
            </div>
            <Badge variant="outline" className="gap-2 px-3 py-1">
              <Edit3 className="h-3 w-3" />
              Editing Mode
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Status Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={existingFiles.product_image} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500">
                        <ImageIcon className="h-6 w-6 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{existingFiles.product_name}</CardTitle>
                      <CardDescription>
                        Created on {new Date(existingFiles.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Eye className="h-3 w-3" />
                      {fileStats.views} views
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Download className="h-3 w-3" />
                      {fileStats.downloads} downloads
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Edit Form */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Edit Template</CardTitle>
                    <CardDescription>
                      Update your template information and files
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="basic" className="gap-2">
                      <Info className="h-4 w-4" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="technical" className="gap-2">
                      <Code className="h-4 w-4" />
                      Technical
                    </TabsTrigger>
                    <TabsTrigger value="files" className="gap-2">
                      <FileArchive className="h-4 w-4" />
                      Files
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
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  <div className="flex items-center gap-2">
                                    {category.icon}
                                    {category.value}
                                  </div>
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
                          placeholder="Describe your template in detail..."
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
                          <div className="font-medium">Current Size</div>
                          <div className="text-sm text-gray-500">
                            {templateFile ? "New size will be calculated" : "Based on existing file"}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-lg">
                          {productData.file_size}
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="files" className="space-y-6">
                    {/* Current Files */}
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Current Files
                      </Label>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Template File */}
                        <Card className="border-2 border-blue-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileArchive className="h-5 w-5 text-blue-500" />
                                <CardTitle className="text-sm">Template File</CardTitle>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {fileStats.template_size}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <p className="text-sm text-gray-600 truncate">
                              {existingFiles.template_url.split('/').pop() || 'template.zip'}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => window.open(existingFiles.template_url, '_blank')}
                              >
                                <Eye className="h-3 w-3" />
                                Preview
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => window.open(existingFiles.template_url, '_blank')}
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Preview File */}
                        <Card className="border-2 border-purple-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-purple-500" />
                                <CardTitle className="text-sm">Preview File</CardTitle>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {fileStats.preview_size}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <p className="text-sm text-gray-600 truncate">
                              {existingFiles.preview_url.split('/').pop() || 'preview.zip'}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => window.open(existingFiles.preview_url, '_blank')}
                              >
                                <Eye className="h-3 w-3" />
                                Preview
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => window.open(existingFiles.preview_url, '_blank')}
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    {/* Replace Files */}
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Replace Files (Optional)
                      </Label>
                      
                      <div className="space-y-4">
                        {/* Replace Template */}
                        <div className="space-y-2">
                          <Label className="text-sm">New Template File</Label>
                          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${templateFile ? 'border-green-500 bg-green-50' : 'border-blue-300 bg-blue-50/50'}`}>
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
                                  {templateFile ? <CheckCircle className="h-8 w-8" /> : <FileArchive className="h-8 w-8" />}
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
                                    <div className="font-medium">Click to replace template</div>
                                    <div className="text-sm text-gray-500">
                                      Full React project ZIP
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                      Leave empty to keep existing
                                    </div>
                                  </>
                                )}
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Replace Preview */}
                        <div className="space-y-2">
                          <Label className="text-sm">New Preview File</Label>
                          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${previewFile ? 'border-green-500 bg-green-50' : 'border-purple-300 bg-purple-50/50'}`}>
                            <input
                              id="preview-upload"
                              type="file"
                              accept=".zip,application/zip"
                              className="hidden"
                              onChange={handlePreviewUpload}
                            />
                            <label htmlFor="preview-upload" className="cursor-pointer">
                              <div className="space-y-3">
                                <div className={`p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center ${previewFile ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                                  {previewFile ? <CheckCircle className="h-8 w-8" /> : <Package className="h-8 w-8" />}
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
                                    <div className="font-medium">Click to replace preview</div>
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

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Update Actions */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Update Template
                </CardTitle>
                <CardDescription>
                  Save your changes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Upload Progress */}
                {loading && (
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Updating...</span>
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
                    <AlertTitle>Update Error</AlertTitle>
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}

                {/* Success Alert */}
                {uploadSuccess && (
                  <Alert className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 animate-in slide-in-from-top">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Success!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Template updated successfully! Redirecting...
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
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
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview URL */}
            {existingFiles.preview_url && (
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Preview URL</span>
                      </div>
                      <a 
                        href={existingFiles.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {existingFiles.preview_url}
                      </a>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => window.open(existingFiles.preview_url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                      Open Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Guidelines */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Update Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {[
                    { icon: <RefreshCw className="h-4 w-4 text-blue-500" />, text: "Files are optional - leave empty to keep existing" },
                    { icon: <Cloud className="h-4 w-4 text-purple-500" />, text: "Uploading new files will replace old ones immediately" },
                    { icon: <Link className="h-4 w-4 text-green-500" />, text: "Preview URL updates automatically with new preview" },
                    { icon: <Rocket className="h-4 w-4 text-amber-500" />, text: "Changes take effect immediately after saving" },
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
            </Card>

            {/* Changes Summary */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm">Changes Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Template File</span>
                    <Badge variant={templateFile ? "default" : "outline"}>
                      {templateFile ? "Updated" : "Same"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Preview File</span>
                    <Badge variant={previewFile ? "default" : "outline"}>
                      {previewFile ? "Updated" : "Same"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Information</span>
                    <Badge variant="default">
                      Modified
                    </Badge>
                  </div>
                </div>
              </CardContent>
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

export default EditTemplate;