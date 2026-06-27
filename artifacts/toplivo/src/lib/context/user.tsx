import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuthUser, setDefaultHeader } from "@workspace/api-client-react";
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
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    const initData: string = tg?.initData ?? "";

    // @ts-ignore
    const tgUser = tg?.initDataUnsafe?.user || {
      id: 12345,
      first_name: "Иван",
      last_name: "Иванов",
      username: "ivanov",
    };

    // Set the initData header globally on the API client so all
    // subsequent requests (vouchers, etc.) are authenticated.
    if (initData) {
      setDefaultHeader("x-telegram-initdata", initData);
    }

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
  }, []);

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
