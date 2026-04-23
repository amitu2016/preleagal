import { NDAFormData } from '@/types/nda';

export function formatDate(iso: string): string {
  if (!iso) return '[Effective Date]';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function mndaTermText(data: NDAFormData): string {
  if (data.mndaTermType === 'fixed') {
    return `${data.mndaTermYears} year(s) from Effective Date`;
  }
  return 'until terminated in accordance with the terms of the MNDA';
}

export function confidentialityTermText(data: NDAFormData): string {
  if (data.confidentialityTermType === 'fixed') {
    return `${data.confidentialityTermYears} year(s) from Effective Date`;
  }
  return 'in perpetuity';
}

export function val(v: string, fallback: string): string {
  return v.trim() ? v.trim() : fallback;
}

export function pdfFilename(data: NDAFormData): string {
  const p1 = data.party1.company.trim().replace(/\s+/g, '-') || 'Party1';
  const p2 = data.party2.company.trim().replace(/\s+/g, '-') || 'Party2';
  return `Mutual-NDA-${p1}-${p2}.pdf`;
}
