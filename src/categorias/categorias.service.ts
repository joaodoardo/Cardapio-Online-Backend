import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.categoria.findMany({
      select: { id: true, nome: true },
    });
  }

  async findItens(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: {
        itens: {
          where: { disponivel: true },
          orderBy: [{ order: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!categoria) throw new NotFoundException('Categoria não encontrada.');
    return categoria.itens;
  }

  async create(nome: string) {
    if (!nome) throw new BadRequestException('Nome da categoria é obrigatório.');
    return this.prisma.categoria.create({ data: { nome } });
  }

  async update(id: number, nome: string) {
    if (!nome || nome.trim() === '')
      throw new BadRequestException('O nome da categoria é obrigatório.');
    try {
      return await this.prisma.categoria.update({
        where: { id },
        data: { nome: nome.trim() },
      });
    } catch {
      throw new NotFoundException('Categoria não encontrada.');
    }
  }

  async remove(id: number) {
    const itemCount = await this.prisma.item.count({
      where: { categoriaId: id },
    });

    if (itemCount > 0) {
      throw new BadRequestException(
        `Não é possível excluir esta categoria, pois ${itemCount} item(ns) estão associados a ela.`,
      );
    }

    try {
      await this.prisma.categoria.delete({ where: { id } });
      return { message: 'Categoria excluída com sucesso.' };
    } catch {
      throw new NotFoundException('Categoria não encontrada.');
    }
  }
}
