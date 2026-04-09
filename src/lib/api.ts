// import { supabase } from "@/src/lib/supabase";
// import axios from "axios";

// export const api = axios.create({
//   baseURL: process.env.EXPO_PUBLIC_API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 10000,
// });

// api.interceptors.request.use(async (config) => {
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   if (session?.access_token) {
//     config.headers.Authorization = `Bearer ${session.access_token}`;
//   }
//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const status = error.response?.status;
//     const message = error.response?.data.error?.message ?? error.message;

//     if (status === 401) {
//       const { error: refreshError } = await supabase.auth.refreshSession();
//       if (refreshError) {
//         await supabase.auth.signOut();
//       }
//     }
//     return Promise.reject(new Error(message));
//   },
// );
