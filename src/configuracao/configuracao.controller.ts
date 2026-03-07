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

// ─── Rota pública ─────────────────────────────────────────────────────────────
@Controller('configuracao')
export class ConfiguracaoPublicController {
  constructor(private readonly service: ConfiguracaoService) {}

  @Get()
  async findPublic() {
    const config = await this.service.findOne();
    return { numeroDeMesas: config?.numeroDeMesas ?? 0 };
  }
}

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
