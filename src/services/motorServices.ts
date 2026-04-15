import { api } from "@/src/lib/api";
import { Motor } from "../types/motor";

export type MotorInsert = Omit<
  Motor,
  "id" | "userId" | "createdAt" | "isSold"
> & {
  isSold?: boolean;
};

export type DashboardStats = {
  totalStok: number;
  totalTerjual: number;
  keuntunganBulanIni: number;
  rataRataMargin: number;
};

// ── Fetch semua motor (belum terjual) ──
export async function fetchMotors(): Promise<Motor[]> {
  const { data } = await api.get<{ data: Motor[] }>("/motors", {
    params: { is_sold: false },
  });
  return data.data;
}

// ── Tambah motor baru (Quick Add) ──
export async function insertMotor(motor: MotorInsert): Promise<Motor> {
  const { data } = await api.post<{ data: Motor }>("/motors", motor);
  return data.data;
}

// ── Lengkapi data motor ──
export async function updateMotor(
  motorId: string,
  updates: Partial<MotorInsert>,
): Promise<Motor> {
  const { data } = await api.patch<{ data: Motor }>(
    `/motors/${motorId}`,
    updates,
  );
  return data.data;
}

// ── Tandai motor terjual ──
export async function markAsSold(motorId: string): Promise<void> {
  await api.patch(`/motors/${motorId}/sold`);
}

// ── Hapus motor ──
export async function deleteMotor(motorId: string): Promise<void> {
  await api.delete(`/motors/${motorId}`);
}

// ── Statistik dashboard ──
export async function fetchDashboardStats(
  month?: string,
): Promise<DashboardStats> {
  const { data } = await api.get<{ data: DashboardStats }>("/dashboard/stats", {
    params: month ? { month } : undefined,
  });
  return data.data;
}
