import {
  bulkInsertMotors,
  deleteMotor,
  fetchDashboardStats,
  fetchMotorById,
  fetchMotors,
  insertMotor,
  markAsSold,
  MotorInsert,
  replaceMotorImages,
  uploadMotorImages,
  type LocalMotorImageFile,
  updateMotor,
} from "@/src/services/motorServices";
import type { MotorImage } from "@/src/types/motor";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

export const motorKeys = {
  all: Object.freeze(["motors"] as const),

  detail: (id: string) => Object.freeze(["motors", "detail", id] as const),

  stats: (month?: string) =>
    Object.freeze(["motors", "stats", month ?? "current"] as const),
};

function invalidateMotorQueries(
  queryClient: QueryClient,
  motorId?: string,
) {
  queryClient.invalidateQueries({ queryKey: motorKeys.all });
  queryClient.invalidateQueries({ queryKey: ["motors", "detail"] });
  queryClient.invalidateQueries({ queryKey: ["motors", "stats"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
  queryClient.invalidateQueries({ queryKey: ["analytics"] });

  if (motorId) {
    queryClient.invalidateQueries({ queryKey: motorKeys.detail(motorId) });
  }
}

export function useMotors() {
  return useQuery({
    queryKey: motorKeys.all,
    queryFn: () => fetchMotors(),
  });
}

export function useMotorById(id: string) {
  return useQuery({
    queryKey: motorKeys.detail(id),
    queryFn: () => fetchMotorById(id),
    enabled: !!id,
  });
}

export function useDashboardStats(month?: string) {
  return useQuery({
    queryKey: ["dashboard", "stats", month],
    queryFn: () => fetchDashboardStats(month),
  });
}
export function useInsertMotor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (motor: MotorInsert) => insertMotor(motor),
    onSuccess: () => {
      invalidateMotorQueries(queryClient);
    },
  });
}

export function useBulkInsertMotors() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (motors: MotorInsert[]) => bulkInsertMotors(motors),
    onSuccess: () => {
      invalidateMotorQueries(queryClient);
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
      invalidateMotorQueries(queryClient);
    },
  });
}

export function useMarkAsSold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (motorId: string) => markAsSold(motorId),
    onSuccess: () => {
      invalidateMotorQueries(queryClient);
    },
  });
}

export function useDeleteMotor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (motorId: string) => deleteMotor(motorId),
    onSuccess: () => {
      invalidateMotorQueries(queryClient);
    },
  });
}

type UploadMotorImagesVars = {
  motorId: string;
  files: LocalMotorImageFile[];
  existingImages?: MotorImage[];
};

export function useUploadMotorImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ motorId, files, existingImages }: UploadMotorImagesVars) =>
      uploadMotorImages(motorId, files, existingImages),
    onSuccess: (_, variables) => {
      invalidateMotorQueries(queryClient, variables.motorId);
    },
  });
}

type ReplaceMotorImagesVars = {
  motorId: string;
  images: MotorImage[];
};

export function useReplaceMotorImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ motorId, images }: ReplaceMotorImagesVars) =>
      replaceMotorImages(motorId, images),
    onSuccess: (_, variables) => {
      invalidateMotorQueries(queryClient, variables.motorId);
    },
  });
}
