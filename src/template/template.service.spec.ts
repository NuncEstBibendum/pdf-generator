import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import { Invoice } from './invoice.types';
import { baseInvoice } from './__mocks__/invoice.mock';

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateService],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
  });

  describe('renderInvoice', () => {
    it('renders invoice number and both company names', () => {
      const html = service.renderInvoice(baseInvoice);

      expect(html).toContain('FA-2026-001');
      expect(html).toContain('Bâtiment Pro SAS');
      expect(html).toContain('Maçonnerie Dupont');
    });

    it('renders correct totals for multiple vat rates', () => {
      const html = service.renderInvoice(baseInvoice);

      expect(html).toContain('2500.00');
      expect(html).toContain('2850.00');
      expect(html).toContain('150.00');
      expect(html).toContain('200.00');
    });

    it('renders a fallback when a line has no description', () => {
      const invoiceWithEmptyLine: Invoice = {
        ...baseInvoice,
        lines: [
          {
            description: '',
            quantity: 1,
            unitPrice: 10000,
            vatRate: 0.2,
          },
        ],
      };

      const html = service.renderInvoice(invoiceWithEmptyLine);

      expect(html).toContain('—');
    });

    it("doesn't render lines when the quantity is 0", () => {
      const html = service.renderInvoice(baseInvoice);

      console.log(html);

      expect(html).toContain('Pose de carrelage');
      expect(html).toContain('Fourniture matériaux');
      expect(html).not.toContain('Ligne à ne pas afficher');
    });
  });
});
