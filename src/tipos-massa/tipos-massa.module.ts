import { Module } from '@nestjs/common';
import {
  TiposMassaPublicController,
  TiposMassaAdminController,
} from './tipos-massa.controller';
import { TiposMassaService } from './tipos-massa.service';

@Module({
  controllers: [TiposMassaPublicController, TiposMassaAdminController],
  providers: [TiposMassaService],
})
export class TiposMassaModule {}
