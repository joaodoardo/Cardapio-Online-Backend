import { Module } from '@nestjs/common';
import {
  EntregaPublicController,
  EntregaAdminController,
} from './entrega.controller';
import { EntregaService } from './entrega.service';

@Module({
  controllers: [EntregaPublicController, EntregaAdminController],
  providers: [EntregaService],
})
export class EntregaModule {}
