// src/auth/googleSignIn.ts
import * as supabase from "@/services/supabase";
import { authStore } from "@/store/authStore";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  GoogleSignin,
  NativeModuleError,
  statusCodes,
} from "@react-native-google-signin/google-signin";

// Configure Google Sign-In
// IMPORTANT: Get this Web Client ID from your Firebase console (Authentication > Sign-in method > Google > Web SDK configuration)
// or from your google-services.json (client[0].oauth_client[?(@.client_type==3)].client_id)
// Ensure you replace 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com' with your actual Web Client ID
GoogleSignin.configure({
  webClientId:
    "2622477593-j0j4skanjgpn8fcu6lqr7kv63mvsf9s6.apps.googleusercontent.com",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"], // what API you want to access on behalf of the user, default is email and profile
});

export const signInWithGoogle =
  async (): Promise<FirebaseAuthTypes.User | null> => {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Get the user details from Google Sign-In
      const googleSignInUser = await GoogleSignin.signIn();
      const idToken = googleSignInUser.data?.idToken; // Destructure from the explicitly typed object
      if (!idToken) {
        throw new Error("Google Sign-In failed to return an ID token.");
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      await supabase.signInWithGoogle(idToken);

      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(
        googleCredential
      );

      setTimeout(() => {
        authStore.getState().setIsLogged(true);
      }, 50);

      return userCredential.user;
    } catch (error: any) {
      console.log("[ERROR] ", error);
      // It's common to type 'error' as 'any' in catch blocks, or use a more specific type if known
      const gError = error as NativeModuleError; // Cast to NativeModuleError for status codes
      if (gError.code === String(statusCodes.SIGN_IN_CANCELLED)) {
        // user cancelled the login flow
      } else if (gError.code === String(statusCodes.IN_PROGRESS)) {
        // operation (e.g. sign in) is in progress already
      } else if (
        gError.code === String(statusCodes.PLAY_SERVICES_NOT_AVAILABLE)
      ) {
        // play services not available or outdated
      } else {
        // some other error happened
        console.error(
          "Google Sign-In Error:",
          gError.code,
          gError.message,
          gError
        );
      }
      return null;
    }
  };

export const signOutGoogle = async (): Promise<void> => {
  try {
    try {
      await GoogleSignin.revokeAccess(); // Revoke access to prevent auto-sign-in on next attempt
      await GoogleSignin.signOut();
    } catch (e) {}
    await auth().signOut(); // Sign out from Firebase
    console.log("User signed out from Google and Firebase");
  } catch (error: any) {
    console.error("Google Sign-Out Error", error);
  }
};

// Optional: Get current Firebase user
export const getCurrentFirebaseUser = (): FirebaseAuthTypes.User | null => {
  return auth().currentUser;
};

// Optional: Listen to auth state changes
export const onAuthStateChanged = (
  callback: (user: FirebaseAuthTypes.User | null) => void
): (() => void) => {
  // Returns an unsubscribe function
  return auth().onAuthStateChanged(callback);
};
