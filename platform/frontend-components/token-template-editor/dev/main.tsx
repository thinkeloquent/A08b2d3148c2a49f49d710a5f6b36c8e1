import { createRoot } from 'react-dom/client';
import './styles.css';
import { TokenTemplateEditor, TokenTemplateWidget } from '../src';

const SAMPLE_TEMPLATE = `Dear {{recipient_name}},

Thank you for your recent order #{{order_id}} placed on {{order_date}}.

We're pleased to confirm that your {{product_name}} (Qty: {{quantity}}) has been shipped to:

{{shipping_address}}
{{city}}, {{state}} {{zip_code}}

Your tracking number is {{tracking_number}}. Expected delivery: {{delivery_date}}.

If you have any questions, contact us at {{support_email}} or call {{support_phone}}.

Best regards,
{{sender_name}}
{{company_name}}`;

const DEFAULT_VALUES: Record<string, string> = {
  recipient_name: 'Jane Cooper',
  order_id: 'ORD-20261127',
  order_date: 'November 27, 2026',
  product_name: 'Wireless Ergonomic Keyboard',
  quantity: '2',
  shipping_address: '1234 Elm Street',
  city: 'Portland',
  state: 'OR',
  zip_code: '97201',
  tracking_number: '1Z999AA10123456784',
  delivery_date: 'December 3, 2026',
  support_email: 'help@acmestore.com',
  support_phone: '(800) 555-0199',
  sender_name: 'Alex Morgan',
  company_name: 'Acme Store Inc.',
};

const SRS_TEMPLATE = `# Software Requirements Specification (SRS)
## {{ systemName }}

**Document ID:** {{ documentId }}
**Version:** {{ version }}
**Author:** {{ author }}
**Date:** {{ date }}

---

## 1. Introduction

### 1.1 Purpose
This document describes the software requirements for {{ systemName }}.

### 1.2 Scope
{{ scopeDescription }}

## 2. Overall Description

### 2.1 Product Perspective
{{ productPerspective }}

### 2.2 User Classes
{{ userClasses }}`;

createRoot(document.getElementById('root')!).render(
  <div>
    {/* #1 — Full standalone editor */}
    <TokenTemplateEditor
      initialTemplate={SAMPLE_TEMPLATE}
      defaultValues={DEFAULT_VALUES}
      onCopy={(text) => console.log('Copied:', text.slice(0, 80) + '...')}
      onDownload={(json) => {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template-export.json';
        a.click();
        URL.revokeObjectURL(url);
      }}
    />

    {/* #2 — Compact widget for embedding */}
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">Widget Demo</h2>
      <TokenTemplateWidget
        template={SRS_TEMPLATE}
        title="Software Requirements Specification (SRS)"
        version="v1.0"
        onLoad={(tpl) => console.log('Load template:', tpl.slice(0, 80) + '...')}
      />
    </div>
  </div>,
);
