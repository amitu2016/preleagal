export interface PartyInfo {
  company: string;
  signerName: string;
  title: string;
  noticeAddress: string;
}

export interface NDAFormData {
  purpose: string;
  effectiveDate: string;
  mndaTermType: 'fixed' | 'until-terminated';
  mndaTermYears: number;
  confidentialityTermType: 'fixed' | 'perpetuity';
  confidentialityTermYears: number;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1: PartyInfo;
  party2: PartyInfo;
}

export const DEFAULT_FORM_DATA: NDAFormData = {
  purpose: 'Evaluating whether to enter into a business relationship with the other party.',
  effectiveDate: new Date().toISOString().split('T')[0],
  mndaTermType: 'fixed',
  mndaTermYears: 1,
  confidentialityTermType: 'fixed',
  confidentialityTermYears: 1,
  governingLaw: '',
  jurisdiction: '',
  modifications: '',
  party1: { company: '', signerName: '', title: '', noticeAddress: '' },
  party2: { company: '', signerName: '', title: '', noticeAddress: '' },
};
