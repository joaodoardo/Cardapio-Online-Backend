import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ItensModule } from './itens/itens.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { EntregaModule } from './entrega/entrega.module';
import { HorariosModule } from './horarios/horarios.module';
import { BordasModule } from './bordas/bordas.module';
import { TiposMassaModule } from './tipos-massa/tipos-massa.module';
import { MesasModule } from './mesas/mesas.module';
import { ConfiguracaoModule } from './configuracao/configuracao.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CategoriasModule,
    ItensModule,
    PedidosModule,
    EntregaModule,
    HorariosModule,
    BordasModule,
    TiposMassaModule,
    MesasModule,
    ConfiguracaoModule,
  ],
  providers: [AppService],
})
export class AppModule {}
