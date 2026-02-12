import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2, Mail, ArrowLeft, Shield, LockKeyhole } from "lucide-react";
import { BASE_URL } from "@/config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(
          "Password reset email sent successfully! Please check your inbox and spam folder."
        );
        setEmail("");
      } else {
        setErrorMsg(data.detail || "Failed to send reset email. Please try again.");
      }
    } catch (error) {
      setErrorMsg("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="absolute top-6 left-6">
        <Link to="/login">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
              <LockKeyhole className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-gray-600">
            Enter your email to receive a password reset link
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="p-2 rounded-full bg-white border shadow-sm">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          
          <CardHeader className="pt-8">
            <CardTitle className="text-xl text-center">Forgot your password?</CardTitle>
            <CardDescription className="text-center">
              Don't worry, we'll help you get back into your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {errorMsg && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                  <AlertDescription className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-current"></div>
                    {errorMsg}
                  </AlertDescription>
                </Alert>
              )}

              {successMsg && (
                <Alert className="border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <AlertDescription className="text-emerald-700">
                    {successMsg}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 pt-1">
                    We'll send a secure link to reset your password
                  </p>
                </div>

                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Reset link expires in 1 hour</p>
                      <p className="text-xs text-gray-600 mt-1">
                        For security reasons, the password reset link will expire after 60 minutes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pb-6">
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-600 pt-2">
                Remember your password?{" "}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                >
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help?{" "}
            <a 
              href="mailto:support@templamart.com" 
              className="text-gray-600 hover:text-gray-900 hover:underline font-medium"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;