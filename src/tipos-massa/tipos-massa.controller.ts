import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TiposMassaService } from './tipos-massa.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ─── Rota pública ─────────────────────────────────────────────────────────────
@Controller('tipos-massa')
export class TiposMassaPublicController {
  constructor(private readonly service: TiposMassaService) {}

  @Get()
  findDisponiveis() {
    return this.service.findDisponiveis();
  }
}

// ─── Rotas admin ──────────────────────────────────────────────────────────────
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class TiposMassaAdminController {
  constructor(private readonly service: TiposMassaService) {}

  @Get('tipos-massa')
  findAll() {
    return this.service.findAll();
  }

  @Post('tipo-massa')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: { nome: string }) {
    return this.service.create(body.nome);
  }

  @Put('tipo-massa/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nome?: string; disponivel?: boolean },
  ) {
    return this.service.update(id, body);
  }

  @Delete('tipo-massa/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
