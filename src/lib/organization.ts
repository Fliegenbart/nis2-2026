import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type DbClient = Prisma.TransactionClient | typeof prisma;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function createOrganization(name: string, db: DbClient = prisma) {
  const baseSlug = slugify(name) || `org-${randomSuffix()}`;
  let slug = baseSlug;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const existing = await db.organization.findUnique({ where: { slug } });
    if (!existing) {
      return db.organization.create({
        data: { name, slug },
      });
    }
    slug = `${baseSlug}-${randomSuffix()}`;
  }

  return db.organization.create({
    data: { name, slug: `org-${randomSuffix()}` },
  });
}

export async function ensureUserOrganization(params: {
  userId: string;
  organizationId: string | null;
  preferredName: string;
}) {
  if (params.organizationId) {
    return params.organizationId;
  }

  const org = await createOrganization(params.preferredName);
  await prisma.user.update({
    where: { id: params.userId },
    data: { organizationId: org.id },
  });
  return org.id;
}
