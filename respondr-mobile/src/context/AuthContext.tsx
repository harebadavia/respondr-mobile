import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from '../firebase';
import { apiAuthRequest, apiRequest } from '../services/api';
import { ensurePushRegistration, unregisterStoredPushToken } from '../services/push';
import type { BackendUser } from '../types';

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
};

type AuthContextValue = {
  firebaseUser: User | null;
  backendUser: BackendUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshBackendUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function hydrateBackendUser() {
  return apiAuthRequest<BackendUser>('/auth/me');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setFirebaseUser(nextUser);

      if (!nextUser) {
        setBackendUser(null);
        setLoading(false);
        return;
      }

      try {
        const user = await hydrateBackendUser();
        setBackendUser(user);
        try {
          await ensurePushRegistration();
        } catch {
          // Push registration must never block authenticated app use.
        }
      } catch {
        setBackendUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = await hydrateBackendUser();
    setBackendUser(user);
    try {
      await ensurePushRegistration();
    } catch {
      // Push registration must never block authenticated app use.
    }
  };

  const register = async ({ email, password, firstName, lastName, phoneNumber }: RegisterPayload) => {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const firebaseUserRef = credential.user;

    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firebase_uid: firebaseUserRef.uid,
        email: firebaseUserRef.email,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber?.trim() || null,
      }),
    });

    const user = await hydrateBackendUser();
    setBackendUser(user);
    try {
      await ensurePushRegistration();
    } catch {
      // Push registration must never block authenticated app use.
    }
  };

  const logout = async () => {
    try {
      await unregisterStoredPushToken();
    } catch {
      // Ignore token cleanup failures on logout.
    }
    await signOut(auth);
    setBackendUser(null);
    setFirebaseUser(null);
  };

  const refreshBackendUser = async () => {
    const user = await hydrateBackendUser();
    setBackendUser(user);
  };

  const value = useMemo(
    () => ({
      firebaseUser,
      backendUser,
      loading,
      isAuthenticated: Boolean(firebaseUser && backendUser),
      login,
      register,
      logout,
      refreshBackendUser,
    }),
    [firebaseUser, backendUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
