import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";

export const getPrisma = (db: any) => {
  const adapter = new PrismaD1(db);
  return new PrismaClient({ adapter });
};
