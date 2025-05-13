// import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
// import { auth } from "../config/firebase";

// const provider = new GoogleAuthProvider();

// // Add the requested scopes for Google's OAuth provider
// provider.addScope('profile');
// provider.addScope('email');

/**
 * Service for handling Google Sign-In
 */
class SignInService {
  /**
   * Sign in with Google using a popup
   * May be blocked by popup blockers
   */
  // async signInWithGooglePopup() {
  //   try {
  //     const result = await signInWithPopup(auth, provider);
  //     // This gives you a Google Access Token
  //     const credential = GoogleAuthProvider.credentialFromResult(result);
  //     const token = credential?.accessToken;
  //     // The signed-in user info
  //     const user = result.user;
      
  //     return {
  //       user,
  //       token,
  //       success: true
  //     };
  //   } catch (error: any) {
  //     return {
  //       error: error.message || 'Google sign in failed',
  //       success: false
  //     };
  //   }
  // }

  /**
   * Sign in with Google using a redirect
   * Better for mobile devices
   */
  // signInWithGoogleRedirect() {
  //   try {
  //     signInWithRedirect(auth, provider);
  //     return { success: true };
  //   } catch (error: any) {
  //     return {
  //       error: error.message || 'Google sign in redirect failed',
  //       success: false
  //     };
  //   }
  // }

  /**
   * Sign in with Google via the backend OAuth2 endpoint
   * Redirects to the backend, which will redirect back after authentication
   */
  signInWithBackend() {
    try {
      window.location.href = 'http://localhost:8000/api/auth/login';
      return { success: true };
    } catch (error: any) {
      return {
        error: 'Failed to redirect to authentication server',
        success: false
      };
    }
  }
}

export default new SignInService();