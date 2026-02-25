-- CreateTable
CREATE TABLE "Borda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "precoP" REAL NOT NULL,
    "precoM" REAL NOT NULL,
    "precoG" REAL NOT NULL,
    "precoGG" REAL NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "TipoMassa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PedidoItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pedidoId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "tamanho" TEXT,
    "precoFinal" REAL,
    "bordaId" INTEGER,
    "precoBorda" REAL,
    "tipoMassaId" INTEGER,
    CONSTRAINT "PedidoItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PedidoItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PedidoItem_bordaId_fkey" FOREIGN KEY ("bordaId") REFERENCES "Borda" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PedidoItem_tipoMassaId_fkey" FOREIGN KEY ("tipoMassaId") REFERENCES "TipoMassa" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PedidoItem" ("id", "itemId", "pedidoId", "precoFinal", "quantidade", "tamanho") SELECT "id", "itemId", "pedidoId", "precoFinal", "quantidade", "tamanho" FROM "PedidoItem";
DROP TABLE "PedidoItem";
ALTER TABLE "new_PedidoItem" RENAME TO "PedidoItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
