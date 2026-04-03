import { prisma } from "@/lib/prisma";

const DEFAULT_USER_EMAIL = "me@momentum.local";

// Get or create the single default user — no auth needed for personal use
export async function getUser() {
  let user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Me",
        email: DEFAULT_USER_EMAIL,
      },
    });
  }

  return user;
}
