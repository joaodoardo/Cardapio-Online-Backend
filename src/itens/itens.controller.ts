import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ItensService } from './itens.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// ─── Rotas admin ──────────────────────────────────────────────────────────────
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class ItensAdminController {
  constructor(private readonly service: ItensService) {}

  @Get('items')
  findAll() {
    return this.service.findAll();
  }

  @Post('item')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put('item/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete('item/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Patch('item/:id/move')
  move(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { direction: 'up' | 'down' },
  ) {
    return this.service.move(id, body.direction);
  }
}
