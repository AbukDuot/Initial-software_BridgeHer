import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

interface User {
  name: string;
  email: string;
  role: "Learner" | "Mentor" | "Admin";
  coursesCompleted: number;
  badges: number;
  posts: number;
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
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | null>(null);


export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within a UserProvider");
  return ctx;
}


export function useUser() {
  return useUserContext();
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      if (typeof window === "undefined") return null;
      const stored = localStorage.getItem("user");
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const login = (email: string, password: string) => {
    if (email && password) {
      const loggedInUser: User = {
        name: email.split("@")[0],
        email,
        role: "Learner",
        coursesCompleted: 2,
        badges: 3,
        posts: 5,
        achievements: [
          {
            title: "Fast Learner",
            description: "Completed your first course in record time!",
            icon: "⚡",
            titleAr: "متعلّمة سريعة",
            descriptionAr: "أنهيتِ دورتك الأولى في وقت قياسي!",
          },
          {
            title: "Community Helper",
            description: "Shared helpful tips in the community.",
            icon: "🤝",
            titleAr: "مساعدة المجتمع",
            descriptionAr: "قدّمتِ نصائح مفيدة في المجتمع.",
          },
        ],
      };

      try {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
      } catch {
        // ignore localStorage write errors
      }
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("user");
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
