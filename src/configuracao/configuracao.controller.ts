import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ConfiguracaoService } from './configuracao.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ─── Rotas admin ──────────────────────────────────────────────────────────────
@Controller('admin/configuracao')
@UseGuards(JwtAuthGuard)
export class ConfiguracaoAdminController {
  constructor(private readonly service: ConfiguracaoService) {}

  @Get()
  findOne() {
    return this.service.findOne();
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { numeroDeMesas: number },
  ) {
    return this.service.update(id, body.numeroDeMesas);
  }
}
