import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "@/config";

// Define user shape
type User = {
  role: number;
  token: string;
  username: string;
  expiry: number;
  isKYCVerified?: boolean;
};

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

// Create context with proper defaults
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  currentUser: null,
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const navigate = useNavigate();
  const [logoutTimer, setLogoutTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto logout when token expires
  const scheduleLogout = (expiry: number) => {
    // Clear any existing logout timer
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }

    const timeout = expiry - Date.now();
    
    if (timeout > 0) {
      const timer = setTimeout(() => {
        logout();
      }, timeout);
      setLogoutTimer(timer);
    } else {
      // Token already expired
      logout();
    }
  };

  // Initialize auth state from localStorage - runs once on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem("user");
        
        if (savedUser) {
          const parsedUser: User = JSON.parse(savedUser);
          
          // Check if token is still valid
          if (parsedUser.expiry && parsedUser.expiry > Date.now()) {
            setUser(parsedUser);
            scheduleLogout(parsedUser.expiry);
          } else {
            // Token expired, clean up
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        // Always set loading to false after initialization
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
    };
  }, []); // Empty dependency array - runs once on mount

  // Cookie consent effect
  useEffect(() => {
    try {
      const consent = JSON.parse(localStorage.getItem("cookieConsent") || "{}");
      if (consent.analytics) {
        // Initialize analytics
        console.log("Analytics initialized");
      }
    } catch (error) {
      console.error("Error reading cookie consent:", error);
    }
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();

      // Decode JWT expiry (standard `exp` claim)
      let expiry: number;
      try {
        const payload = JSON.parse(atob(data.access_token.split(".")[1]));
        expiry = payload.exp * 1000; // convert to ms
      } catch {
        // Fallback: set expiry to 24 hours from now
        expiry = Date.now() + 24 * 60 * 60 * 1000;
      }

      const userData: User = {
        token: data.access_token,
        role: data.role,
        username: data.username,
        expiry,
        isKYCVerified: data.isKYCVerified || false,
      };

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Update state
      setUser(userData);

      // Schedule auto logout
      scheduleLogout(expiry);

      // Redirect based on role
      if (data.role === 3) {
        navigate("/admin/dashboard");
      } else if (data.role === 2) {
        navigate("/seller/dashboard");
      } else {
        navigate("/account");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Re-throw to handle in the component
    }
  };

  // Logout function
  const logout = () => {
    // Clear logout timer
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }

    // Clear localStorage
    localStorage.removeItem("user");
    
    // Clear state
    setUser(null);
    
    // Navigate to login
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        currentUser: user,
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};