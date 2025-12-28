import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Retrieves the signed-in user's email address from Clerk.
 * Returns null if not authenticated or no email found.
 */
export async function getUserEmail(userId?: string | null): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return null; // No logged-in user
    }

    const user = await currentUser();
    if (!user) {
      return null;
    }

    // Clerk can have multiple emails; primaryEmailAddress is the main one
    return user.primaryEmailAddress?.emailAddress || null;
  } catch (error) {
    console.error("Error fetching user email:", error);
    return null;
  }
}
