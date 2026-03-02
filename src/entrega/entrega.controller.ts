import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EntregaService } from './entrega.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ─── Rota pública ─────────────────────────────────────────────────────────────
@Controller('entrega')
export class EntregaPublicController {
  constructor(private readonly service: EntregaService) {}

  @Get()
  findOne() {
    return this.service.findOne();
  }
}

// ─── Rota admin ───────────────────────────────────────────────────────────────
@Controller('admin/entrega')
@UseGuards(JwtAuthGuard)
export class EntregaAdminController {
  constructor(private readonly service: EntregaService) {}

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { taxaEntrega: number },
  ) {
    return this.service.update(id, body.taxaEntrega);
  }
}
