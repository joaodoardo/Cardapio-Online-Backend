import { Module } from '@nestjs/common';
import { ConfiguracaoAdminController } from './configuracao.controller';
import { ConfiguracaoService } from './configuracao.service';

@Module({
  controllers: [ConfiguracaoAdminController],
  providers: [ConfiguracaoService],
})
export class ConfiguracaoModule {}
