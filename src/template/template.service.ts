import { Injectable } from '@nestjs/common';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { InvoiceTemplate } from './invoice.template';
import { Invoice } from './invoice.types';

@Injectable()
export class TemplateService {
  renderInvoice(invoice: Invoice): string {
    return ReactDOMServer.renderToStaticMarkup(
      React.createElement(InvoiceTemplate, { invoice }),
    );
  }
}
