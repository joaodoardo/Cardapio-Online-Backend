-- CreateTable
CREATE TABLE "SessaoMesa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mesa" TEXT NOT NULL,
    "abertaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechadaEm" DATETIME
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomeCliente" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER NOT NULL DEFAULT 1,
    "metodoPagamento" TEXT,
    "trocoPara" REAL,
    "taxaEntrega" REAL,
    "sessaoMesaId" INTEGER,
    CONSTRAINT "Pedido_sessaoMesaId_fkey" FOREIGN KEY ("sessaoMesaId") REFERENCES "SessaoMesa" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pedido" ("criadoEm", "endereco", "id", "metodoPagamento", "nomeCliente", "observacoes", "status", "taxaEntrega", "telefone", "trocoPara") SELECT "criadoEm", "endereco", "id", "metodoPagamento", "nomeCliente", "observacoes", "status", "taxaEntrega", "telefone", "trocoPara" FROM "Pedido";
DROP TABLE "Pedido";
ALTER TABLE "new_Pedido" RENAME TO "Pedido";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
