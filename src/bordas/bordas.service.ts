import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BordasService {
  constructor(private readonly prisma: PrismaService) {}

  async findDisponiveis() {
    return this.prisma.borda.findMany({
      where: { disponivel: true },
      orderBy: { nome: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.borda.findMany({ orderBy: { nome: 'asc' } });
  }

  async create(data: any) {
    const { nome, precoP, precoM, precoG, precoGG } = data;

    if (
      !nome ||
      precoP === undefined ||
      precoM === undefined ||
      precoG === undefined ||
      precoGG === undefined
    ) {
      throw new BadRequestException(
        'Nome e preços para todos os tamanhos são obrigatórios.',
      );
    }

    return this.prisma.borda.create({
      data: {
        nome,
        precoP: parseFloat(precoP),
        precoM: parseFloat(precoM),
        precoG: parseFloat(precoG),
        precoGG: parseFloat(precoGG),
      },
    });
  }

  async update(id: number, data: any) {
    const { nome, precoP, precoM, precoG, precoGG, disponivel } = data;

    try {
      return await this.prisma.borda.update({
        where: { id },
        data: {
          nome,
          precoP: parseFloat(precoP),
          precoM: parseFloat(precoM),
          precoG: parseFloat(precoG),
          precoGG: parseFloat(precoGG),
          disponivel,
        },
      });
    } catch {
      throw new NotFoundException('Borda não encontrada.');
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.borda.delete({ where: { id } });
      return { message: 'Borda excluída com sucesso.' };
    } catch {
      throw new NotFoundException('Borda não encontrada.');
    }
  }
}
