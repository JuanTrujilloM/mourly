import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { HobbiesService } from './hobbies.service';
import { CreateHobbyDto } from './dto/create-hobby.dto';
import { UpdateHobbyDto } from './dto/update-hobby.dto';

@Controller('admin/hobbies')
@UseGuards(JwtAuthGuard, AdminGuard)
export class HobbiesController {
  constructor(private readonly hobbies: HobbiesService) {}

  @Get()
  findAll() {
    return this.hobbies.findAll();
  }

  @Post()
  create(@Body() dto: CreateHobbyDto) {
    return this.hobbies.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHobbyDto) {
    return this.hobbies.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hobbies.remove(id);
  }
}
