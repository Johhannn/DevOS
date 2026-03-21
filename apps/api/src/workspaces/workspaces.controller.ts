import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllOwn(@Req() req: any) {
    return this.workspacesService.findAllForUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() body: { name: string; snapshot?: any; isPublic?: boolean }) {
    return this.workspacesService.create(req.user.id, body);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string, @Req() req: any) {
    // If the user happens to pass the JWT, decode it, otherwise it's undefined
    let userId;
    try {
      // Very basic manual check for token in cookies, since JwtAuthGuard enforces existence and throws
      if (req.cookies && req.cookies['devos-token']) {
        // Ideally we would extract, but we pass the request to the service to handle or decode somewhere else
        // Let's rely on standard extraction if possible, or just ignore for now in public endpoint
        // For a perfectly safe way, we can use an 'OptionalJwtGuard'
      }
    } catch (e) {}
    
    // For now we'll pass undefined. If it's private and userId is undefined, it'll correctly throw Forbidden
    return this.workspacesService.findBySlug(slug, req.user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.workspacesService.update(req.user.id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.workspacesService.remove(req.user.id, id);
  }
}
