import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HorariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.horarios.findMany({
      orderBy: { diaDaSemana: 'asc' },
    });
  }

  async upsert(horarios: any[]) {
    if (!Array.isArray(horarios) || horarios.length !== 7) {
      throw new BadRequestException(
        'Formato de dados inválido. Esperado um array com 7 dias.',
      );
    }

    const operacoes = horarios.map((dia) =>
      this.prisma.horarios.upsert({
        where: { diaDaSemana: dia.diaDaSemana },
        update: {
          nome: dia.nome,
          aberto: dia.aberto,
          inicio: dia.inicio,
          fim: dia.fim,
        },
        create: {
          diaDaSemana: dia.diaDaSemana,
          nome: dia.nome,
          aberto: dia.aberto,
          inicio: dia.inicio,
          fim: dia.fim,
        },
      }),
    );

    await this.prisma.$transaction(operacoes);
    return { message: 'Horários salvos com sucesso!' };
  }
}
