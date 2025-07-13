import { onAuthStateChanged } from "@/services/googleSignin";
import useAuthStore from "@/store/authStore";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";

export function useAuth() {
  const isLogged = useAuthStore((state) => state.isLogged);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const subscriber = onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (initializing) {
        setInitializing(false);
      }
    });
    return subscriber; // unsubscribe on unmount
  }, [initializing]); // Added initializing to dependency array

  return { user: isLogged ? user : undefined, initializing };
}
