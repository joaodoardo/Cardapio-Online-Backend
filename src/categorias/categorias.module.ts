import { Module } from '@nestjs/common';
import {
  CategoriasController,
  AdminCategoriasController,
} from './categorias.controller';
import { CategoriasService } from './categorias.service';

@Module({
  controllers: [CategoriasController, AdminCategoriasController],
  providers: [CategoriasService],
})
export class CategoriasModule {}
