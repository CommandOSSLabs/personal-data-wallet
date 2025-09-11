import { Controller, Post, Get, Delete, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { SealService } from './seal.service';

export class CreateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
  userAddress: string;
}

export class UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
}

export class AssignRoleDto {
  roleId: string;
  userAddress: string;
  assignedBy: string;
}

export class RoleAccessDto {
  roleId: string;
  content: string;
  userAddress: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  memberCount: number;
}

export interface RoleAssignment {
  id: string;
  roleId: string;
  userAddress: string;
  assignedBy: string;
  assignedAt: string;
  isActive: boolean;
}

export interface RoleEncryptResponse {
  success: boolean;
  encryptedData: string;
  identityId: string;
  roleId: string;
}

export interface RoleDecryptResponse {
  success: boolean;
  content: string;
  decryptedAt: string;
}

// Predefined permission types
export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  SHARE: 'share',
  ADMIN: 'admin',
  DECRYPT: 'decrypt',
  ENCRYPT: 'encrypt',
  MANAGE_ROLES: 'manage_roles',
  VIEW_ANALYTICS: 'view_analytics'
} as const;

@Controller('api/seal/roles')
export class RoleController {
  private readonly logger = new Logger(RoleController.name);
  private roles = new Map<string, Role>(); // In-memory storage for demo
  private roleAssignments = new Map<string, RoleAssignment>(); // In-memory storage for demo

  constructor(private readonly sealService: SealService) {
    // Initialize with some default roles
    this.initializeDefaultRoles();
  }

  private initializeDefaultRoles() {
    const defaultRoles = [
      {
        name: 'Viewer',
        description: 'Can view and decrypt content',
        permissions: [PERMISSIONS.READ, PERMISSIONS.DECRYPT]
      },
      {
        name: 'Editor',
        description: 'Can view, edit, and create content',
        permissions: [PERMISSIONS.READ, PERMISSIONS.WRITE, PERMISSIONS.DECRYPT, PERMISSIONS.ENCRYPT]
      },
      {
        name: 'Admin',
        description: 'Full access to all features',
        permissions: Object.values(PERMISSIONS)
      }
    ];

    defaultRoles.forEach(roleData => {
      const roleId = `role_${roleData.name.toLowerCase()}_${Date.now()}`;
      const role: Role = {
        id: roleId,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        owner: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        memberCount: 0
      };
      this.roles.set(roleId, role);
    });
  }

  /**
   * Create a new role
   * POST /api/seal/roles
   */
  @Post()
  async createRole(@Body() dto: CreateRoleDto): Promise<Role> {
    try {
      this.logger.log(`Creating role: ${dto.name} for user: ${dto.userAddress}`);

      // Validate permissions
      const invalidPermissions = dto.permissions.filter(perm => 
        !Object.values(PERMISSIONS).includes(perm as any)
      );
      
      if (invalidPermissions.length > 0) {
        throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
      }

      const roleId = `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const role: Role = {
        id: roleId,
        name: dto.name,
        description: dto.description,
        permissions: [...new Set(dto.permissions)], // Remove duplicates
        owner: dto.userAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        memberCount: 0
      };

      this.roles.set(roleId, role);

      this.logger.log(`Created role: ${roleId} with ${role.permissions.length} permissions`);
      return role;
    } catch (error) {
      this.logger.error('Failed to create role', error);
      throw new HttpException(
        `Failed to create role: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get all roles for a user
   * GET /api/seal/roles/:userAddress
   */
  @Get(':userAddress')
  async getUserRoles(@Param('userAddress') userAddress: string): Promise<Role[]> {
    try {
      // Get roles owned by user + system roles
      const userRoles = Array.from(this.roles.values())
        .filter(role => role.owner === userAddress || role.owner === 'system')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return userRoles;
    } catch (error) {
      this.logger.error('Failed to get user roles', error);
      throw new HttpException(
        'Failed to get roles',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get roles assigned to a user
   * GET /api/seal/roles/:userAddress/assigned
   */
  @Get(':userAddress/assigned')
  async getAssignedRoles(@Param('userAddress') userAddress: string): Promise<{
    roles: Role[];
    assignments: RoleAssignment[];
  }> {
    try {
      const assignments = Array.from(this.roleAssignments.values())
        .filter(assignment => assignment.userAddress === userAddress && assignment.isActive);

      const roles = assignments.map(assignment => this.roles.get(assignment.roleId))
        .filter(role => role && role.isActive) as Role[];

      return { roles, assignments };
    } catch (error) {
      this.logger.error('Failed to get assigned roles', error);
      throw new HttpException(
        'Failed to get assigned roles',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Assign role to user
   * POST /api/seal/roles/:roleId/assign
   */
  @Post(':roleId/assign')
  async assignRole(
    @Param('roleId') roleId: string,
    @Body() dto: AssignRoleDto
  ): Promise<RoleAssignment> {
    try {
      const role = this.roles.get(roleId);
      
      if (!role) {
        throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
      }

      if (!role.isActive) {
        throw new HttpException('Role is not active', HttpStatus.BAD_REQUEST);
      }

      // Check if user has permission to assign roles
      if (role.owner !== dto.assignedBy && dto.assignedBy !== 'system') {
        const assignerRoles = await this.getAssignedRoles(dto.assignedBy);
        const hasManagePermission = assignerRoles.roles.some(r => 
          r.permissions.includes(PERMISSIONS.MANAGE_ROLES)
        );
        
        if (!hasManagePermission) {
          throw new HttpException('Not authorized to assign roles', HttpStatus.FORBIDDEN);
        }
      }

      // Check if already assigned
      const existingAssignment = Array.from(this.roleAssignments.values())
        .find(assignment => 
          assignment.roleId === roleId && 
          assignment.userAddress === dto.userAddress && 
          assignment.isActive
        );

      if (existingAssignment) {
        throw new HttpException('Role already assigned to user', HttpStatus.BAD_REQUEST);
      }

      const assignmentId = `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const assignment: RoleAssignment = {
        id: assignmentId,
        roleId,
        userAddress: dto.userAddress,
        assignedBy: dto.assignedBy,
        assignedAt: new Date().toISOString(),
        isActive: true
      };

      this.roleAssignments.set(assignmentId, assignment);

      // Update member count
      role.memberCount++;
      this.roles.set(roleId, role);

      this.logger.log(`Assigned role ${roleId} to user ${dto.userAddress}`);
      return assignment;
    } catch (error) {
      this.logger.error('Failed to assign role', error);
      throw new HttpException(
        error.message || 'Failed to assign role',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Revoke role from user
   * DELETE /api/seal/roles/:roleId/revoke/:userAddress
   */
  @Delete(':roleId/revoke/:userAddress')
  async revokeRole(
    @Param('roleId') roleId: string,
    @Param('userAddress') userAddress: string,
    @Body() dto: { revokedBy: string }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const role = this.roles.get(roleId);
      
      if (!role) {
        throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
      }

      // Check authorization
      if (role.owner !== dto.revokedBy && dto.revokedBy !== 'system') {
        const revokerRoles = await this.getAssignedRoles(dto.revokedBy);
        const hasManagePermission = revokerRoles.roles.some(r => 
          r.permissions.includes(PERMISSIONS.MANAGE_ROLES)
        );
        
        if (!hasManagePermission) {
          throw new HttpException('Not authorized to revoke roles', HttpStatus.FORBIDDEN);
        }
      }

      // Find and deactivate assignment
      const assignment = Array.from(this.roleAssignments.values())
        .find(assignment => 
          assignment.roleId === roleId && 
          assignment.userAddress === userAddress && 
          assignment.isActive
        );

      if (!assignment) {
        throw new HttpException('Role assignment not found', HttpStatus.NOT_FOUND);
      }

      assignment.isActive = false;
      this.roleAssignments.set(assignment.id, assignment);

      // Update member count
      role.memberCount = Math.max(0, role.memberCount - 1);
      this.roles.set(roleId, role);

      this.logger.log(`Revoked role ${roleId} from user ${userAddress}`);
      return {
        success: true,
        message: 'Role revoked successfully'
      };
    } catch (error) {
      this.logger.error('Failed to revoke role', error);
      throw new HttpException(
        error.message || 'Failed to revoke role',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Check user permissions
   * POST /api/seal/roles/check-permission
   */
  @Post('check-permission')
  async checkPermission(@Body() dto: {
    userAddress: string;
    permission: string;
  }): Promise<{
    hasPermission: boolean;
    roles: string[];
    permissions: string[];
  }> {
    try {
      const assignedRoles = await this.getAssignedRoles(dto.userAddress);
      
      const allPermissions = new Set<string>();
      const roleNames: string[] = [];

      assignedRoles.roles.forEach(role => {
        roleNames.push(role.name);
        role.permissions.forEach(perm => allPermissions.add(perm));
      });

      const hasPermission = allPermissions.has(dto.permission);

      return {
        hasPermission,
        roles: roleNames,
        permissions: Array.from(allPermissions)
      };
    } catch (error) {
      this.logger.error('Failed to check permission', error);
      return {
        hasPermission: false,
        roles: [],
        permissions: []
      };
    }
  }

  /**
   * Get available permissions
   * GET /api/seal/roles/permissions
   */
  @Get('permissions')
  async getAvailablePermissions(): Promise<{
    permissions: Array<{ key: string; label: string; description: string }>;
  }> {
    const permissionDescriptions = {
      [PERMISSIONS.READ]: 'View content and data',
      [PERMISSIONS.WRITE]: 'Create and edit content',
      [PERMISSIONS.DELETE]: 'Delete content and data',
      [PERMISSIONS.SHARE]: 'Share content with others',
      [PERMISSIONS.ADMIN]: 'Full administrative access',
      [PERMISSIONS.DECRYPT]: 'Decrypt encrypted content',
      [PERMISSIONS.ENCRYPT]: 'Encrypt content',
      [PERMISSIONS.MANAGE_ROLES]: 'Manage user roles and permissions',
      [PERMISSIONS.VIEW_ANALYTICS]: 'View analytics and reports'
    };

    const permissions = Object.values(PERMISSIONS).map(perm => ({
      key: perm,
      label: perm.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      description: permissionDescriptions[perm] || 'Permission description'
    }));

    return { permissions };
  }
}
