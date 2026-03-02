import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ─── Rota pública ─────────────────────────────────────────────────────────────
@Controller('horarios')
export class HorariosPublicController {
  constructor(private readonly service: HorariosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}

// ─── Rota admin ───────────────────────────────────────────────────────────────
@Controller('admin/horarios')
@UseGuards(JwtAuthGuard)
export class HorariosAdminController {
  constructor(private readonly service: HorariosService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  upsert(@Body() horarios: any[]) {
    return this.service.upsert(horarios);
  }
}
