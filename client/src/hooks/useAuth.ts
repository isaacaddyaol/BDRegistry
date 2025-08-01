import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['auth-user'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/user');
        const data = await response.json();
        return data;
      } catch (err) {
        return null;
      }
    },
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity
  });

  // Update isAuthenticated when user data changes
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const signOut = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      setIsAuthenticated(false);
      queryClient.clear(); // Clear all queries from the cache
      window.location.href = '/signin';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signOut,
  };
}
