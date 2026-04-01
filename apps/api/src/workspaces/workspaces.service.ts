import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './workspace.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private workspacesRepository: Repository<Workspace>,
  ) {}

  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${suffix}`;
  }

  async findAllForUser(userId: string): Promise<Workspace[]> {
    return this.workspacesRepository.find({ where: { ownerId: userId } });
  }

  async findBySlug(slug: string, userId?: string): Promise<Workspace> {
    const workspace = await this.workspacesRepository.findOne({
      where: { slug },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');

    if (!workspace.isPublic && workspace.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    return workspace;
  }

  async create(
    userId: string,
    data: {
      name: string;
      snapshot?: Record<string, unknown>;
      isPublic?: boolean;
    },
  ): Promise<Workspace> {
    const workspace = this.workspacesRepository.create({
      ownerId: userId,
      name: data.name,
      slug: this.generateSlug(data.name),
      snapshotJson: data.snapshot,
      isPublic: data.isPublic || false,
    });
    return this.workspacesRepository.save(workspace);
  }

  async update(
    userId: string,
    id: string,
    data: Partial<Workspace>,
  ): Promise<Workspace> {
    const workspace = await this.workspacesRepository.findOne({
      where: { id },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (workspace.ownerId !== userId)
      throw new ForbiddenException('Cannot update this workspace');

    Object.assign(workspace, data);
    return this.workspacesRepository.save(workspace);
  }

  async remove(userId: string, id: string): Promise<void> {
    const workspace = await this.workspacesRepository.findOne({
      where: { id },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (workspace.ownerId !== userId)
      throw new ForbiddenException('Cannot delete this workspace');

    await this.workspacesRepository.remove(workspace);
  }
}
