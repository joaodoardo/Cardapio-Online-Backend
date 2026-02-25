-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" REAL NOT NULL,
    "precoP" REAL,
    "precoM" REAL,
    "precoG" REAL,
    "precoGG" REAL,
    "precoPComBorda" REAL,
    "precoMComBorda" REAL,
    "precoGComBorda" REAL,
    "precoGGComBorda" REAL,
    "imagemUrl" TEXT,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 1000,
    "categoriaId" INTEGER NOT NULL,
    CONSTRAINT "Item_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("categoriaId", "descricao", "disponivel", "id", "imagemUrl", "nome", "preco", "precoG", "precoGComBorda", "precoGG", "precoGGComBorda", "precoM", "precoMComBorda", "precoP", "precoPComBorda") SELECT "categoriaId", "descricao", "disponivel", "id", "imagemUrl", "nome", "preco", "precoG", "precoGComBorda", "precoGG", "precoGGComBorda", "precoM", "precoMComBorda", "precoP", "precoPComBorda" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
