import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Xóa dữ liệu cũ
  await prisma.skill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.about.deleteMany();
  await prisma.experience.deleteMany();

  // Thêm projects
  const projects = await prisma.project.createMany({
    data: [
      {
        name: "Personal Portfolio Website",
        url: "https://myportfolio.com",
      },
      {
        name: "E-commerce Platform",
        url: "https://shop-demo.com",
      },
      {
        name: "Blog Platform",
        url: "https://myblog.com",
      },
      {
        name: "Task Management App",
        url: "https://taskmanager.com",
      },
    ],
  });

  console.log(`✅ Created ${projects.count} projects`);

  const about = await prisma.about.createMany({
    data: [
      {
        name: "Phan Huynh Huu Nhan",
        role: "Front End Developer",
        content:
          "Crafting beautiful, performant web experiences with React, Next.js, and modern web technologies. Passionate about building scalable applications with smooth animations and intuitive user interfaces.",
      },
    ],
  });
  console.log(`✅ Created ${about.count} about entries`);

  const experience = await prisma.experience.createMany({
    data: [
      {
        company: "Tech Solutions Inc.",
        startAt: "Jan 2022",
        endAT: "Present",
        role: "Front End Developer",
      },
    ],
  });
  console.log(`✅ Created ${experience.count} experience entries`);

  console.log("🎉 Seeding completed!");

  // Thêm skills
  const skills = await prisma.skill.createMany({
    data: [
      { name: "JavaScript" },
      { name: "TypeScript" },
      { name: "Node.js" },
      { name: "Hono" },
      { name: "React" },
      { name: "Next.js" },
      { name: "TailwindCSS" },
      { name: "Prisma" },
      { name: "PostgreSQL" },
      { name: "Git" },
    ],
  });

  console.log(`✅ Created ${skills.count} skills`);
  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
