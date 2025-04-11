import { useAuth } from './use-auth';

// Safe auth hook that can be used even when AuthProvider is not available
export function useAuthSafe() {
  try {
    return useAuth();
  } catch (error) {
    // Return a fallback when auth context is not available
    return {
      user: null,
      isLoading: false,
      error: null,
      loginMutation: {
        mutate: () => {},
        isPending: false,
      },
      logoutMutation: {
        mutate: () => {},
        isPending: false,
      },
      registerMutation: {
        mutate: () => {},
        isPending: false,
      },
    };
  }
}