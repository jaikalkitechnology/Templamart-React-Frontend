import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, FileText, Mail, Calendar } from "lucide-react";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/30 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-brand-600 py-16 md:py-20 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-white/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/30">
            <Shield className="mr-2 h-3 w-3" />
            Legal Document
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
            Privacy Policy
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 mb-6">
            Your privacy and data security are our top priorities
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Last Updated: January 17, 2026</span>
            </div>
          </div>
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">1. INTRODUCTION</h2>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    RootPay Private Limited ("we," "us," "our," or "Company") operates <strong>www.templamart.com</strong> ("Platform"), 
                    a digital marketplace for website templates and digital assets. We are committed to protecting your privacy and handling 
                    your personal information with transparency and in compliance with applicable data protection laws.
                  </p>
                  <p>This Privacy Policy explains:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>What information we collect</li>
                    <li>How we use, share, and protect your information</li>
                    <li>Your rights and choices regarding your information</li>
                    <li>How to contact us with privacy concerns</li>
                  </ul>
                  <p>
                    By accessing or using the Platform at <strong>templamart.com</strong>, you consent to the collection, use, 
                    and disclosure of your information as described in this Privacy Policy.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Compliance */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Compliance
                </h3>
                <p className="text-muted-foreground mb-3">This Privacy Policy complies with:</p>
                <ul className="space-y-2">
                  {[
                    "Information Technology Act, 2000",
                    "Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011",
                    "General Data Protection Regulation (GDPR) - for EU users",
                    "California Consumer Privacy Act (CCPA) - for California residents",
                    "Other applicable privacy and data protection laws"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">✓</Badge>
                      <span className="text-muted-foreground flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Information We Collect */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold">2. INFORMATION WE COLLECT</h2>
                </div>

                <div className="space-y-6">
                  {/* Account Registration */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">2.1 Information You Provide Directly</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-accent/50">
                        <h4 className="font-semibold mb-2">Account Registration Information:</h4>
                        <p className="text-sm text-muted-foreground mb-2">When you create an Account, we collect:</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {["Full name", "Email address", "Password (encrypted)", "Country of residence", "Phone number (optional)", "Profile picture (optional)", "Bio/description (for sellers)"].map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <h4 className="font-semibold mb-2 text-orange-700 dark:text-orange-400">Business Information (Sellers Only):</h4>
                        <p className="text-sm text-muted-foreground mb-2">Sellers must provide:</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {["Business name", "Business type", "PAN (Permanent Account Number)", "GSTIN (if applicable)", "Business certificates", "Business address", "Authorized signatory info", "Bank account details", "PayPal account (international)"].map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">Transaction Information:</h4>
                        <p className="text-sm text-muted-foreground mb-2">When you make a purchase or sale:</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {["Billing & shipping address", "Payment method type", "Transaction amount & currency", "Order details & product IDs", "Payment gateway references"].map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 p-3 rounded bg-green-500/5 border border-green-500/10">
                          <p className="text-xs font-medium text-green-700 dark:text-green-400">
                            <Lock className="h-3 w-3 inline mr-1" />
                            Note: We do NOT store complete credit/debit card numbers or CVV codes. Payment information is handled by PCI DSS compliant third-party payment gateways.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Generated Content */}
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-400">User-Generated Content:</h4>
                    <p className="text-sm text-muted-foreground mb-2">We collect content you post on the Platform:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {["Product listings, descriptions & tags", "Product screenshots & demos", "Reviews and ratings", "Comments and forum posts"].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Additional Sections Notice */}
              <div className="p-6 rounded-lg bg-gradient-to-r from-primary/10 to-brand-600/10 border border-primary/20">
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Complete Privacy Policy</h3>
                    <p className="text-sm text-muted-foreground">
                      This is a summary of our Privacy Policy. The complete document includes additional sections on:
                    </p>
                    <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {[
                        "How we use your information",
                        "Information sharing & disclosure",
                        "Data security measures",
                        "Your rights & choices",
                        "International data transfers",
                        "Children's privacy",
                        "Changes to this policy",
                        "Contact information"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-6 rounded-lg bg-accent border">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact Us
                </h3>
                <p className="text-muted-foreground mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Company:</strong> RootPay Private Limited</p>
                  <p><strong>Website:</strong> <a href="https://templamart.com" className="text-primary hover:underline">www.templamart.com</a></p>
                  <p><strong>Email:</strong> <a href="mailto:privacy@templamart.com" className="text-primary hover:underline">privacy@templamart.com</a></p>
                  <p className="pt-2"><strong>Address:</strong><br />Sh N B2/A, Ground Floor, Mahavir Nagar<br />Deepak Hospital Road Lane, Mira Road (E)<br />Thane, Maharashtra – 401107, India</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;