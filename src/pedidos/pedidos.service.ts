import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    const {
      nomeCliente, telefone, endereco, observacoes,
      itens, metodoPagamento, trocoPara, taxaEntrega,
    } = data;

    if (
      !nomeCliente ||
      !telefone ||
      !endereco ||
      !Array.isArray(itens) ||
      itens.length === 0 ||
      !metodoPagamento
    ) {
      throw new BadRequestException(
        'Dados do pedido inválidos. Informações do cliente, itens e método de pagamento são obrigatórios.',
      );
    }

    // Detecta pedido de mesa e gerencia a sessão automaticamente
    let sessaoMesaId = null;
    const mesaMatch = endereco.match(/^Mesa:\s*(.+)$/i);
    if (mesaMatch) {
      const mesaNumero = mesaMatch[1].trim();
      let sessao = await this.prisma.sessaoMesa.findFirst({
        where: { mesa: mesaNumero, fechadaEm: null },
      });
      if (!sessao) {
        sessao = await this.prisma.sessaoMesa.create({
          data: { mesa: mesaNumero },
        });
      }
      sessaoMesaId = sessao.id;
    }

    const pedido = await this.prisma.pedido.create({
      data: {
        nomeCliente,
        telefone,
        endereco,
        observacoes,
        metodoPagamento,
        taxaEntrega: taxaEntrega || 0,
        trocoPara: trocoPara ? parseFloat(trocoPara) : null,
        sessaoMesaId,
        itens: {
          create: itens.map((item: any) => ({
            itemId: item.itemId,
            quantidade: item.quantidade,
            tamanho: item.tamanho,
            precoFinal: item.precoFinal,
            bordaId: item.bordaId || null,
            precoBorda: item.precoBorda ? parseFloat(item.precoBorda) : null,
            tipoMassaId: item.tipoMassaId || null,
          })),
        },
      },
    });

    return { message: 'Pedido realizado com sucesso!', pedidoId: pedido.id };
  }

  async findByTelefone(telefone: string) {
    const pedidos = await this.prisma.pedido.findMany({
      where: { telefone },
      include: {
        itens: {
          include: {
            item: { select: { nome: true } },
            borda: true,
            tipoMassa: true,
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
      take: 10,
    });

    if (!pedidos || pedidos.length === 0) {
      throw new NotFoundException('Nenhum pedido encontrado para este número.');
    }

    return pedidos;
  }

  async findAtivos() {
    return this.prisma.pedido.findMany({
      where: { status: { in: [1, 2, 3] } },
      include: {
        itens: { include: { item: true, borda: true, tipoMassa: true } },
      },
      orderBy: { criadoEm: 'asc' },
    });
  }

  async findHistorico() {
    return this.prisma.pedido.findMany({
      where: { status: 4 },
      include: {
        itens: { include: { item: true, borda: true, tipoMassa: true } },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async clearHistorico() {
    const pedidosFinalizados = await this.prisma.pedido.findMany({
      where: { status: 4 },
      select: { id: true },
    });

    const ids = pedidosFinalizados.map((p) => p.id);
    if (ids.length === 0) return { deleted: 0 };

    await this.prisma.$transaction([
      this.prisma.pedidoItem.deleteMany({ where: { pedidoId: { in: ids } } }),
      this.prisma.pedido.deleteMany({ where: { id: { in: ids } } }),
    ]);

    return { deleted: ids.length };
  }

  async updateStatus(id: number, status: number) {
    if (!status || ![1, 2, 3, 4, 5].includes(Number(status))) {
      throw new BadRequestException('Status inválido.');
    }

    try {
      return await this.prisma.pedido.update({
        where: { id },
        data: { status: Number(status) },
      });
    } catch {
      throw new NotFoundException('Pedido não encontrado.');
    }
  }
}
