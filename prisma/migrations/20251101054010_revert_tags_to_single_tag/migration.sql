-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "date" DATETIME,
    "isMultipleDay" BOOLEAN NOT NULL DEFAULT false,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "time" TEXT,
    "tag" TEXT,
    "place" TEXT,
    "image" TEXT,
    "description" TEXT,
    "totalTickets" INTEGER NOT NULL DEFAULT 100,
    "soldTickets" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("createdAt", "date", "description", "id", "image", "place", "published", "soldTickets", "tag", "time", "title", "totalTickets", "updatedAt") SELECT "createdAt", "date", "description", "id", "image", "place", "published", "soldTickets", "tag", "time", "title", "totalTickets", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
