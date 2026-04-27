import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ItemsService } from './items.service';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @ApiOkResponse({ description: 'Returns all items (public endpoint)' })
  findAll() {
    return {
      message: 'Public endpoint - no authentication required',
      items: this.itemsService.findAll(),
    };
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Returns items for authenticated users only' })
  findAllProtected(@Request() req: any) {
    return {
      message: 'Protected endpoint - authentication required',
      user: {
        userId: req.user.userId,
        email: req.user.email,
        roles: req.user.roles,
      },
      items: this.itemsService.findAll(),
    };
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Returns a single item by ID' })
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Creates a new item (requires authentication)' })
  create(@Body() body: { name: string; description: string }, @Request() req: any) {
    return {
      message: 'Item created successfully',
      createdBy: req.user.email,
      item: this.itemsService.create(body.name, body.description),
    };
  }

  @Get('health/check')
  @ApiOkResponse({ description: 'Health check endpoint' })
  healthCheck() {
    return {
      status: 'ok',
      service: 'temp-service',
      timestamp: new Date().toISOString(),
      message: 'Service is running correctly',
    };
  }
}
