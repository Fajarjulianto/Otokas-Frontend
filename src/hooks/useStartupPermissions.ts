import {
    hasCompletedStartupPermissions,
    markStartupPermissionsCompleted,
    runStartupPermissions,
    type StartupPermissionStatus,
} from "@/src/services/startupPermissions";
import { useCallback, useEffect, useState } from "react";

type StartupPermissionState = {
  isChecking: boolean;
  isRequesting: boolean;
  isCompleted: boolean;
  status: StartupPermissionStatus | null;
  error: string | null;
};

const initialState: StartupPermissionState = {
  isChecking: true,
  isRequesting: false,
  isCompleted: false,
  status: null,
  error: null,
};

export function useStartupPermissions() {
  const [state, setState] = useState<StartupPermissionState>(initialState);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const isCompleted = await hasCompletedStartupPermissions();
      if (!mounted) return;
      setState((prev) => ({ ...prev, isChecking: false, isCompleted }));
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const requestPermissions = useCallback(async () => {
    setState((prev) => ({ ...prev, isRequesting: true, error: null }));

    try {
      const status = await runStartupPermissions();
      await markStartupPermissionsCompleted();
      setState({
        isChecking: false,
        isRequesting: false,
        isCompleted: true,
        status,
        error: null,
      });
      return status;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal memproses izin aplikasi.";
      setState((prev) => ({
        ...prev,
        isChecking: false,
        isRequesting: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const skipPermissions = useCallback(async () => {
    await markStartupPermissionsCompleted();
    setState((prev) => ({ ...prev, isCompleted: true, isChecking: false }));
  }, []);

  return {
    ...state,
    requestPermissions,
    skipPermissions,
  };
}
