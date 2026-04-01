import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import type { RequestListener } from 'http';

let cachedApp: RequestListener | null = null;

async function bootstrapServer(): Promise<RequestListener> {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const frontendUrl =
      configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

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
    cachedApp = app.getHttpAdapter().getInstance() as RequestListener;
  }
  return cachedApp;
}

// Support Vercel Serverless Function export
export default async function handler(
  req: import('http').IncomingMessage,
  res: import('http').ServerResponse,
) {
  const app = await bootstrapServer();
  app(req, res);
}

// Local development fallback naturally runs
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  void bootstrapServer().then((app) => {
    const port = process.env.PORT || 3001;
    (
      app as unknown as {
        listen: (port: string | number, cb: () => void) => void;
      }
    ).listen(port, () => {
      console.log(`DevOS API listening on port ${String(port)}`);
    });
  });
}
