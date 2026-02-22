import Constants from "expo-constants";
import { Platform } from "react-native";

export function getApiUrl(path: string): string {
  if (Platform.OS === "web") {
    const domain = Constants.expoConfig?.extra?.EXPO_PUBLIC_DOMAIN;
    if (domain) {
      return `https://${domain}${path}`;
    }
    return `http://localhost:5000${path}`;
  }

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) {
    return `https://${domain}${path}`;
  }

  return `http://localhost:5000${path}`;
}
