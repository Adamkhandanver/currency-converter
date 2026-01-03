import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrencyController } from './controllers/currency.controller';
import { CurrencyService } from './services/currency.service';
import { Conversion } from './entities/conversion.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NestJS Currency API',
      },
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'currency.db',
      entities: [Conversion],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Conversion]),
  ],
  controllers: [AppController, CurrencyController],
  providers: [AppService, CurrencyService],
})
export class AppModule {}