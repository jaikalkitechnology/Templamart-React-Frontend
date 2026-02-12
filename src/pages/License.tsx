import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileKey, Shield, CheckCircle, XCircle, AlertTriangle, Copyright, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LicenseAgreement = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/30 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 py-16 md:py-20 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-white/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/30">
            <FileKey className="mr-2 h-3 w-3" />
            License Terms
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
            Digital Product License
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 mb-6">
            Understanding your rights and restrictions for using our digital products
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
          <Card className="border-2">
            <CardContent className="p-6 md:p-10 space-y-8">
              {/* Important Notice */}
              <Alert className="border-purple-500/50 bg-purple-500/10">
                <Copyright className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-sm">
                  <strong>Important:</strong> When you purchase a Digital Product, you're purchasing a LICENSE to use it, not ownership. 
                  Please read these terms carefully to understand what you can and cannot do.
                </AlertDescription>
              </Alert>

              {/* Introduction */}
              <div>
                <h2 className="text-2xl font-bold mb-4">1. INTRODUCTION TO LICENSING</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    When you purchase a Digital Product from TemplaMart, you are <strong>not purchasing ownership</strong> of the product itself. 
                    Instead, you are purchasing a <strong>license</strong> that grants you specific rights to use the Digital Product under 
                    certain conditions and restrictions.
                  </p>
                  <div className="p-4 rounded-lg bg-accent">
                    <h3 className="font-semibold mb-2">This document defines:</h3>
                    <ul className="space-y-1 text-sm">
                      {["Types of licenses available", "What you CAN do with licensed products", "What you CANNOT do", "License duration and termination", "Enforcement and violations"].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              {/* License Types */}
              <div>
                <h2 className="text-2xl font-bold mb-4">2. STANDARD LICENSE TYPES</h2>
                <p className="text-muted-foreground mb-4">TemplaMart offers two standard license types:</p>

                {/* Regular License */}
                <div className="space-y-4">
                  <div className="p-5 rounded-lg border-2 border-green-500/30 bg-green-500/5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold">REGULAR LICENSE</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">✅ What's Permitted:</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {[
                            "Create ONE end product for yourself or one client",
                            "Use for personal or client projects",
                            "Distribute end product to end users for free",
                            "Charge one-time fee to client for services",
                            "End users can access and use the end product"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded bg-green-500/10">
                        <h4 className="font-semibold mb-2 text-sm">Examples of Permitted Use:</h4>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          <li>• Freelancer building a website for a client</li>
                          <li>• Creating your personal portfolio website</li>
                          <li>• Building a site for a non-profit organization</li>
                          <li>• Agency creating a client website with free access</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 text-red-700 dark:text-red-400">❌ What's NOT Permitted:</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {[
                            "Create multiple end products (need separate licenses)",
                            "Redistribute or resell the Digital Product itself",
                            "Use in products offered for sale to end users",
                            "Create SaaS applications",
                            "Offer as downloadable template"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Extended License */}
                  <div className="p-5 rounded-lg border-2 border-purple-500/30 bg-purple-500/5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold">EXTENDED LICENSE</h3>
                      <Badge className="ml-auto bg-purple-600">Premium</Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-400">✅ Everything in Regular License, PLUS:</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {[
                            "Create products sold/licensed to end users",
                            "Build SaaS applications",
                            "Offer template as part of paid service",
                            "Create products with recurring fees",
                            "Build membership/subscription sites"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded bg-purple-500/10">
                        <h4 className="font-semibold mb-2 text-sm">Examples Requiring Extended License:</h4>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          <li>• SaaS application sold to end users</li>
                          <li>• Membership website with subscription fees</li>
                          <li>• Template marketplace or reselling</li>
                          <li>• Website builder tool</li>
                        </ul>
                      </div>

                      <Alert className="border-purple-500/50 bg-purple-500/5">
                        <AlertTriangle className="h-4 w-4 text-purple-600" />
                        <AlertDescription className="text-xs">
                          Extended License still does NOT permit direct redistribution of the source files or creating derivative templates for resale.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </div>

              {/* General Restrictions */}
              <div className="p-6 rounded-lg bg-red-500/10 border-2 border-red-500/20">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <XCircle className="h-6 w-6 text-red-600" />
                  Universal Restrictions (Both Licenses)
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "You CANNOT claim ownership or authorship of the Digital Product",
                    "You CANNOT redistribute, resell, or sublicense the original files",
                    "You CANNOT use to create competing marketplace/template sites",
                    "You CANNOT remove or alter copyright notices",
                    "You CANNOT reverse engineer or decompile the product",
                    "You CANNOT use in illegal, defamatory, or harmful content"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Additional Info */}
              <div className="p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <h3 className="font-semibold mb-3">Additional Topics Covered:</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {[
                    "Intellectual property rights",
                    "License duration & termination",
                    "Transfer of licenses",
                    "Enforcement & violations",
                    "Warranties & disclaimers",
                    "Limitation of liability",
                    "Governing law",
                    "Contact for questions"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div className="p-6 rounded-lg bg-accent border">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  License Questions
                </h3>
                <p className="text-muted-foreground mb-4">
                  For questions about licensing or to report violations:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> <a href="mailto:licensing@templamart.com" className="text-primary hover:underline">licensing@templamart.com</a></p>
                  <p><strong>Legal:</strong> <a href="mailto:legal@templamart.com" className="text-primary hover:underline">legal@templamart.com</a></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LicenseAgreement;