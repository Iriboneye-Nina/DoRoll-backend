import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './todo/filters/all-exceptions.filter';
import { config } from 'dotenv';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set up global pipes and filters
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription('The Todo API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(5000);
}
bootstrap();
