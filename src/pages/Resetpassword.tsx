import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2, AlertCircle, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import { BASE_URL, DOMAIN } from "@/config";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setErrorMsg("Invalid reset link. Please request a new password reset.");
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/auth/verify-reset-token/${token}`);
        
        if (response.ok) {
          setTokenValid(true);
        } else {
          setErrorMsg("This reset link is invalid or has expired. Please request a new password reset.");
        }
      } catch (error) {
        setErrorMsg("An error occurred. Please try again later.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  // Calculate password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (newPassword.length >= 8) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[a-z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;
    
    setPasswordStrength(strength);
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("Password has been reset successfully! Redirecting to login...");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setErrorMsg(data.detail || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      setErrorMsg("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength === 3) return "Medium";
    return "Strong";
  };

  // Show loading state while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
          <CardContent className="pt-12 pb-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">Verifying Reset Link</h3>
                <p className="text-sm text-gray-500">Checking your reset link for security...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-orange-500" />
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Invalid Reset Link</CardTitle>
            <CardDescription className="text-gray-500 pt-2">
              The password reset link is no longer valid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">{errorMsg}</AlertDescription>
            </Alert>
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">
                For security reasons, password reset links expire after a short period. Please request a new link to continue.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button 
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => navigate("/forgot-password")}
            >
              Request New Reset Link
            </Button>
            <Button 
              variant="outline"
              className="w-full py-6 border-gray-300 hover:bg-gray-50 transition-all duration-200"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show password reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
        
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Set New Password</CardTitle>
          <CardDescription className="text-gray-500 pt-2">
            Create a strong password to secure your account
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {errorMsg && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{errorMsg}</AlertDescription>
              </Alert>
            )}

            {successMsg && (
              <Alert className="animate-in fade-in slide-in-from-top-2 duration-300 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  {successMsg}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                    New Password
                  </Label>
                  {newPassword && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${passwordStrength <= 2 ? 'text-red-600 bg-red-50' : passwordStrength === 3 ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50'}`}>
                      {getStrengthText()}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                    className="pl-10 pr-12 py-6 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="space-y-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= passwordStrength ? getStrengthColor() : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div className={`flex items-center ${newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                        8+ characters
                      </div>
                      <div className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                        Uppercase letter
                      </div>
                      <div className={`flex items-center ${/[a-z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                        Lowercase letter
                      </div>
                      <div className={`flex items-center ${/[0-9]/.test(newPassword) ? 'text-green-600' : ''}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                        Number
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={8}
                    className="pl-10 pr-12 py-6 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-green-600 animate-in fade-in duration-300">
                    ✓ Passwords match
                  </p>
                )}
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600 animate-in fade-in duration-300">
                    ✗ Passwords don't match
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 border border-blue-100">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Password Tips</p>
                  <ul className="mt-1 text-xs text-gray-600 space-y-1">
                    <li>• Use at least 8 characters</li>
                    <li>• Mix uppercase and lowercase letters</li>
                    <li>• Include numbers and special characters</li>
                    <li>• Avoid using personal information</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3">
            <Button 
              type="submit" 
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Reset Password
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              className="w-full py-6 border-gray-300 hover:bg-gray-50 transition-all duration-200"
              onClick={() => navigate("/login")}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;