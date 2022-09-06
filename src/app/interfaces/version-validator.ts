export interface VersionValidator {
  ios: PlatformData;
  android: PlatformData;
  maintenanceMode: boolean;
}

interface PlatformData {
  latest: string;
  minimum: string;
  url: string;
}
