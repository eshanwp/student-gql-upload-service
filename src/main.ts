import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { AppLogger } from './core/logger/app-logger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //create a global-scoped filter
  app.useGlobalFilters(new HttpExceptionFilter(new AppLogger()));

  /*Swagger Documentation*/
  const config = new DocumentBuilder()
    .setTitle('MGMT Service API')
    .setDescription('MGMT Service APIs')
    .setVersion('1.0')
    .addServer('/api')
    .addTag('Role', 'Operation about the role')
    .addTag('User', 'Operation about the user')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  app.enableCors();
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new WsAdapter(app) as any);
  app.setGlobalPrefix('api');
  await app.listen(5000);
}

bootstrap();
