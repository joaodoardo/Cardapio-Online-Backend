import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EntregaService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne() {
    const entrega = await this.prisma.entrega.findFirst();
    if (!entrega) throw new NotFoundException('Taxa de entrega não configurada.');
    return entrega;
  }

  async update(id: number, taxaEntrega: number) {
    if (
      taxaEntrega === undefined ||
      taxaEntrega === null ||
      isNaN(parseFloat(String(taxaEntrega)))
    ) {
      throw new BadRequestException('O valor da taxa de entrega é inválido.');
    }

    try {
      return await this.prisma.entrega.update({
        where: { id },
        data: { taxaEntrega: parseFloat(String(taxaEntrega)) },
      });
    } catch {
      throw new NotFoundException('Registro de entrega não encontrado.');
    }
  }
}
