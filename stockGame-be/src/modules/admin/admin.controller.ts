import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return await this.adminService.getDashboardStats();
  }

  @Get('status')
  getSystemStatus() {
    return this.adminService.getSystemStatus();
  }

  @Post('stocks/simulate')
  async runStockSimulation() {
    return await this.adminService.runStockSimulation();
  }

  @Post('backup')
  async backupData() {
    return await this.adminService.backupData();
  }
}
