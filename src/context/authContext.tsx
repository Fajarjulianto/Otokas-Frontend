// import { supabase } from "@/src/lib/supabase";
// import { Session, User } from "@supabase/supabase-js";
// import React, { createContext, useContext, useEffect, useState } from "react";

// type AuthUser = {
//   id: string;
//   email: string;
//   fullName: string;
// };

// type AuthContextType = {
//   user: AuthUser | null;
//   session: Session | null;
//   isLoading: boolean;
//   signOut: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   session: null,
//   isLoading: true,
//   signOut: async () => {},
// });

// type AuthProviderProps = {
//   children: React.ReactNode;
// };

// // ─── Provider ───
// export function AuthProvider({ children }: AuthProviderProps) {
//   const [session, setSession] = useState<Session | null>(null);
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   function mapUser(supabaseUser: User | null): AuthUser | null {
//     if (!supabaseUser) return null;
//     return {
//       id: supabaseUser.id,
//       email: supabaseUser.email ?? "",
//       fullName: supabaseUser.user_metadata?.fullName ?? "Juragan",
//     };
//   }

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       setUser(mapUser(session?.user ?? null));
//       setIsLoading(false);
//     });

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//       setUser(mapUser(session?.user ?? null));
//       setIsLoading(false);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   async function signOut() {
//     await supabase.auth.signOut();
//     setSession(null);
//     setUser(null);
//   }

//   return (
//     <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // ─── Hook ───
// export function useAuthContext() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuthContext harus dipakai di dalam AuthProvider");
//   }
//   return context;
// }
