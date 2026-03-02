import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TiposMassaService {
  constructor(private readonly prisma: PrismaService) {}

  async findDisponiveis() {
    return this.prisma.tipoMassa.findMany({
      where: { disponivel: true },
      orderBy: { nome: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.tipoMassa.findMany({ orderBy: { nome: 'asc' } });
  }

  async create(nome: string) {
    if (!nome)
      throw new BadRequestException('Nome do tipo de massa é obrigatório.');
    return this.prisma.tipoMassa.create({ data: { nome } });
  }

  async update(id: number, data: { nome?: string; disponivel?: boolean }) {
    try {
      return await this.prisma.tipoMassa.update({
        where: { id },
        data: { nome: data.nome, disponivel: data.disponivel },
      });
    } catch {
      throw new NotFoundException('Tipo de massa não encontrado.');
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.tipoMassa.delete({ where: { id } });
      return { message: 'Tipo de massa excluído com sucesso.' };
    } catch {
      throw new NotFoundException('Tipo de massa não encontrado.');
    }
  }
}
