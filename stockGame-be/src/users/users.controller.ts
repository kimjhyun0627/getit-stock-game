import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  async getCurrentUser(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
    }
    return this.usersService.findOne(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('make-admin')
  async makeAdmin(@Body() body: { email?: string; nickname?: string }) {
    try {
      const user = await this.usersService.findByEmailOrNickname(
        body.email,
        body.nickname,
      );
      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      const updatedUser = await this.usersService.updateRole(user.id, 'ADMIN');
      return {
        message: '사용자가 관리자로 변경되었습니다.',
        user: {
          id: updatedUser.id,
          nickname: updatedUser.nickname,
          role: updatedUser.role,
          email: updatedUser.email,
          balance: updatedUser.balance,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        '관리자 변경에 실패했습니다: ' + (error as Error).message,
      );
    }
  }
}
