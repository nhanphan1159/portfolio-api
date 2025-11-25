import { Hono } from "hono";
import { cors } from "hono/cors";
import { PrismaClient } from "@prisma/client";
import { ROUTE } from "./constants/common";

const app = new Hono();

// Add CORS middleware
app.use(
  "/*",
  cors({
    origin: "*", // Allow all origins
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Initialize Prisma for local development
const prisma = new PrismaClient();

app.get(`${ROUTE.API}${ROUTE.HOME}`, (c) =>
  c.json({ message: "Welcome to my Portfolio API!" })
);

app.get(`${ROUTE.API}${ROUTE.PROJECTS}`, async (c) => {
  const projects = await prisma.project.findMany();
  return c.json(projects);
});

app.get(`${ROUTE.API}${ROUTE.SKILLS}`, async (c) => {
  const skills = await prisma.skill.findMany();
  return c.json(skills.map((s: { name: string }) => s.name));
});

app.get(`${ROUTE.API}${ROUTE.ABOUT}`, async (c) => {
  const about = await prisma.about.findFirst();
  return c.json(about);
});

app.get(`${ROUTE.API}${ROUTE.EXPERIENCE}`, async (c) => {
  const experience = await prisma.experience.findMany();
  return c.json(experience);
});

app.get(`${ROUTE.API}${ROUTE.CONTACT}`, (c) => {
  const contact = { email: "nhan@example.com", phone: "+84 123456789" };
  return c.json(contact);
});

app.post(`${ROUTE.API}${ROUTE.SKILLS}`, async (c) => {
  const { name } = await c.req.json();
  const newSkill = await prisma.skill.create({ data: { name } });
  return c.json(newSkill);
});

export default app;
