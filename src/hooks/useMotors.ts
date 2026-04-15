import {
  deleteMotor,
  fetchDashboardStats,
  fetchMotors,
  insertMotor,
  markAsSold,
  MotorInsert,
  updateMotor,
} from "@/src/services/motorServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const motorKeys = {
  all: ["motors"] as const,
  stats: (month?: string) => ["motors", "stats", month ?? "current"] as const,
};

export function useMotors() {
  return useQuery({
    queryKey: motorKeys.all,
    queryFn: fetchMotors,
  });
}

export function useDashboardStats(month?: string) {
  return useQuery({
    queryKey: motorKeys.stats(month),
    queryFn: () => fetchDashboardStats(month),
  });
}

export function useInsertMotor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (motor: MotorInsert) => insertMotor(motor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: motorKeys.all });
      queryClient.invalidateQueries({ queryKey: ["motors", "stats"] });
    },
  });
}

export function useUpdateMotor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<MotorInsert>;
    }) => updateMotor(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: motorKeys.all });
      queryClient.invalidateQueries({ queryKey: ["motors", "stats"] });
    },
  });
}

export function useMarkAsSold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (motorId: string) => markAsSold(motorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: motorKeys.all });
      queryClient.invalidateQueries({ queryKey: ["motors", "stats"] });
    },
  });
}

export function useDeleteMotor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (motorId: string) => deleteMotor(motorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: motorKeys.all });
      queryClient.invalidateQueries({ queryKey: ["motors", "stats"] });
    },
  });
}
