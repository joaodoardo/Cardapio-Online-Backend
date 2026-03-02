import { Module } from '@nestjs/common';
import { ItensAdminController } from './itens.controller';
import { ItensService } from './itens.service';

@Module({
  controllers: [ItensAdminController],
  providers: [ItensService],
})
export class ItensModule {}
