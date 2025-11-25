/*
  Warnings:

  - Added the required column `updatedAt` to the `About` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_About" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_About" ("content", "id", "name", "role") SELECT "content", "id", "name", "role" FROM "About";
DROP TABLE "About";
ALTER TABLE "new_About" RENAME TO "About";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
