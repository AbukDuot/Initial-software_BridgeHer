import { createContext, useState } from "react";
import type { ReactNode } from "react";

interface User {
  name: string;
  email: string;
  role: "Learner" | "Mentor" | "Admin";
  coursesCompleted: number;
  badges: number;
  posts: number;
  phone?: string;
  bio?: string;
  location?: string;
  profile_pic?: string;
  achievements: {
    title: string;
    titleAr?: string;
    description: string;
    descriptionAr?: string;
    icon: string;
  }[];
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return null;
      const token = localStorage.getItem("token");
      const stored = localStorage.getItem("user");
      if (token && stored) {
        const parsed = JSON.parse(stored);
        console.log('👤 UserContext initialized with:', parsed);
        return parsed as User;
      }
      console.log('👤 UserContext: No user found in localStorage');
      return null;
    } catch (err) {
      console.error('👤 UserContext initialization error:', err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  });

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, user: userData } = data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch {
      // ignore
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
