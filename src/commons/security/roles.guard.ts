import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface UserWithRole {
  userId: string;
  username: string;
  role: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Casting 'user' ke interface yang sudah kita buat
    const user = request.user as UserWithRole;

    if (!user || !user.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Hanya admin di perbolehkakn');
    }
    return true;
  }
}
