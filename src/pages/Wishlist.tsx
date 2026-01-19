import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, ExternalLink, Maximize2, X } from "lucide-react";
import { useShoppingContext } from "@/context/ShoppingContext";
import { TemplateProps } from "@/components/templates/TemplateCard";
import { useState } from "react";

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart } = useShoppingContext();
  const [activePreview, setActivePreview] = useState<string | null>(null);

  const removeFromWishlist = (id: string) => {
    const template = wishlist.find(item => item.id === id);
    if (template) {
      toggleWishlist(template);
    }
  };

  const handleAddToCart = (template: TemplateProps) => {
    addToCart(template);
  };

  const clearWishlist = () => {
    [...wishlist].forEach(item => toggleWishlist(item));
  };

  // Function to get website URL from item
  const getWebsiteUrl = (item: TemplateProps) => {
    // Try different possible URL properties
   
    // If image is a URL, you might want to use a placeholder instead
    return item.image;
  };

  // Function to check if URL is embeddable
  const isEmbeddableUrl = (url: string) => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      // Check if it's a web URL (http/https)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Your Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlist.length} items in your wishlist
          </p>
        </div>
        {wishlist.length > 0 && (
          <Button variant="outline" onClick={clearWishlist}>
            Clear Wishlist
          </Button>
        )}
      </div>

      {wishlist.length > 0 ? (
        <div className="grid gap-6">
          {wishlist.map((item) => {
            const websiteUrl = getWebsiteUrl(item);
            const isEmbeddable = isEmbeddableUrl(websiteUrl);
            
            return (
              <div
                key={item.id}
                className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="w-full md:w-60 h-52 overflow-hidden rounded-md border bg-gray-100 relative group">
                  {isEmbeddable ? (
                    <>
                      <iframe
                        src={websiteUrl}
                        title={`${item.title} Preview`}
                        className="h-full w-full"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                        loading="lazy"
                        style={{ border: 'none' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="absolute bottom-2 right-2 flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 px-2 text-xs bg-white/90 hover:bg-white"
                            onClick={() => setActivePreview(item.id)}
                          >
                            <Maximize2 className="h-3 w-3 mr-1" />
                            Expand
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 px-2 text-xs bg-white/90 hover:bg-white"
                            asChild
                          >
                            <a 
                              href={websiteUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open
                            </a>
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-lg">
                        <Link
                          to={`/template/${item.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      {isEmbeddable && (
                        <div className="mt-1">
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            asChild
                          >
                            <a 
                              href={websiteUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Visit Live Website
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="font-bold">₹{item.price.toFixed(2)}</p>
                  </div>
                  <p className="text-sm line-clamp-2">{item.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="mr-4">By {item.author.name}</span>
                    <span className="mr-4">Rating: {item.rating}/5</span>
                    <span>{item.sales} sales</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button onClick={() => handleAddToCart(item)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Full Screen Preview Modal */}
                {activePreview === item.id && isEmbeddable && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl">
                      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden rounded">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <p className="text-sm text-muted-foreground truncate max-w-md">
                              {websiteUrl}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2"
                          >
                            <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                              Open in New Tab
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setActivePreview(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden relative">
                        <iframe
                          src={websiteUrl}
                          title={`${item.title} Full Preview`}
                          className="h-full w-full"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation"
                          allowFullScreen
                        />
                        <div className="absolute top-4 right-4">
                          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Template Info</span>
                              <span className="font-bold text-primary">₹{item.price.toFixed(2)}</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Category:</span>
                                <span>{item.category}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Rating:</span>
                                <span>{item.rating}/5</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Sales:</span>
                                <span>{item.sales}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => {
                                  handleAddToCart(item);
                                  setActivePreview(null);
                                }}
                              >
                                <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                                Add to Cart
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeFromWishlist(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Use the fullscreen button (<ExternalLink className="h-3 w-3 inline" />) in the bottom right for better viewing
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActivePreview(null)}
                          >
                            Close Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Your wishlist is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Browse our templates and add your favorites to your wishlist
          </p>
          <Button asChild className="mt-6">
            <Link to="/templates">Browse Templates</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;