import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItensService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.item.findMany({
      include: { categoria: true },
      orderBy: [{ categoriaId: 'asc' }, { order: 'asc' }, { id: 'asc' }],
    });
  }

  async create(data: any) {
    const {
      nome, descricao, preco, categoriaId, imagemUrl,
      precoP, precoM, precoG, precoGG,
      precoPComBorda, precoMComBorda, precoGComBorda, precoGGComBorda,
    } = data;

    if (!nome || !preco || !categoriaId) {
      throw new BadRequestException('Nome, preço e categoria são obrigatórios.');
    }

    try {
      return await this.prisma.item.create({
        data: {
          nome, descricao, preco, imagemUrl,
          precoP, precoM, precoG, precoGG,
          precoPComBorda, precoMComBorda, precoGComBorda, precoGGComBorda,
          categoria: { connect: { id: Number(categoriaId) } },
        },
      });
    } catch {
      throw new BadRequestException(
        'Erro ao criar item. Verifique o ID da categoria.',
      );
    }
  }

  async update(id: number, data: any) {
    const {
      nome, descricao, preco, disponivel, imagemUrl,
      precoP, precoM, precoG, precoGG,
      precoPComBorda, precoMComBorda, precoGComBorda, precoGGComBorda,
    } = data;

    try {
      return await this.prisma.item.update({
        where: { id },
        data: {
          nome, descricao, preco, disponivel, imagemUrl,
          precoP, precoM, precoG, precoGG,
          precoPComBorda, precoMComBorda, precoGComBorda, precoGGComBorda,
        },
      });
    } catch {
      throw new NotFoundException('Item não encontrado.');
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.item.delete({ where: { id } });
      return { message: 'Item excluído com sucesso.' };
    } catch {
      throw new NotFoundException('Item não encontrado ou já excluído.');
    }
  }

  async move(id: number, direction: 'up' | 'down') {
    if (!['up', 'down'].includes(direction)) {
      throw new BadRequestException('Direção inválida. Use "up" ou "down".');
    }

    const itemAtual = await this.prisma.item.findUnique({ where: { id } });
    if (!itemAtual) throw new NotFoundException('Item não encontrado.');

    const todosItens = await this.prisma.item.findMany({
      where: { categoriaId: itemAtual.categoriaId },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });

    const indiceAtual = todosItens.findIndex((item) => item.id === itemAtual.id);

    if (direction === 'up' && indiceAtual === 0) {
      return { message: 'Item já está no topo da lista.', item: itemAtual };
    }

    if (direction === 'down' && indiceAtual === todosItens.length - 1) {
      return { message: 'Item já está no final da lista.', item: itemAtual };
    }

    const indiceVizinho = direction === 'up' ? indiceAtual - 1 : indiceAtual + 1;
    const itemVizinho = todosItens[indiceVizinho];

    const novoOrderAtual = indiceVizinho * 10;
    const novoOrderVizinho = indiceAtual * 10;

    await this.prisma.$transaction([
      this.prisma.item.update({
        where: { id: itemAtual.id },
        data: { order: novoOrderAtual },
      }),
      this.prisma.item.update({
        where: { id: itemVizinho.id },
        data: { order: novoOrderVizinho },
      }),
    ]);

    const itemAtualizado = await this.prisma.item.findUnique({ where: { id } });
    return { message: 'Item movido com sucesso.', item: itemAtualizado };
  }
}
