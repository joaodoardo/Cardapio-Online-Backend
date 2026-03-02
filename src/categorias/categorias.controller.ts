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
import { CategoriasService } from './categorias.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ─── Rotas públicas ───────────────────────────────────────────────────────────
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly service: CategoriasService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id/itens')
  findItens(@Param('id', ParseIntPipe) id: number) {
    return this.service.findItens(id);
  }
}

// ─── Rotas admin ──────────────────────────────────────────────────────────────
@Controller('admin/categoria')
@UseGuards(JwtAuthGuard)
export class AdminCategoriasController {
  constructor(private readonly service: CategoriasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: { nome: string }) {
    return this.service.create(body.nome);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nome: string },
  ) {
    return this.service.update(id, body.nome);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
