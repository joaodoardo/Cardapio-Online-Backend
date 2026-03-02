import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfiguracaoService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne() {
    return this.prisma.configuracaoLoja.findFirst();
  }

  async update(id: number, numeroDeMesas: number) {
    if (!numeroDeMesas || Number(numeroDeMesas) < 1) {
      throw new BadRequestException('Número de mesas inválido.');
    }

    try {
      return await this.prisma.configuracaoLoja.update({
        where: { id },
        data: { numeroDeMesas: Number(numeroDeMesas) },
      });
    } catch {
      throw new BadRequestException('Erro ao atualizar configuração.');
    }
  }
}
