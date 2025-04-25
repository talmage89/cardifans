import { verifySecuritySettings } from "./utils/checkSecurity";

/**
 * This file contains initialization code that runs when the server starts.
 * Supabase must be configured not to allow new users to sign up.
 */

export async function init() {
  if (process.env.NODE_ENV === "production") {
    console.log("🚀 Server starting in production mode");
    await verifySecuritySettings().catch((error) => {
      console.error("Failed to verify security settings:", error);
    });
  } else {
    console.log("🚀 Server starting in development mode");
    await verifySecuritySettings().catch((error) => {
      console.error("Failed to verify security settings:", error);
    });
  }
}
