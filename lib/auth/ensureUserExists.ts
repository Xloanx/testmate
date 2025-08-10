import { prisma } from "@/lib/prisma";

export async function ensureUserExists(
  userId: string,
  email?: string,
  firstName?: string,
  lastName?: string
) {
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Use upsert to avoid race conditions & unique constraint errors
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {}, // no update if user already exists
    create: {
      id: userId,
      email: email || null,
      firstName: firstName || null,
      lastName: lastName || null,
    },
  });

  return user;
}
