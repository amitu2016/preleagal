import React from 'react';
import { render, screen } from '@testing-library/react';
import NDADocument from '@/components/NDADocument';
import { NDAFormData, DEFAULT_FORM_DATA } from '@/types/nda';

const FULL_DATA: NDAFormData = {
  purpose: 'Evaluating a potential business partnership',
  effectiveDate: '2024-06-15',
  mndaTermType: 'fixed',
  mndaTermYears: 2,
  confidentialityTermType: 'fixed',
  confidentialityTermYears: 3,
  governingLaw: 'Delaware',
  jurisdiction: 'New Castle, DE',
  modifications: '',
  party1: {
    company: 'Acme Corp',
    signerName: 'Jane Smith',
    title: 'CEO',
    noticeAddress: '123 Main St, San Francisco, CA 94105',
  },
  party2: {
    company: 'Beta LLC',
    signerName: 'John Doe',
    title: 'CTO',
    noticeAddress: '456 Oak Ave, New York, NY 10001',
  },
};

function doc() {
  return screen.getByTestId('pdf-document');
}

describe('NDADocument — rendering', () => {
  it('renders without crashing', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toBeInTheDocument();
  });

  it('renders two pages', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(screen.getAllByTestId('pdf-page')).toHaveLength(2);
  });

  it('displays party 1 company name', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toHaveTextContent('Acme Corp');
  });

  it('displays party 2 company name', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toHaveTextContent('Beta LLC');
  });

  it('displays party 1 signer name in signature table', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toHaveTextContent('Jane Smith');
  });

  it('displays party 2 signer name in signature table', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toHaveTextContent('John Doe');
  });

  it('displays party titles', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toHaveTextContent('CEO');
    expect(doc()).toHaveTextContent('CTO');
  });

  it('displays the formatted effective date', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toHaveTextContent('June 15, 2024');
  });

  it('displays the purpose text', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toHaveTextContent(FULL_DATA.purpose);
  });

  it('displays governing law', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toHaveTextContent('Delaware');
  });

  it('displays jurisdiction', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toHaveTextContent('New Castle, DE');
  });

  it('displays fixed MNDA term years', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toHaveTextContent('2 year(s) from Effective Date');
  });

  it('displays fixed confidentiality term years in the terms text', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toHaveTextContent('3 year(s) from Effective Date');
  });

  it('displays both page 1 (cover) and page 2 (standard terms) content', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toHaveTextContent('Mutual Non-Disclosure Agreement');
    expect(doc()).toHaveTextContent('Standard Terms');
  });
});

describe('NDADocument — fallbacks for empty fields', () => {
  it('shows [Effective Date] placeholder when date is empty', () => {
    render(<NDADocument data={{ ...FULL_DATA, effectiveDate: '' }} />);
    expect(doc()).toHaveTextContent('[Effective Date]');
  });

  it('shows [Governing Law] placeholder when governing law is empty', () => {
    render(<NDADocument data={{ ...FULL_DATA, governingLaw: '' }} />);
    expect(doc()).toHaveTextContent('[Governing Law]');
  });

  it('shows [Jurisdiction] placeholder when jurisdiction is empty', () => {
    render(<NDADocument data={{ ...FULL_DATA, jurisdiction: '' }} />);
    expect(doc()).toHaveTextContent('[Jurisdiction]');
  });

  it('shows [Purpose] placeholder when purpose is empty', () => {
    render(<NDADocument data={{ ...FULL_DATA, purpose: '' }} />);
    expect(doc()).toHaveTextContent('[Purpose]');
  });

  it('shows [Party 1 Company] placeholder when party 1 company is empty', () => {
    render(
      <NDADocument
        data={{
          ...FULL_DATA,
          party1: { ...FULL_DATA.party1, company: '' },
        }}
      />
    );
    expect(doc()).toHaveTextContent('[Party 1 Company]');
  });

  it('shows [Party 2 Company] placeholder when party 2 company is empty', () => {
    render(
      <NDADocument
        data={{
          ...FULL_DATA,
          party2: { ...FULL_DATA.party2, company: '' },
        }}
      />
    );
    expect(doc()).toHaveTextContent('[Party 2 Company]');
  });

  it('handles all empty fields without crashing', () => {
    render(<NDADocument data={DEFAULT_FORM_DATA} />);
    expect(doc()).toBeInTheDocument();
  });
});

describe('NDADocument — MNDA term variants', () => {
  it('shows until-terminated text when selected', () => {
    render(<NDADocument data={{ ...FULL_DATA, mndaTermType: 'until-terminated' }} />);
    expect(doc()).toHaveTextContent(
      'until terminated in accordance with the terms of the MNDA'
    );
  });

  it('shows expiry text when fixed term is selected', () => {
    render(
      <NDADocument
        data={{ ...FULL_DATA, mndaTermType: 'fixed', mndaTermYears: 1 }}
      />
    );
    expect(doc()).toHaveTextContent('Expires 1 year(s) from Effective Date');
  });
});

describe('NDADocument — confidentiality term variants', () => {
  it('shows "In perpetuity." when perpetuity is selected', () => {
    render(
      <NDADocument data={{ ...FULL_DATA, confidentialityTermType: 'perpetuity' }} />
    );
    expect(doc()).toHaveTextContent('In perpetuity.');
  });

  it('shows year-based text when fixed is selected', () => {
    render(
      <NDADocument
        data={{
          ...FULL_DATA,
          confidentialityTermType: 'fixed',
          confidentialityTermYears: 5,
        }}
      />
    );
    expect(doc()).toHaveTextContent('5 year(s) from Effective Date');
  });
});

describe('NDADocument — modifications section', () => {
  it('does not show modifications header when modifications are empty', () => {
    render(<NDADocument data={{ ...FULL_DATA, modifications: '' }} />);
    expect(screen.queryByText('MNDA Modifications')).not.toBeInTheDocument();
  });

  it('shows modifications header when modifications are provided', () => {
    render(
      <NDADocument
        data={{ ...FULL_DATA, modifications: 'No IP rights granted.' }}
      />
    );
    expect(doc()).toHaveTextContent('No IP rights granted.');
  });

  it('does not show modifications header for whitespace-only modifications', () => {
    render(<NDADocument data={{ ...FULL_DATA, modifications: '   ' }} />);
    expect(screen.queryByText('MNDA Modifications')).not.toBeInTheDocument();
  });
});

describe('NDADocument — signature table', () => {
  it('shows signature table row labels', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toHaveTextContent('Company');
    expect(doc()).toHaveTextContent('Signer Name');
    expect(doc()).toHaveTextContent('Title');
    expect(doc()).toHaveTextContent('Notice Address');
    expect(doc()).toHaveTextContent('Signature');
    expect(doc()).toHaveTextContent('Date');
  });

  it('shows PARTY 1 and PARTY 2 column headers', () => {
    render(<NDADocument data={FULL_DATA} />);
    expect(doc()).toHaveTextContent('PARTY 1');
    expect(doc()).toHaveTextContent('PARTY 2');
  });
});
