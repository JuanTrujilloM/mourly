import { Controller, Get } from '@nestjs/common';
import { CatalogService, type Catalog } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  get(): Promise<Catalog> {
    return this.catalogService.get();
  }
}
