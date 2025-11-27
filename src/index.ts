import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { ROUTE } from "./constants/common";
import { corsMiddleware } from "./middleware";
import { getHome } from "./api/get/home";
import { getProject } from "./api/get/project";
import { getSkill } from "./api/get/skill";
import { getAbout } from "./api/get/about";
import { getExperience } from "./api/get/experience";
import { getContact } from "./api/get/contact";
import { postSkill } from "./api/post/skill";
import { postContact } from "./api/post/contact";
import { postProject } from "./api/post/project";
import { postUpload } from "./api/post/upload";
import { putContact } from "./api/put/contact";
import { putProject } from "./api/put/project";

const app = new Hono<{ Bindings: IBindings }>();

// Add CORS middleware
app.use("/*", corsMiddleware());

// Initialize Prisma for local development only
// On Cloudflare Workers, prisma will be undefined and API functions will use c.env.portfolio_db
let prisma: PrismaClient | undefined;
if (typeof process !== "undefined" && process.env) {
  // Running in Node.js (local development)
  prisma = new PrismaClient();
}

//get
getHome(app);
getProject(app, prisma);
getSkill(app, prisma);
getAbout(app, prisma);
getExperience(app, prisma);
getContact(app, prisma);

//post
postSkill(app, prisma);
postContact(app, prisma);
postProject(app, prisma);
postUpload(app);

//put
putContact(app, prisma);
putProject(app, prisma);

//health check
app.get(ROUTE.HEALTH, (c) => {
  return c.json({ status: "OK" });
});

export default app;
