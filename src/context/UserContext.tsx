'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/auth';

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      fetch('http://localhost:8000/auth/me', {
        credentials: 'include' 
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Not authenticated');
        })
        .then(data => {
          setUser(data);
        })
        .catch(() => {
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }, []);
  
    return (
      <UserContext.Provider value={{ user, setUser, loading }}>
        {children}
      </UserContext.Provider>
    );
  }