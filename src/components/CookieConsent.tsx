import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Cookie, Shield, Settings, CheckCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cookieConsent", JSON.stringify(allAccepted));
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleAcceptSelected = () => {
    const selectedPreferences = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cookieConsent", JSON.stringify(selectedPreferences));
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    const rejected = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cookieConsent", JSON.stringify(rejected));
    setIsVisible(false);
    setShowSettings(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Main Cookie Banner */}
      {!showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
            <Card className="border-2 shadow-2xl bg-background/95 backdrop-blur-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500">
                      <Cookie className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold">🍪 We Value Your Privacy</h3>
                        <Badge variant="outline" className="text-xs">
                          <Shield className="mr-1 h-3 w-3" />
                          GDPR Compliant
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic. 
                        By clicking "Accept All", you consent to our use of cookies.{" "}
                        <Link to="/cookies-policy" className="text-primary hover:underline font-medium">
                          Learn more
                        </Link>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => setShowSettings(true)}
                      className="w-full sm:w-auto"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Customize
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRejectAll}
                      className="w-full sm:w-auto"
                    >
                      Reject All
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      className="w-full sm:w-auto bg-gradient-to-r from-primary to-brand-600 hover:from-primary/90 hover:to-brand-600/90"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                <Cookie className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Cookie Preferences</DialogTitle>
                <DialogDescription className="text-sm">
                  Manage your cookie settings and privacy preferences
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p>
                    We respect your privacy. You can enable or disable different types of cookies below. 
                    Note that blocking some types of cookies may impact your experience on our website.
                  </p>
                </div>
              </div>
            </div>

            {/* Necessary Cookies */}
            <div className="p-4 rounded-lg border bg-accent/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Strictly Necessary Cookies</h4>
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    These cookies are essential for the website to function properly. They enable core functionality 
                    such as security, authentication, and shopping cart operations.
                  </p>
                </div>
                <Switch checked={preferences.necessary} disabled className="mt-1" />
              </div>
            </div>

            <Separator />

            {/* Functional Cookies */}
            <div className="p-4 rounded-lg border hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Functional Cookies</h4>
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enable enhanced functionality and personalization, such as language settings and customization options.
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Examples:</strong> Language preferences, theme selection, saved filters
                  </div>
                </div>
                <Switch
                  checked={preferences.functional}
                  onCheckedChange={() => togglePreference("functional")}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="p-4 rounded-lg border hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Analytics & Performance Cookies</h4>
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Help us understand how visitors interact with our website anonymously to improve performance.
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Examples:</strong> Google Analytics, page views, session duration
                  </div>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={() => togglePreference("analytics")}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="p-4 rounded-lg border hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Marketing & Advertising Cookies</h4>
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Used to track visitors across websites to display relevant advertisements.
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Examples:</strong> Facebook Pixel, Google Ads, retargeting
                  </div>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={() => togglePreference("marketing")}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleRejectAll} className="w-full sm:w-auto">
              Reject All
            </Button>
            <Button variant="outline" onClick={handleAcceptSelected} className="w-full sm:w-auto">
              Save Preferences
            </Button>
            <Button onClick={handleAcceptAll} className="w-full sm:w-auto bg-gradient-to-r from-primary to-brand-600">
              Accept All
            </Button>
          </DialogFooter>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <Link to="/cookies-policy" className="hover:text-primary underline">Cookie Policy</Link>
            {" • "}
            <Link to="/privacy" className="hover:text-primary underline">Privacy Policy</Link>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
      `}</style>
    </>
  );
};

export default CookieConsent;