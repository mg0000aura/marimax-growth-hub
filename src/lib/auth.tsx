import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { firebaseEnabled, getFirebaseAuth } from "./firebase";

export type SessionUser = { id: string; name: string; email: string };

type AuthValue = {
  user: SessionUser | null;
  loading: boolean;
  usingFirebase: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

const LOCAL_USERS = "marimax:localUsers";
const LOCAL_SESSION = "marimax:session";

type LocalAccount = SessionUser & { password: string };

function readAccounts(): LocalAccount[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_USERS) ?? "[]") as LocalAccount[];
  } catch {
    return [];
  }
}

function writeAccounts(list: LocalAccount[]) {
  window.localStorage.setItem(LOCAL_USERS, JSON.stringify(list));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firebaseEnabled) {
      const auth = getFirebaseAuth();
      if (!auth) {
        setLoading(false);
        return;
      }
      // A sessão fica salva no dispositivo (browserLocalPersistence).
      return onAuthStateChanged(auth, (u: User | null) => {
        setUser(
          u
            ? { id: u.uid, name: u.displayName ?? u.email?.split("@")[0] ?? "Cliente", email: u.email ?? "" }
            : null,
        );
        setLoading(false);
      });
    }
    try {
      const raw = window.localStorage.getItem(LOCAL_SESSION);
      if (raw) setUser(JSON.parse(raw) as SessionUser);
    } catch {
      /* ignore */
    }
    setLoading(false);
    return;
  }, []);

  const value = useMemo<AuthValue>(() => {
    function persistLocal(u: SessionUser | null) {
      if (u) window.localStorage.setItem(LOCAL_SESSION, JSON.stringify(u));
      else window.localStorage.removeItem(LOCAL_SESSION);
      setUser(u);
    }

    return {
      user,
      loading,
      usingFirebase: firebaseEnabled,
      async signUp(name, email, password) {
        const auth = getFirebaseAuth();
        if (auth) {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: name });
          setUser({ id: cred.user.uid, name, email });
          return;
        }
        const accounts = readAccounts();
        if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("Já existe uma conta com este e-mail.");
        }
        const account: LocalAccount = {
          id: Math.random().toString(36).slice(2),
          name,
          email,
          password,
        };
        writeAccounts([...accounts, account]);
        persistLocal({ id: account.id, name, email });
      },
      async signIn(email, password) {
        const auth = getFirebaseAuth();
        if (auth) {
          await signInWithEmailAndPassword(auth, email, password);
          return;
        }
        const account = readAccounts().find(
          (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
        );
        if (!account) throw new Error("E-mail ou senha inválidos.");
        persistLocal({ id: account.id, name: account.name, email: account.email });
      },
      async resetPassword(email) {
        const auth = getFirebaseAuth();
        if (auth) {
          await sendPasswordResetEmail(auth, email);
          return;
        }
        throw new Error(
          "A recuperação de senha por e-mail exige o Firebase configurado com a chave da API.",
        );
      },
      async logout() {
        const auth = getFirebaseAuth();
        if (auth) {
          await signOut(auth);
          return;
        }
        persistLocal(null);
      },
      async updateName(name) {
        const auth = getFirebaseAuth();
        if (auth?.currentUser) {
          await updateProfile(auth.currentUser, { displayName: name });
          setUser((u) => (u ? { ...u, name } : u));
          return;
        }
        if (!user) return;
        const accounts = readAccounts().map((a) => (a.id === user.id ? { ...a, name } : a));
        writeAccounts(accounts);
        persistLocal({ ...user, name });
      },
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
