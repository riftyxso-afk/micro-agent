import { useAuth } from "@/lib/AuthContext";
import { AppLoading } from "@/components/AppLoading";

export function AppContent({ children }) {
  const { loading } = useAuth();

  // Show loading spinner while auth state is being determined
  // This prevents the app from rendering with incomplete auth data,
  // which can cause blank white pages on mobile after login
  if (loading) {
    return <AppLoading />;
  }

  return children;
}
