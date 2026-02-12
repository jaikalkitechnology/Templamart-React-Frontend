import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Mail, 
  User, 
  Phone, 
  Lock, 
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  ArrowLeft,
  Users,
  BadgeCheck,
  Zap
} from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/config";

const SignupForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone_number, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/auth/signup`, {
        username: username.toLowerCase(),
        email,
        full_name: name,
        phone_number,
        password,
      });

      setSuccessMsg(response.data.message);
      setRegisteredEmail(response.data.email);

      setName("");
      setEmail("");
      setUsername("");
      setMobile("");
      setPassword("");
      setConfirmPassword("");
      setAgreedToTerms(false);

      setTimeout(() => {
        navigate("/login");
      }, 10000);
    } catch (error: any) {
      console.error("Signup failed:", error.response?.data || error.message);

      if (error.response?.data?.detail) {
        setErrorMsg(error.response.data.detail);
      } else {
        setErrorMsg("Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await axios.post(`${BASE_URL}/auth/resend-verification`, {
        email: registeredEmail,
      });

      setSuccessMsg(response.data.message);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || "Failed to resend email");
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message after registration
  if (successMsg && registeredEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
        <div className="absolute top-6 left-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="mx-auto max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
              <BadgeCheck className="h-6 w-6" />
            </div>
          </div>
          
          <CardHeader className="text-center pt-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-100 to-teal-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Registration Successful!
            </CardTitle>
            <CardDescription className="text-lg text-slate-600">
              Please verify your email address to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert className="border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-emerald-100">
                  <Mail className="h-5 w-5 text-emerald-600" />
                </div>
                <AlertDescription className="text-emerald-700 font-medium">
                  {successMsg}
                </AlertDescription>
              </div>
            </Alert>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-blue-900 text-lg">Check Your Email</h3>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                We've sent a verification link to:
              </p>
              <div className="bg-white border border-blue-300 rounded-lg p-4 mb-4">
                <p className="font-mono text-sm font-semibold text-blue-900 text-center">
                  {registeredEmail}
                </p>
              </div>
              <p className="text-sm text-blue-700">
                Click the link in the email to activate your account. Don't forget
                to check your spam folder!
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-amber-100">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-sm font-bold text-amber-800">
                  Didn't receive the email?
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-400"
                onClick={handleResendVerification}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <Link to="/login" className="w-full">
              <Button 
                variant="default" 
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg transition-all"
              >
                Go to Login
              </Button>
            </Link>
            <div className="text-center space-y-2">
              <p className="text-xs text-slate-500">
                You'll be redirected to login in 10 seconds...
              </p>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show registration form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="absolute top-6 left-6">
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Join Our Community
          </h1>
          <p className="text-gray-600">
            Create your account and start your journey with us
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          
          <CardHeader className="pt-8">
            <CardTitle className="text-xl text-center">Create Your Account</CardTitle>
            <CardDescription className="text-center">
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {errorMsg && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5" />
                    <AlertDescription>{errorMsg}</AlertDescription>
                  </div>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-11"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4" />
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-11"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <BadgeCheck className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Letters, numbers, underscores only
                  </p>
                </div>
              </div>

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
                    className="pl-10 h-11"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  You'll need to verify this email address
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Mobile Number
                </Label>
                <div className="relative">
                  <Input
                    id="phone_number"
                    placeholder="+1 (555) 123-4567"
                    value={phone_number}
                    onChange={(e) => setMobile(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-11"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={8}
                      className="pl-10 pr-10 h-11"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={8}
                      className="pl-10 pr-10 h-11"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Zap className="h-3 w-3 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Password Requirements</p>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1">
                      <li className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                        • At least 8 characters long
                      </li>
                      <li className="flex items-center gap-1">
                        • Include letters and numbers
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-blue-300 transition-colors">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked as boolean)
                  }
                  disabled={isLoading}
                  className="h-5 w-5 data-[state=checked]:bg-blue-600"
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I agree to the{" "}
                  <a
                    href="/terms"
                    className="text-blue-600 font-medium hover:text-blue-800 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="text-blue-600 font-medium hover:text-blue-800 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </Label>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pb-6">
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
                disabled={isLoading || !agreedToTerms}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
              
              <div className="text-center space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Already have an account?</span>
                  </div>
                </div>
                <Link to="/login" className="block">
                  <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                    Login to Your Account
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our terms and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;