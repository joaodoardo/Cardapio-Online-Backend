import { Module } from '@nestjs/common';
import { MesasAdminController } from './mesas.controller';
import { MesasService } from './mesas.service';

@Module({
  controllers: [MesasAdminController],
  providers: [MesasService],
})
export class MesasModule {}
