import { createContext } from "react";

// value: { status: "loading" | "ready", user: { role, matricule, profile } | null,
//          signInStudent, signInDelegate, signInStaff, signOut }
export const AuthContext = createContext(null);
