import React, { createContext, useContext, ReactNode } from "react";
import { useDeckManagement } from "@/hooks/use-deck-management";

interface AppContextType {
  deckManagement: ReturnType<typeof useDeckManagement>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const deckManagement = useDeckManagement();

  const value: AppContextType = {
    deckManagement,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}; 