import { Module } from '@nestjs/common';
import {
  BordasPublicController,
  BordasAdminController,
} from './bordas.controller';
import { BordasService } from './bordas.service';

@Module({
  controllers: [BordasPublicController, BordasAdminController],
  providers: [BordasService],
})
export class BordasModule {}
