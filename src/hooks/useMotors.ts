// import {
//   fetchDashboardStats,
//   fetchMotors,
//   insertMotor,
//   markAsSold,
//   MotorInsert,
//   updateMotor,
// } from "@/src/services/motorServices";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// export const motorKeys = {
//   all: ["motors"] as const,
//   stats: ["motors", "stats"] as const,
// };

// export function useMotors() {
//   return useQuery({
//     queryKey: motorKeys.all,
//     queryFn: fetchMotors,
//   });
// }

// export function useDashboardStats() {
//   return useQuery({
//     queryKey: motorKeys.stats,
//     queryFn: fetchDashboardStats,
//   });
// }

// export function useInsertMotor() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (motor: MotorInsert) => insertMotor(motor),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: motorKeys.all });
//       queryClient.invalidateQueries({ queryKey: motorKeys.stats });
//     },
//   });
// }

// export function useMarkAsSold() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (motorId: string) => markAsSold(motorId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: motorKeys.all });
//       queryClient.invalidateQueries({ queryKey: motorKeys.stats });
//     },
//   });
// }

// export function useUpdateMotor() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({
//       id,
//       updates,
//     }: {
//       id: string;
//       updates: Partial<MotorInsert>;
//     }) => updateMotor(id, updates),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: motorKeys.all });
//     },
//   });
// }
