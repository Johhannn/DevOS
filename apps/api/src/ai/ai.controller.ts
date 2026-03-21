import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('api/ai')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @Throttle({ default: { limit: 100, ttl: 3600000 } }) // 100 requests per hour (ttl is in ms internally in standard setups or seconds depending on throttler version, let's use standard config).
  // Wait, in nestjs/throttler v5+, ttl is in milliseconds. 1 hour = 3600000 ms.
  async chat(@Body() body: { messages: any[]; context?: string }) {
    return this.aiService.chat(body.messages, body.context);
  }
}
