import { useContext } from "react";
import { AuthContext } from "./use-auth";

/**
 * A safe version of useAuth that returns a default state when outside of AuthProvider
 * instead of throwing an error. This is useful in components that might render
 * before AuthProvider is available.
 */
export function useAuthSafe() {
  const context = useContext(AuthContext);
  
  if (!context) {
    // Return a default state that won't crash the application but will show appropriate errors
    const createMutation = (name: string) => ({
      mutate: () => {
        console.error(`${name} failed: AuthProvider not initialized. Please refresh the page or contact support if the problem persists.`);
      },
      mutateAsync: async () => {
        const error = new Error(`${name} failed: AuthProvider not initialized. Please refresh the page or contact support if the problem persists.`);
        console.error(error);
        return Promise.reject(error);
      },
      isPending: false,
      isError: true,
      error: new Error('AuthProvider not initialized'),
      status: 'error',
      isIdle: false,
      isSuccess: false,
      data: null,
      reset: () => {},
    });

    return {
      user: null,
      isLoading: true, // Show loading state to prevent immediate error displays
      error: new Error('Authentication system is initializing. Please wait...'),
      loginMutation: createMutation('Login'),
      logoutMutation: createMutation('Logout'),
      registerMutation: createMutation('Registration'),
    };

  }
  
  return context;
}