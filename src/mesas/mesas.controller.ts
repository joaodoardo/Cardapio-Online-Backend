import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MesasService } from './mesas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ─── Rotas admin ──────────────────────────────────────────────────────────────
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class MesasAdminController {
  constructor(private readonly service: MesasService) {}

  @Get('mesas')
  findSessoesAbertas() {
    return this.service.findSessoesAbertas();
  }

  @Post('sessao/:id/fechar')
  @HttpCode(HttpStatus.OK)
  fecharSessao(@Param('id', ParseIntPipe) id: number) {
    return this.service.fecharSessao(id);
  }
}
