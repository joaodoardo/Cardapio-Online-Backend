import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MesasService {
  constructor(private readonly prisma: PrismaService) {}

  async findSessoesAbertas() {
    return this.prisma.sessaoMesa.findMany({
      where: { fechadaEm: null },
      include: {
        pedidos: {
          include: {
            itens: {
              include: { item: true, borda: true, tipoMassa: true },
            },
          },
          orderBy: { criadoEm: 'asc' },
        },
      },
      orderBy: { mesa: 'asc' },
    });
  }

  async fecharSessao(id: number) {
    const sessao = await this.prisma.sessaoMesa.findUnique({ where: { id } });

    if (!sessao) throw new NotFoundException('Sessão não encontrada.');
    if (sessao.fechadaEm)
      throw new BadRequestException('Mesa já está fechada.');

    return this.prisma.sessaoMesa.update({
      where: { id },
      data: { fechadaEm: new Date() },
    });
  }
}
