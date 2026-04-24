export const DOC_SLUGS = [
  'mutual-nda',
  'csa',
  'design-partner',
  'sla',
  'psa',
  'dpa',
  'software-license',
  'partnership',
  'pilot',
  'baa',
  'ai-addendum',
] as const;

export type DocSlug = (typeof DOC_SLUGS)[number];

export const DOC_NAMES: Record<DocSlug, string> = {
  'mutual-nda': 'Mutual Non-Disclosure Agreement',
  'csa': 'Cloud Service Agreement',
  'design-partner': 'Design Partner Agreement',
  'sla': 'Service Level Agreement',
  'psa': 'Professional Services Agreement',
  'dpa': 'Data Processing Agreement',
  'software-license': 'Software License Agreement',
  'partnership': 'Partnership Agreement',
  'pilot': 'Pilot Agreement',
  'baa': 'Business Associate Agreement',
  'ai-addendum': 'AI Addendum',
};

export const PARTY_LABELS: Record<DocSlug, [string, string]> = {
  'mutual-nda': ['Party 1', 'Party 2'],
  'csa': ['Provider', 'Customer'],
  'design-partner': ['Vendor', 'Design Partner'],
  'sla': ['Provider', 'Customer'],
  'psa': ['Provider', 'Customer'],
  'dpa': ['Controller', 'Processor'],
  'software-license': ['Licensor', 'Licensee'],
  'partnership': ['Party 1', 'Party 2'],
  'pilot': ['Vendor', 'Customer'],
  'baa': ['Covered Entity', 'Business Associate'],
  'ai-addendum': ['Provider', 'Customer'],
};

export interface GenericPartyInfo {
  company?: string;
  signerName?: string;
  title?: string;
  noticeAddress?: string;
}

export interface GenericDocFields {
  party1?: GenericPartyInfo;
  party2?: GenericPartyInfo;
  effectiveDate?: string;
  governingLaw?: string;
  jurisdiction?: string;
  keyTerms?: Record<string, string | null>;
}

export const DEFAULT_GENERIC_FIELDS: GenericDocFields = {
  party1: {},
  party2: {},
  keyTerms: {},
};
