import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    // Admin padrão
    const admin = await this.prisma.admin.findFirst();
    if (!admin) {
      const senhaHash = await bcrypt.hash('admin123', 10);
      await this.prisma.admin.create({
        data: { email: 'admin@pizzaria.com', senha: senhaHash },
      });
      console.log('Admin padrão criado: admin@pizzaria.com / admin123');
    }

    // Horários padrão
    const totalHorarios = await this.prisma.horarios.count();
    if (totalHorarios === 0) {
      const defaultSchedule = [
        { diaDaSemana: 0, nome: 'Domingo', aberto: true, inicio: '18:00', fim: '23:00' },
        { diaDaSemana: 1, nome: 'Segunda', aberto: false, inicio: '18:00', fim: '22:00' },
        { diaDaSemana: 2, nome: 'Terça', aberto: true, inicio: '18:00', fim: '22:00' },
        { diaDaSemana: 3, nome: 'Quarta', aberto: true, inicio: '18:00', fim: '22:00' },
        { diaDaSemana: 4, nome: 'Quinta', aberto: true, inicio: '18:00', fim: '22:00' },
        { diaDaSemana: 5, nome: 'Sexta', aberto: true, inicio: '18:00', fim: '23:00' },
        { diaDaSemana: 6, nome: 'Sábado', aberto: true, inicio: '18:00', fim: '23:00' },
      ];
      await this.prisma.horarios.createMany({ data: defaultSchedule });
      console.log('Horários padrão criados.');
    }

    // Taxa de entrega padrão
    const totalEntregas = await this.prisma.entrega.count();
    if (totalEntregas === 0) {
      await this.prisma.entrega.create({ data: { taxaEntrega: 5.0 } });
      console.log('Taxa de entrega padrão (R$ 5.00) criada.');
    }

    // Bordas padrão
    const totalBordas = await this.prisma.borda.count();
    if (totalBordas === 0) {
      await this.prisma.borda.createMany({
        data: [
          { nome: 'Catupiry', precoP: 3.0, precoM: 4.0, precoG: 5.0, precoGG: 6.0 },
          { nome: 'Cheddar', precoP: 3.5, precoM: 4.5, precoG: 5.5, precoGG: 6.5 },
        ],
      });
      console.log('Bordas padrão criadas.');
    }

    // Configuração da loja padrão
    const totalConfig = await this.prisma.configuracaoLoja.count();
    if (totalConfig === 0) {
      await this.prisma.configuracaoLoja.create({ data: { numeroDeMesas: 10 } });
      console.log('Configuração padrão criada (10 mesas).');
    }

    // Tipos de massa padrão
    const totalTiposMassa = await this.prisma.tipoMassa.count();
    if (totalTiposMassa === 0) {
      await this.prisma.tipoMassa.createMany({
        data: [{ nome: 'Fina' }, { nome: 'Média' }, { nome: 'Grossa' }],
      });
      console.log('Tipos de massa padrão criados.');
    }
  }
}
