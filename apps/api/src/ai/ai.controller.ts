import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@Controller('api/ai')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @Throttle({ default: { limit: 100, ttl: 3600000 } }) // 100 requests per hour
  async chat(
    @Body() body: { messages: ChatCompletionMessageParam[]; context?: string },
  ) {
    return this.aiService.chat(body.messages, body.context);
  }
}
