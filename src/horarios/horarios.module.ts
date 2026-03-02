import { Module } from '@nestjs/common';
import {
  HorariosPublicController,
  HorariosAdminController,
} from './horarios.controller';
import { HorariosService } from './horarios.service';

@Module({
  controllers: [HorariosPublicController, HorariosAdminController],
  providers: [HorariosService],
})
export class HorariosModule {}
