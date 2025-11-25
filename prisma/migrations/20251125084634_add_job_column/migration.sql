/*
  Warnings:

  - Added the required column `job` to the `Experience` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Experience" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startAt" TEXT NOT NULL,
    "endAT" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Experience" ("company", "createdAt", "endAT", "id", "role", "startAt", "updatedAt") SELECT "company", "createdAt", "endAT", "id", "role", "startAt", "updatedAt" FROM "Experience";
DROP TABLE "Experience";
ALTER TABLE "new_Experience" RENAME TO "Experience";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
