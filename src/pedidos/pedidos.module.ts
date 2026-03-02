import { Module } from '@nestjs/common';
import {
  PedidoPublicController,
  PedidosClienteController,
  PedidosAdminController,
} from './pedidos.controller';
import { PedidosService } from './pedidos.service';

@Module({
  controllers: [
    PedidoPublicController,
    PedidosClienteController,
    PedidosAdminController,
  ],
  providers: [PedidosService],
})
export class PedidosModule {}
