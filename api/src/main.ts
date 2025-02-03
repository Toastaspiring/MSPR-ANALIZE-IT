import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('MSPR')
    .setDescription('Manage datasets')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // Delete unknown fields
    forbidNonWhitelisted: true, // Return error 400 if there is an unknown field
    transform: true,            // Automatically transform dto types
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
