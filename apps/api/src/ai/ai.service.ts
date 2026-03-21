import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('AI_API_KEY'),
    });
  }

  async chat(messages: any[], context?: string): Promise<{ reply: string }> {
    const aiModel = this.configService.get<string>('AI_MODEL') || 'gpt-4o-mini';
    
    try {
      if (context) {
        messages = [{ role: 'system', content: context }, ...messages];
      }
      
      const response = await this.openai.chat.completions.create({
        model: aiModel,
        messages: messages,
      });

      return {
        reply: response.choices[0]?.message?.content || '',
      };
    } catch (error: any) {
      console.error('AI Service Error:', error);
      throw new InternalServerErrorException('Failed to communicate with AI provider');
    }
  }
}
