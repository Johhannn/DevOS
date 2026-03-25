import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

let cachedApp: any;

async function bootstrapServer() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);
    
    const configService = app.get(ConfigService);
    const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    app.enableCors({
      origin: frontendUrl,
      credentials: true,
    });

    app.use(cookieParser());
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

// Support Vercel Serverless Function export
export default async function handler(req: any, res: any) {
  const app = await bootstrapServer();
  return app(req, res);
}

// Local development fallback naturally runs
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  bootstrapServer().then((app) => {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`DevOS API listening on port ${port}`);
    });
  });
}
