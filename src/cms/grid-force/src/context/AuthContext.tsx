import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { me } from '../services/login';
import type { Player } from '../../models';

// Interfața pentru obiectul utilizator

// Interfața pentru context
interface AuthContextType {
  Player: Player | null;
  setPlayer: (Player: Player | null) => void;
  isLoading: boolean;
}

// Crearea contextului cu valoare inițială null
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Providerul
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [Player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const Player = await me();
        if (Player) {
          setPlayer(Player);
        }
      } catch (error) {
        console.error("Eroare la preluarea Playerului:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayer();
  }, []);

  return (
    <AuthContext.Provider value={{ Player, setPlayer, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Hook-ul personalizat cu verificare de tip
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth trebuie utilizat în interiorul unui AuthProvider");
  }
  return context;
};