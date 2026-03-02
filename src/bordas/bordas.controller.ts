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
import { BordasService } from './bordas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ─── Rota pública ─────────────────────────────────────────────────────────────
@Controller('bordas')
export class BordasPublicController {
  constructor(private readonly service: BordasService) {}

  @Get()
  findDisponiveis() {
    return this.service.findDisponiveis();
  }
}

// ─── Rotas admin ──────────────────────────────────────────────────────────────
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class BordasAdminController {
  constructor(private readonly service: BordasService) {}

  @Get('bordas')
  findAll() {
    return this.service.findAll();
  }

  @Post('borda')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put('borda/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete('borda/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
