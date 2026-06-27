import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuthUser } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react/src/generated/api.schemas";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const authMutation = useAuthUser();

  useEffect(() => {
    // Get mock Telegram data or fallback
    // @ts-ignore
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user || {
      id: 12345,
      first_name: "Иван",
      last_name: "Иванов",
      username: "ivanov",
    };

    authMutation.mutate(
      {
        data: {
          telegramId: tgUser.id,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
        },
      },
      {
        onSuccess: (data) => {
          setUser(data);
        },
      }
    );
  }, []); // Only run once on mount

  return (
    <UserContext.Provider value={{ user, isLoading: authMutation.isPending }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
