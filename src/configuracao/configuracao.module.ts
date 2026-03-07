import { Module } from '@nestjs/common';
import { ConfiguracaoAdminController, ConfiguracaoPublicController } from './configuracao.controller';
import { ConfiguracaoService } from './configuracao.service';

@Module({
  controllers: [ConfiguracaoPublicController, ConfiguracaoAdminController],
  providers: [ConfiguracaoService],
})
export class ConfiguracaoModule {}
