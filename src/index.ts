import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { ROUTE } from "./constants/common";

const app = new Hono();
const prisma = new PrismaClient();

app.get(ROUTE.HOME, (c) => c.json({ message: "Welcome to my Portfolio API!" }));

app.get(ROUTE.PROJECTS, async (c) => {
  const projects = await prisma.project.findMany();
  return c.json(projects);
});

app.get(ROUTE.SKILLS, async (c) => {
  const skills = await prisma.skill.findMany();
  return c.json(skills.map((s) => s.name));
});

app.get(ROUTE.ABOUT, async (c) => {
  const about = await prisma.about.findMany();
  return c.json(about);
});

app.get(ROUTE.EXPERIENCE, async (c) => {
  const experience = await prisma.experience.findMany();
  return c.json(experience);
});

app.get(ROUTE.CONTACT, (c) => {
  const contact = { email: "nhan@example.com", phone: "+84 123456789" };
  return c.json(contact);
});

app.post(ROUTE.SKILLS, async (c) => {
  const { name } = await c.req.json();
  const newSkill = await prisma.skill.create({ data: { name } });
  return c.json(newSkill);
});

export default app;
