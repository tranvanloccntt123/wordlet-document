import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Helper function for Base64 encoding/decoding
const base64Encode = (data: any) => Buffer.from(data).toString("base64");
const base64Decode = (str: any) => Buffer.from(str, "base64");

// Simple XOR obfuscation (not secure for production)
function xorObfuscate(data: any, key: any, iv: any) {
  const dataBytes = Buffer.from(data);
  const keyBytes = Buffer.from(key, "base64");
  const ivBytes = Buffer.from(iv);
  const result = Buffer.alloc(dataBytes.length);
  for (let i = 0; i < dataBytes.length; i++) {
    result[i] =
      dataBytes[i] ^
      keyBytes[i % keyBytes.length] ^
      ivBytes[i % ivBytes.length];
  }
  return result;
}

// Generate a 32-byte key using SHA256
async function generateKey(userIdentifier: string) {
  const input = userIdentifier || "default-user" + Math.random().toString();
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input, {
    encoding: Crypto.CryptoEncoding.BASE64,
  });
}

type JWTTokenStore = {
  social: string | null;
  setSocialToken: (_: string) => void;
};

export const authStore = create<JWTTokenStore>()(
  persist(
    immer((set) => ({
      social: null,
      async setSocialToken(token) {
        try {
          const key = await generateKey("");
          const iv = Crypto.getRandomBytes(16); // 16-byte IV
          const obfuscated = xorObfuscate(token, key, iv);
          set({});
        } catch (error) {
          console.error("Obfuscation error:", error);
        }
      },
    })),
    {
      name: "auth-storage", // Unique name for this store in localStorage
      storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage for React Native
    }
  )
);

const useAuthStore = authStore;

export default useAuthStore;
