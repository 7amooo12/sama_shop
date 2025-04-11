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
    // Return a default state that won't crash the application
    return {
      user: null,
      isLoading: false,
      error: null,
      loginMutation: {
        mutate: () => {},
        mutateAsync: async () => { 
          console.warn('AuthProvider not available');
          return Promise.reject(new Error('AuthProvider not available'));
        },
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
        isIdle: true,
        isSuccess: false,
        data: null,
        reset: () => {},
      },
      logoutMutation: {
        mutate: () => {},
        mutateAsync: async () => {
          console.warn('AuthProvider not available');
          return Promise.reject(new Error('AuthProvider not available'));
        },
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
        isIdle: true,
        isSuccess: false,
        data: null,
        reset: () => {},
      },
      registerMutation: {
        mutate: () => {},
        mutateAsync: async () => {
          console.warn('AuthProvider not available');
          return Promise.reject(new Error('AuthProvider not available'));
        },
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
        isIdle: true,
        isSuccess: false,
        data: null,
        reset: () => {},
      },
    };
  }
  
  return context;
}