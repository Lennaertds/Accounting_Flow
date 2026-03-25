// backend/src/accounting/vat-code.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VatCodeService } from './vat-code.service';
import { CreateVatCodeDto, UpdateVatCodeDto } from './vat-code.dto';

@ApiTags('Invoices - VAT Codes')
@ApiBearerAuth()
@Controller('vat-codes')
export class VatCodeController {
    constructor(private readonly service: VatCodeService) {}

    @Get()
    @ApiOperation({ summary: 'Haal alle BTW-codes op voor een organisatie' })
    findAll(@Query('orgId', ParseUUIDPipe) orgId: string) {
        return this.service.findAll(orgId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Haal één specifieke BTW-code op via ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.findById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Maak een nieuwe BTW-code aan' })
    create(@Body() dto: CreateVatCodeDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update een BTW-code via ID' })
    update(
        @Param('id', ParseUUIDPipe) id: string, 
        @Body() dto: UpdateVatCodeDto
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Verwijder een BTW-code via ID' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.delete(id);
    }
}