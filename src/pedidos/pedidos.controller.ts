import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ─── Rota pública: criar pedido ───────────────────────────────────────────────
@Controller('pedido')
export class PedidoPublicController {
  constructor(private readonly service: PedidosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: any) {
    return this.service.create(body);
  }
}

// ─── Rota pública: consultar pedidos por telefone ─────────────────────────────
@Controller('pedidos')
export class PedidosClienteController {
  constructor(private readonly service: PedidosService) {}

  @Get('cliente/:telefone')
  findByTelefone(@Param('telefone') telefone: string) {
    return this.service.findByTelefone(telefone);
  }
}

// ─── Rotas admin ──────────────────────────────────────────────────────────────
@Controller('admin/pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosAdminController {
  constructor(private readonly service: PedidosService) {}

  @Get('historico')
  findHistorico() {
    return this.service.findHistorico();
  }

  @Get()
  findAtivos() {
    return this.service.findAtivos();
  }

  @Put(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: number },
  ) {
    return this.service.updateStatus(id, body.status);
  }
}
