import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Edit, Trash2, Plus, FileText, Star, ChevronRight, MoreVertical, Sparkles, Globe, Mail, Presentation, Palette, Layout } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { BASE_URL } from "@/config";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  templateCount: number;
  featured: boolean;
}

const getCategoryIcon = (categoryName: string) => {
  const icons: Record<string, JSX.Element> = {
    "Website": <Globe className="h-5 w-5" />,
    "Email": <Mail className="h-5 w-5" />,
    "Presentation": <Presentation className="h-5 w-5" />,
    "Graphics": <Palette className="h-5 w-5" />,
    "UI": <Layout className="h-5 w-5" />,
  };
  
  for (const [key, icon] of Object.entries(icons)) {
    if (categoryName.includes(key)) return icon;
  }
  return <Layout className="h-5 w-5" />;
};

const CategoriesManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCategories(res.data);
    } catch (err: any) {
      setError("Failed to load categories. Using mock data for preview.");
      // Fallback to mock data for UI preview
      const mockCategories: Category[] = [
        {
          id: "c1",
          name: "Website Templates",
          slug: "website-templates",
          description: "Professional website templates for all industries",
          templateCount: 124,
          featured: true
        },
        {
          id: "c2",
          name: "Email Templates",
          slug: "email-templates",
          description: "Responsive email templates for marketing campaigns",
          templateCount: 78,
          featured: true
        },
        {
          id: "c3",
          name: "Presentation Templates",
          slug: "presentation-templates",
          description: "Professional presentation templates for business and education",
          templateCount: 56,
          featured: false
        },
        {
          id: "c4",
          name: "Graphics & Illustrations",
          slug: "graphics",
          description: "High-quality graphics for social media and marketing",
          templateCount: 92,
          featured: true
        },
        {
          id: "c5",
          name: "UI Kits",
          slug: "ui-kits",
          description: "Complete UI kits for web and mobile design",
          templateCount: 45,
          featured: false
        },
        {
          id: "c6",
          name: "Social Media Templates",
          slug: "social-media-templates",
          description: "Ready-to-use templates for social media platforms",
          templateCount: 67,
          featured: true
        }
      ];
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    featured: false
  });
  
  const [editCategory, setEditCategory] = useState({
    name: "",
    slug: "",
    description: "",
    featured: false
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleNewCategoryNameChange = (value: string) => {
    setNewCategory({
      ...newCategory,
      name: value,
      slug: generateSlug(value)
    });
  };

  const handleEditCategoryNameChange = (value: string) => {
    setEditCategory({
      ...editCategory,
      name: value,
      slug: editCategory.slug === generateSlug(selectedCategory?.name || "") 
        ? generateSlug(value) 
        : editCategory.slug
    });
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast.error("Category name is required");
      return;
    }

    const categoryToSend = {
      name: newCategory.name,
      slug: newCategory.slug || generateSlug(newCategory.name),
      description: newCategory.description,
      featured: newCategory.featured,
    };

    try {
      const response = await fetch(`${BASE_URL}/admin/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(categoryToSend),
      });

      if (response.ok) {
        const savedCategory = await response.json();
        
        setCategories([...categories, savedCategory]);
        toast.success("Category added successfully", {
          description: `${savedCategory.name} has been added to categories`,
          icon: <Sparkles className="h-4 w-4" />,
        });

        setNewCategory({
          name: "",
          slug: "",
          description: "",
          featured: false,
        });

        setIsNewCategoryDialogOpen(false);
      } else {
        const errorData = await response.json();
        toast.error("Failed to add category", {
          description: errorData.detail || "Please check your input.",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error", {
        description: "Please try again later.",
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !editCategory.name) {
      toast.error("Category name is required");
      return;
    }

    const updatedData = {
      name: editCategory.name,
      slug: editCategory.slug || generateSlug(editCategory.name),
      description: editCategory.description,
      featured: editCategory.featured,
    };

    try {
      const response = await fetch(`${BASE_URL}/admin/categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updatedCategory = await response.json();

        setCategories(prevCategories =>
          prevCategories.map(category =>
            category.id === selectedCategory.id ? updatedCategory : category
          )
        );

        toast.success("Category updated", {
          description: `${updatedCategory.name} has been updated successfully`,
          icon: <Sparkles className="h-4 w-4" />,
        });

        setIsEditCategoryDialogOpen(false);
      } else {
        const errorData = await response.json();
        toast.error("Update failed", {
          description: errorData.detail || "Please check your input.",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error", {
        description: "Please try again later.",
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      const response = await fetch(`${BASE_URL}/admin/categories/${selectedCategory.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setCategories(prevCategories =>
          prevCategories.filter(category => category.id !== selectedCategory.id)
        );

        toast.success("Category deleted", {
          description: `${selectedCategory.name} has been deleted successfully`,
        });

        setIsDeleteDialogOpen(false);
        setSelectedCategory(null);
      } else {
        const errorData = await response.json();
        toast.error("Delete failed", {
          description: errorData.detail || "Unable to delete category.",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error", {
        description: "Please try again later.",
      });
    }
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setEditCategory({
      name: category.name,
      slug: category.slug,
      description: category.description,
      featured: category.featured
    });
    setIsEditCategoryDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-3">
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="md:col-span-2">
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="md:col-span-4">
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="md:col-span-1">
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="md:col-span-1">
                  <Skeleton className="h-5 w-full" />
                </div>
                <div className="md:col-span-1">
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Categories
            </h1>
            <Badge variant="outline" className="text-xs">
              {categories.length} total
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Organize and manage all template categories in your marketplace
          </p>
        </div>
        
        <Dialog open={isNewCategoryDialogOpen} onOpenChange={setIsNewCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Category
              </DialogTitle>
              <DialogDescription>
                Add a new category to organize your templates
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-5 py-2">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium">
                  Category Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Mobile App Templates"
                  value={newCategory.name}
                  onChange={(e) => handleNewCategoryNameChange(e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="slug" className="text-sm font-medium">
                  URL Slug
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/category/</span>
                  <Input
                    id="slug"
                    placeholder="mobile-app-templates"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    className="h-11"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  SEO-friendly URL identifier for this category
                </p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this category includes..."
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="min-h-[100px] resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                    Featured Category
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show this category prominently on homepage
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={newCategory.featured}
                  onCheckedChange={(checked) => setNewCategory({ ...newCategory, featured: checked })}
                />
              </div>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setIsNewCategoryDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddCategory}
                className="w-full sm:w-auto gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <FileText className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">All Categories</CardTitle>
          <CardDescription>
            Click on any category to view details or manage
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid gap-4">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="group relative p-4 rounded-xl border hover:border-primary/50 hover:shadow-md transition-all duration-300 bg-card"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getCategoryIcon(category.name)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        {category.featured && (
                          <Badge variant="secondary" className="gap-1 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200">
                            <Star className="h-3 w-3 fill-amber-500" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                      <div className="flex items-center gap-4 pt-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          /{category.slug}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                          {category.templateCount} templates
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={() => handleEditClick(category)}
                          className="cursor-pointer gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Category
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(category)}
                          disabled={category.templateCount > 0}
                          className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Category
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(category)}
                      className="gap-2"
                    >
                      Manage
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {category.templateCount > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Contains {category.templateCount} template{category.templateCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {categories.length === 0 && (
              <div className="text-center py-12 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Layout className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">No categories found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Get started by creating your first template category to organize your content.
                </p>
                <Button onClick={() => setIsNewCategoryDialogOpen(true)} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Category
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Categories</p>
                <h3 className="text-2xl font-bold">{categories.length}</h3>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <Layout className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <h3 className="text-2xl font-bold">
                  {categories.filter(c => c.featured).length}
                </h3>
              </div>
              <div className="p-2 rounded-lg bg-amber-100">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Templates</p>
                <h3 className="text-2xl font-bold">
                  {categories.reduce((sum, c) => sum + c.templateCount, 0)}
                </h3>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average per Category</p>
                <h3 className="text-2xl font-bold">
                  {categories.length > 0 
                    ? Math.round(categories.reduce((sum, c) => sum + c.templateCount, 0) / categories.length)
                    : 0
                  }
                </h3>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Category Dialog */}
      {selectedCategory && (
        <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Edit Category
              </DialogTitle>
              <DialogDescription>
                Update category details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-5 py-2">
              <div className="space-y-3">
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  Category Name *
                </Label>
                <Input
                  id="edit-name"
                  value={editCategory.name}
                  onChange={(e) => handleEditCategoryNameChange(e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="edit-slug" className="text-sm font-medium">
                  URL Slug
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/category/</span>
                  <Input
                    id="edit-slug"
                    value={editCategory.slug}
                    onChange={(e) => setEditCategory({ ...editCategory, slug: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="edit-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={editCategory.description}
                  onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                  className="min-h-[100px] resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="edit-featured" className="text-sm font-medium cursor-pointer">
                    Featured Category
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show prominently on homepage
                  </p>
                </div>
                <Switch
                  id="edit-featured"
                  checked={editCategory.featured}
                  onCheckedChange={(checked) => setEditCategory({ ...editCategory, featured: checked })}
                />
              </div>
              
              {selectedCategory.templateCount > 0 && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Contains {selectedCategory.templateCount} templates
                    </p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Changes will affect all templates in this category
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setIsEditCategoryDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateCategory}
                className="w-full sm:w-auto"
              >
                Update Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Category Dialog */}
      {selectedCategory && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete Category
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-red-100">
                    <Layout className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedCategory.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedCategory.templateCount} templates
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedCategory.templateCount > 0 ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <span className="font-semibold">Cannot delete:</span> This category contains {selectedCategory.templateCount} active templates. Remove all templates first.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This will permanently delete the category and remove it from your dashboard.
                </p>
              )}
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteCategory}
                disabled={selectedCategory.templateCount > 0}
                className="w-full sm:w-auto gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  ); 
};

export default CategoriesManagement;