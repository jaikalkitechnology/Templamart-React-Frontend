import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Cookie, Info, Settings, Shield, Eye, BarChart, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CookiesPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/30 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 py-16 md:py-20 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-white/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/30">
            <Cookie className="mr-2 h-3 w-3" />
            Cookie Information
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
            Cookie Policy
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 mb-6">
            How we use cookies and similar technologies on TemplaMart
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
          <Card className="border-2">
            <CardContent className="p-6 md:p-10 space-y-8">
              {/* Introduction */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10">
                    <Info className="h-5 w-5 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-bold">1. INTRODUCTION</h2>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    This Cookie Policy explains how RootPay Private Limited ("we," "us," "our," or "Company"), operator of TemplaMart ("Platform"), 
                    uses cookies and similar tracking technologies when you visit our website at <strong>templamart.com</strong>.
                  </p>
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <h3 className="font-semibold mb-2">This policy provides information about:</h3>
                    <ul className="space-y-1 text-sm">
                      {["What cookies are and why we use them", "Types of cookies we use", "How to control and manage cookies", "Your choices regarding cookies"].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-sm">
                    By using the Platform, you consent to the use of cookies in accordance with this Cookie Policy. If you do not agree, 
                    you should disable them following the instructions below, though this may affect your ability to use certain features.
                  </p>
                </div>
              </div>

              <Separator />

              {/* What are Cookies */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
                    <Cookie className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold">2. WHAT ARE COOKIES?</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <h3 className="font-semibold mb-2">Definition</h3>
                    <p className="text-sm text-muted-foreground">
                      Cookies are small text files stored on your device when you visit a website. They help websites work efficiently, 
                      provide better user experience, and give information to website owners.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-accent">
                    <h3 className="font-semibold mb-3">How Cookies Work:</h3>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      {[
                        "Website sends a cookie to your browser",
                        "Your browser stores the cookie on your device",
                        "When you return, browser sends cookie back",
                        "Website recognizes you and remembers preferences"
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Badge variant="outline" className="text-xs">{i + 1}</Badge>
                          <span className="flex-1">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <h3 className="font-semibold mb-2">Cookies Typically Contain:</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {["Website name that created the cookie", "Unique identifier (cookie ID)", "Expiration date", "Information about your preferences"].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Why We Use Cookies */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/10">
                    <Eye className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold">3. WHY WE USE COOKIES</h2>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      icon: Shield,
                      title: "Essential Functionality",
                      color: "blue",
                      items: ["User authentication (keep you logged in)", "Shopping cart (remember products)", "Security measures", "Session management"]
                    },
                    {
                      icon: BarChart,
                      title: "Analytics & Performance",
                      color: "green",
                      items: ["Understand how you use the Platform", "Track page views and engagement", "Identify popular features", "Improve user experience"]
                    },
                    {
                      icon: Settings,
                      title: "Preferences & Customization",
                      color: "purple",
                      items: ["Remember your settings", "Language preferences", "Display preferences", "Personalized content"]
                    }
                  ].map((section, i) => (
                    <div key={i} className={`p-4 rounded-lg bg-${section.color}-500/10 border border-${section.color}-500/20`}>
                      <div className="flex items-center gap-2 mb-3">
                        <section.icon className={`h-5 w-5 text-${section.color}-600`} />
                        <h3 className="font-semibold">{section.title}</h3>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {section.items.map((item, j) => (
                          <li key={j} className="flex items-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full bg-${section.color}-500`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Types of Cookies */}
              <div>
                <h2 className="text-2xl font-bold mb-4">4. TYPES OF COOKIES WE USE</h2>
                <div className="space-y-3">
                  {[
                    { type: "Strictly Necessary", desc: "Essential for Platform operation", required: true },
                    { type: "Performance Cookies", desc: "Help us understand usage patterns", required: false },
                    { type: "Functional Cookies", desc: "Remember your preferences", required: false },
                    { type: "Targeting Cookies", desc: "Deliver relevant content", required: false }
                  ].map((cookie, i) => (
                    <div key={i} className="p-4 rounded-lg bg-accent border">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{cookie.type}</h3>
                        <Badge variant={cookie.required ? "default" : "outline"}>
                          {cookie.required ? "Required" : "Optional"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{cookie.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cookie Management */}
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <Settings className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm">
                  <strong>Cookie Management:</strong> You can control cookies through your browser settings. However, blocking essential 
                  cookies may affect Platform functionality. Most browsers allow you to view, delete, and block cookies.
                </AlertDescription>
              </Alert>

              {/* Additional Info */}
              <div className="p-6 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <h3 className="font-semibold mb-3">Additional Topics Covered:</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {[
                    "Similar technologies (pixels, local storage)",
                    "Third-party cookies",
                    "Cookie duration",
                    "Browser settings",
                    "Mobile device settings",
                    "Do Not Track signals",
                    "Updates to this policy",
                    "Contact information"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div className="p-6 rounded-lg bg-accent border">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Cookie Questions
                </h3>
                <p className="text-muted-foreground mb-4">
                  For questions about our use of cookies:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> <a href="mailto:privacy@templamart.com" className="text-primary hover:underline">privacy@templamart.com</a></p>
                  <p><strong>Support:</strong> <a href="mailto:support@templamart.com" className="text-primary hover:underline">support@templamart.com</a></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default CookiesPolicy;