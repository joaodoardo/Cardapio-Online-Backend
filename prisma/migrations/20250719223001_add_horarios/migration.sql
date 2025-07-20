-- CreateTable
CREATE TABLE "Horarios" (
    "diaDaSemana" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "aberto" BOOLEAN NOT NULL,
    "inicio" TEXT NOT NULL,
    "fim" TEXT NOT NULL
);
