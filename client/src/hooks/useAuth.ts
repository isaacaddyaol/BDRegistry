import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user');
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
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
