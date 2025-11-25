import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { ROUTE } from "./constants/common";

type Bindings = {
  portfolio_db: any; // D1Database type from @cloudflare/workers-types
};

const app = new Hono<{ Bindings: Bindings }>();

// Initialize Prisma with D1
const getPrisma = (db: any) => {
  const adapter = new PrismaD1(db);
  return new PrismaClient({ adapter });
};

app.get(ROUTE.HOME, (c) => c.json({ message: "Welcome to my Portfolio API!" }));

app.get(ROUTE.PROJECTS, async (c) => {
  const prisma = getPrisma(c.env.portfolio_db);
  const projects = await prisma.project.findMany();
  return c.json(projects);
});

app.get(ROUTE.SKILLS, async (c) => {
  const prisma = getPrisma(c.env.portfolio_db);
  const skills = await prisma.skill.findMany();
  return c.json(skills.map((s: { name: string }) => s.name));
});

app.get(ROUTE.ABOUT, async (c) => {
  const prisma = getPrisma(c.env.portfolio_db);
  const about = await prisma.about.findMany();
  return c.json(about);
});

app.get(ROUTE.EXPERIENCE, async (c) => {
  const prisma = getPrisma(c.env.portfolio_db);
  const experience = await prisma.experience.findMany();
  return c.json(experience);
});

app.get(ROUTE.CONTACT, (c) => {
  const contact = { email: "nhan@example.com", phone: "+84 123456789" };
  return c.json(contact);
});

app.post(ROUTE.SKILLS, async (c) => {
  const prisma = getPrisma(c.env.portfolio_db);
  const { name } = await c.req.json();
  const newSkill = await prisma.skill.create({ data: { name } });
  return c.json(newSkill);
});

export default app;
