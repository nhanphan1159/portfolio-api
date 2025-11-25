-- Seed data for Portfolio API

-- Insert Projects
INSERT INTO Project (name, url) VALUES
  ('Personal Portfolio Website', 'https://myportfolio.com'),
  ('E-commerce Platform', 'https://shop-demo.com'),
  ('Blog Platform', 'https://myblog.com'),
  ('Task Management App', 'https://taskmanager.com');

-- Insert Skills
INSERT INTO Skill (name) VALUES
  ('JavaScript'),
  ('TypeScript'),
  ('Node.js'),
  ('Hono'),
  ('React'),
  ('Next.js'),
  ('TailwindCSS'),
  ('Prisma'),
  ('PostgreSQL'),
  ('Git');

-- Insert About
INSERT INTO About (name, role, content, createdAt, updatedAt) VALUES
  ('Phan Huynh Huu Nhan', 'Front End Developer', 'Crafting beautiful, performant web experiences with React, Next.js, and modern web technologies. Passionate about building scalable applications with smooth animations and intuitive user interfaces.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
