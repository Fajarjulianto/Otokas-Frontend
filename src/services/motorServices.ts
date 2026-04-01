// import { supabase } from "@/src/lib/supabase";
// import { Motor } from "../types/motor";

// export type MotorInsert = Omit<
//   Motor,
//   "id" | "userId" | "createdAt" | "isSold"
// > & {
//   isSold?: boolean;
// };

// export async function fetchMotors(): Promise<Motor[]> {
//   const { data, error } = await supabase
//     .from("motors")
//     .select("*")
//     .eq("isSold", false)
//     .order("createdAt", { ascending: false });

//   if (error) throw new Error(error.message);
//   return data ?? [];
// }

// export async function insertMotor(motor: MotorInsert): Promise<Motor> {
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) throw new Error("User tidak ditemukan. Silakan login ulang.");

//   const { data, error } = await supabase
//     .from("motors")
//     .insert({ ...motor, userId: user.id, isSold: false })
//     .select()
//     .single();

//   if (error) throw new Error(error.message);
//   return data;
// }

// // ── Tandai motor terjual ──
// export async function markAsSold(motorId: string): Promise<void> {
//   const { error } = await supabase
//     .from("motors")
//     .update({ isSold: true, soldAt: new Date().toISOString() })
//     .eq("id", motorId);

//   if (error) throw new Error(error.message);
// }

// // ── Update data motor (lengkapi data) ──
// export async function updateMotor(
//   motorId: string,
//   updates: Partial<MotorInsert>,
// ): Promise<Motor> {
//   const { data, error } = await supabase
//     .from("motors")
//     .update({ ...updates, isIncomplete: false })
//     .eq("id", motorId)
//     .select()
//     .single();

//   if (error) throw new Error(error.message);
//   return data;
// }

// // ── Statistik dashboard ──
// export async function fetchDashboardStats() {
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) throw new Error("User tidak ditemukan.");

//   const now = new Date();
//   const startOfMonth = new Date(
//     now.getFullYear(),
//     now.getMonth(),
//     1,
//   ).toISOString();

//   const [stokRes, terjualRes, allMotorsRes] = await Promise.all([
//     // Total stok aktif
//     supabase
//       .from("motors")
//       .select("id", { count: "exact", head: true })
//       .eq("userId", user.id)
//       .eq("isSold", false),

//     // Terjual bulan ini
//     supabase
//       .from("motors")
//       .select("buyingPrice, sellingPrice")
//       .eq("userId", user.id)
//       .eq("isSold", true)
//       .gte("soldAt", startOfMonth),

//     supabase
//       .from("motors")
//       .select("buyingPrice, sellingPrice")
//       .eq("userId", user.id)
//       .eq("isSold", true)
//       .not("sellingPrice", "is", null),
//   ]);

//   if (stokRes.error) throw new Error(stokRes.error.message);
//   if (terjualRes.error) throw new Error(terjualRes.error.message);

//   const terjualBulanIni = terjualRes.data ?? [];

//   const keuntungan = terjualBulanIni.reduce((sum, m) => {
//     return sum + ((m.sellingPrice ?? 0) - m.buyingPrice);
//   }, 0);

//   const allSold = allMotorsRes.data ?? [];
//   const rataMargin =
//     allSold.length > 0
//       ? allSold.reduce((sum, m) => {
//           const margin =
//             m.buyingPrice > 0 && m.sellingPrice
//               ? ((m.sellingPrice - m.buyingPrice) / m.buyingPrice) * 100
//               : 0;
//           return sum + margin;
//         }, 0) / allSold.length
//       : 0;

//   return {
//     totalStok: stokRes.count ?? 0,
//     totalTerjual: terjualBulanIni.length,
//     keuntungan,
//     rataMargin: parseFloat(rataMargin.toFixed(1)),
//   };
// }
