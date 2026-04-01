import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const baseURL = this.configService.get<string>('AI_BASE_URL');

    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('AI_API_KEY'),
      ...(baseURL ? { baseURL } : {}),
    });
  }

  async chat(
    messages: ChatCompletionMessageParam[],
    context?: string,
  ): Promise<{ reply: string }> {
    const aiModel = this.configService.get<string>('AI_MODEL') || 'gpt-4o-mini';

    try {
      const allMessages: ChatCompletionMessageParam[] = context
        ? [{ role: 'system' as const, content: context }, ...messages]
        : messages;

      const response = await this.openai.chat.completions.create({
        model: aiModel,
        messages: allMessages,
      });

      return {
        reply: response.choices[0]?.message?.content || '',
      };
    } catch (error: unknown) {
      console.error('AI Service Error:', error);
      throw new InternalServerErrorException(
        'Failed to communicate with AI provider',
      );
    }
  }
}
