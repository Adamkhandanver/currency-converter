import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';

let cachedServer;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  if (process.env.NODE_ENV === 'development') {
    await app.listen(3001);
    console.log('Server is running on http://localhost:3001');
  } else {
    cachedServer = serverlessExpress({ app: app.getHttpAdapter().getInstance() });
  }

  return cachedServer;
}

if (process.env.NODE_ENV === 'development') {
  (async () => {
    await bootstrap();
  })();
}

export const handler = async (event, context) => {
  const server = await bootstrap();
  return server(event, context);
};