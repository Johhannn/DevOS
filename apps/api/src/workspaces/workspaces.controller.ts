import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import type { Workspace } from './workspace.entity';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllOwn(@Req() req: AuthenticatedRequest) {
    return this.workspacesService.findAllForUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      name: string;
      snapshot?: Record<string, unknown>;
      isPublic?: boolean;
    },
  ) {
    return this.workspacesService.create(req.user.id, body);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string, @Req() req: Request) {
    const user = req.user as { id: string } | undefined;
    return this.workspacesService.findBySlug(slug, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: Partial<Workspace>,
  ) {
    return this.workspacesService.update(req.user.id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.workspacesService.remove(req.user.id, id);
  }
}
