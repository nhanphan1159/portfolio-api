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
import { putSkill } from "./api/put/skill";
import { deleteSkill } from "./api/delete/skill";
import { getProjectDetail } from "./api/get/projectdetail";
import { postExperience } from "./api/post/experience";
import { getEducation } from "./api/get/education";
import { postEducation } from "./api/post/education";
import { putEducation } from "./api/put/education";

const app = new Hono<{ Bindings: IBindings }>();

// Add CORS middleware
app.use("/*", corsMiddleware());

// Initialize Prisma for local development only
// On Cloudflare Workers, prisma will be undefined and API functions will use c.env.portfolio_db
let prisma: PrismaClient | undefined;
// Check if running in local Node.js environment (not Workers)
const isLocalDev =
  typeof process !== "undefined" &&
  process.env &&
  !process.env.CLOUDFLARE_WORKERS;

if (isLocalDev && process.env.DATABASE_URL) {
  // Running in Node.js (local development) with DATABASE_URL
  prisma = new PrismaClient();
}

//get
getHome(app);
getProject(app, prisma);
getSkill(app, prisma);
getAbout(app, prisma);
getExperience(app, prisma);
getContact(app, prisma);
getEducation(app, prisma);

//get detail
getProjectDetail(app, prisma);

//post
postSkill(app, prisma);
postContact(app, prisma);
postProject(app, prisma);
postUpload(app);
postExperience(app, prisma);
postEducation(app, prisma);

//put
putContact(app, prisma);
putProject(app, prisma);
putSkill(app, prisma);
putEducation(app, prisma);

//delete
deleteSkill(app, prisma);

//health check
app.get(ROUTE.HEALTH, (c) => {
  return c.json({ status: "OK" });
});

// Global error handler
app.onError((err, c) => {
  console.error("Global error:", err);
  return c.json(
    {
      error: "Internal Server Error",
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
    500
  );
});

export default app;
