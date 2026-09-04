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
import { UniversitiesService } from './universities.service';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';

@Controller('admin/universities')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UniversitiesController {
  constructor(private readonly universities: UniversitiesService) {}

  @Get()
  findAll() {
    return this.universities.findAll();
  }

  @Post()
  create(@Body() dto: CreateUniversityDto) {
    return this.universities.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUniversityDto) {
    return this.universities.update(id, dto);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.universities.deactivate(id);
  }
}
