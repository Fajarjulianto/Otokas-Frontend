import { STARTUP_PERMISSIONS_KEY } from "@/src/constants/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera, PermissionStatus } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

export type StartupPermissionStep = "camera" | "media";

export type StartupPermissionStatus = {
  camera: PermissionStatus | null;
  media: ImagePicker.PermissionStatus | null;
};

const STARTUP_PERMISSIONS_VALUE = "completed";

export async function hasCompletedStartupPermissions(): Promise<boolean> {
  return (
    (await AsyncStorage.getItem(STARTUP_PERMISSIONS_KEY)) ===
    STARTUP_PERMISSIONS_VALUE
  );
}

export async function markStartupPermissionsCompleted(): Promise<void> {
  await AsyncStorage.setItem(
    STARTUP_PERMISSIONS_KEY,
    STARTUP_PERMISSIONS_VALUE,
  );
}

export async function resetStartupPermissions(): Promise<void> {
  await AsyncStorage.removeItem(STARTUP_PERMISSIONS_KEY);
}

export async function getStartupPermissionStatus(): Promise<StartupPermissionStatus> {
  const [camera, media] = await Promise.all([
    Camera.getCameraPermissionsAsync(),
    ImagePicker.getMediaLibraryPermissionsAsync(),
  ]);

  return {
    camera: camera.status,
    media: media.status,
  };
}

export async function requestStartupPermissions(): Promise<StartupPermissionStatus> {
  const camera = await Camera.requestCameraPermissionsAsync();
  const media = await ImagePicker.requestMediaLibraryPermissionsAsync();

  return {
    camera: camera.status,
    media: media.status,
  };
}

export async function runStartupPermissions(): Promise<StartupPermissionStatus> {
  const current = await getStartupPermissionStatus();

  const camera =
    current.camera === PermissionStatus.GRANTED
      ? current.camera
      : (await Camera.requestCameraPermissionsAsync()).status;

  const media =
    current.media === ImagePicker.PermissionStatus.GRANTED
      ? current.media
      : (await ImagePicker.requestMediaLibraryPermissionsAsync()).status;

  return { camera, media };
}
