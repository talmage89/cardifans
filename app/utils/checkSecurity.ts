import fs from "fs";
import path from "path";
import { verifyRegistrationIsDisabled } from "./auth.server";

/**
 * Utility to check and verify security settings.
 * Run this during development or deployment to ensure your app is secure.
 */
export async function verifySecuritySettings() {
  console.log("🛡️ Verifying security settings...");

  console.log("Checking if user registration is disabled...");
  const isRegistrationDisabled = await verifyRegistrationIsDisabled();

  if (isRegistrationDisabled) {
    console.log("✅ User registration is properly disabled in Supabase.");
  } else {
    console.error("⚠️ WARNING: User registration is still enabled in Supabase!");
    console.error("Please go to Supabase Dashboard > Authentication > Providers and disable sign-ups.");
  }

  try {
    const authServerPath = path.resolve(process.cwd(), "app/utils/auth.server.ts");
    const fileContent = fs.readFileSync(authServerPath, "utf8");

    if (
      fileContent.includes("ALLOWED_ADMIN_EMAILS: string[] = [") &&
      !fileContent.includes("ALLOWED_ADMIN_EMAILS: string[] = []") &&
      !fileContent.includes("ALLOWED_ADMIN_EMAILS: string[] = [\n  // Add your admin")
    ) {
      console.log("✅ Admin emails appear to be configured.");
    } else {
      console.error("⚠️ WARNING: No admin emails seem to be configured!");
      console.error("Please update ALLOWED_ADMIN_EMAILS in auth.server.ts to include your admin emails.");
    }
  } catch (error) {
    console.error("⚠️ Could not verify admin email configuration.");
  }

  console.log("🛡️ Security verification complete.");
}
