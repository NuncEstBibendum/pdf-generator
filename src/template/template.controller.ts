import { Body, Controller, Header, Post } from '@nestjs/common';
import { Invoice } from './invoice.types';
import { TemplateService } from './template.service';

type InvoiceRequest = Omit<Invoice, 'validatedAt'> & {
  validatedAt: string | Date;
};

@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post('invoice')
  @Header('Content-Type', 'text/html; charset=utf-8')
  renderInvoice(@Body() invoice: InvoiceRequest): string {
    return this.templateService.renderInvoice({
      ...invoice,
      validatedAt: new Date(invoice.validatedAt),
    });
  }
}
