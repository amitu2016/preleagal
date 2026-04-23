import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NDAForm from '@/components/NDAForm';
import { NDAFormData, DEFAULT_FORM_DATA } from '@/types/nda';

function Wrapper({ initialData = DEFAULT_FORM_DATA }: { initialData?: NDAFormData }) {
  const [data, setData] = useState(initialData);
  return <NDAForm data={data} onChange={setData} />;
}

describe('NDAForm — rendering', () => {
  it('renders the purpose textarea with default value', () => {
    render(<Wrapper />);
    expect(screen.getByDisplayValue(DEFAULT_FORM_DATA.purpose)).toBeInTheDocument();
  });

  it('renders the effective date input', () => {
    render(<Wrapper />);
    expect(screen.getByDisplayValue(DEFAULT_FORM_DATA.effectiveDate)).toBeInTheDocument();
  });

  it('renders MNDA term radio buttons', () => {
    render(<Wrapper />);
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBeGreaterThanOrEqual(4);
  });

  it('has "Expires after" radio checked by default', () => {
    render(<Wrapper />);
    const fixedRadios = screen.getAllByRole('radio');
    // First radio is the "fixed" MNDA term
    expect(fixedRadios[0]).toBeChecked();
  });

  it('has "In perpetuity" radio unchecked by default', () => {
    render(<Wrapper />);
    const inPerpetuityRadio = screen.getByRole('radio', { name: /in perpetuity/i });
    expect(inPerpetuityRadio).not.toBeChecked();
  });

  it('renders governing law input', () => {
    render(<Wrapper />);
    expect(screen.getByPlaceholderText('Delaware')).toBeInTheDocument();
  });

  it('renders jurisdiction input', () => {
    render(<Wrapper />);
    expect(screen.getByPlaceholderText('New Castle, DE')).toBeInTheDocument();
  });

  it('renders modifications textarea', () => {
    render(<Wrapper />);
    expect(
      screen.getByPlaceholderText(/list any modifications/i)
    ).toBeInTheDocument();
  });

  it('renders Party 1 and Party 2 section headers', () => {
    render(<Wrapper />);
    expect(screen.getByText('Party 1')).toBeInTheDocument();
    expect(screen.getByText('Party 2')).toBeInTheDocument();
  });

  it('renders company name inputs for both parties', () => {
    render(<Wrapper />);
    expect(screen.getAllByPlaceholderText('Acme Corp')).toHaveLength(2);
  });

  it('renders signer name inputs for both parties', () => {
    render(<Wrapper />);
    expect(screen.getAllByPlaceholderText('Jane Smith')).toHaveLength(2);
  });

  it('renders title inputs for both parties', () => {
    render(<Wrapper />);
    expect(screen.getAllByPlaceholderText('CEO')).toHaveLength(2);
  });

  it('renders notice address textareas for both parties', () => {
    render(<Wrapper />);
    expect(
      screen.getAllByPlaceholderText('123 Main St, San Francisco, CA 94105')
    ).toHaveLength(2);
  });

  it('renders with pre-filled data when provided', () => {
    const data: NDAFormData = {
      ...DEFAULT_FORM_DATA,
      governingLaw: 'California',
      jurisdiction: 'San Francisco, CA',
    };
    render(<Wrapper initialData={data} />);
    expect(screen.getByDisplayValue('California')).toBeInTheDocument();
    expect(screen.getByDisplayValue('San Francisco, CA')).toBeInTheDocument();
  });
});

describe('NDAForm — interactions', () => {
  it('updates purpose when user types', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const textarea = screen.getByDisplayValue(DEFAULT_FORM_DATA.purpose);
    await user.clear(textarea);
    await user.type(textarea, 'New business purpose');
    expect(screen.getByDisplayValue('New business purpose')).toBeInTheDocument();
  });

  it('clears purpose when user clears the field', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const textarea = screen.getByDisplayValue(DEFAULT_FORM_DATA.purpose);
    await user.clear(textarea);
    expect(textarea).toHaveValue('');
  });

  it('switches MNDA term to until-terminated', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const radio = screen.getByRole('radio', { name: /continues until terminated/i });
    await user.click(radio);
    expect(radio).toBeChecked();
  });

  it('switches confidentiality term to perpetuity', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const radio = screen.getByRole('radio', { name: /in perpetuity/i });
    await user.click(radio);
    expect(radio).toBeChecked();
  });

  it('switches back from perpetuity to fixed confidentiality term', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const perpetuityRadio = screen.getByRole('radio', { name: /in perpetuity/i });
    await user.click(perpetuityRadio);
    expect(perpetuityRadio).toBeChecked();

    const fixedRadios = screen.getAllByRole('radio');
    // Third radio is the fixed confidentiality term
    const fixedConfRadio = fixedRadios[2];
    await user.click(fixedConfRadio);
    expect(fixedConfRadio).toBeChecked();
    expect(perpetuityRadio).not.toBeChecked();
  });

  it('updates governing law', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const input = screen.getByPlaceholderText('Delaware');
    await user.type(input, 'Texas');
    expect(screen.getByDisplayValue('Texas')).toBeInTheDocument();
  });

  it('updates jurisdiction', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const input = screen.getByPlaceholderText('New Castle, DE');
    await user.type(input, 'Austin, TX');
    expect(screen.getByDisplayValue('Austin, TX')).toBeInTheDocument();
  });

  it('updates modifications', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const textarea = screen.getByPlaceholderText(/list any modifications/i);
    await user.type(textarea, 'No IP rights granted.');
    expect(screen.getByDisplayValue('No IP rights granted.')).toBeInTheDocument();
  });

  it('updates party 1 company name', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const [party1Input] = screen.getAllByPlaceholderText('Acme Corp');
    await user.type(party1Input, 'My Company');
    expect(screen.getByDisplayValue('My Company')).toBeInTheDocument();
  });

  it('updates party 2 company name independently of party 1', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const [, party2Input] = screen.getAllByPlaceholderText('Acme Corp');
    await user.type(party2Input, 'Their Company');
    expect(screen.getByDisplayValue('Their Company')).toBeInTheDocument();
  });

  it('updates party 1 signer name', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const [party1Input] = screen.getAllByPlaceholderText('Jane Smith');
    await user.type(party1Input, 'Alice Johnson');
    expect(screen.getByDisplayValue('Alice Johnson')).toBeInTheDocument();
  });

  it('updates party 1 title', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const [party1Input] = screen.getAllByPlaceholderText('CEO');
    await user.type(party1Input, 'CTO');
    expect(screen.getByDisplayValue('CTO')).toBeInTheDocument();
  });

  it('updates party 1 notice address', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const [party1Input] = screen.getAllByPlaceholderText(
      '123 Main St, San Francisco, CA 94105'
    );
    await user.type(party1Input, '99 Elm St, Austin, TX 78701');
    expect(screen.getByDisplayValue('99 Elm St, Austin, TX 78701')).toBeInTheDocument();
  });

  it('calls onChange with the correct shape when purpose is changed', async () => {
    const onChange = jest.fn();
    render(<NDAForm data={DEFAULT_FORM_DATA} onChange={onChange} />);
    const textarea = screen.getByDisplayValue(DEFAULT_FORM_DATA.purpose);
    await userEvent.clear(textarea);
    // onChange fires once per character / on clear — at minimum it must have been called
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as NDAFormData;
    expect(lastCall).toHaveProperty('effectiveDate', DEFAULT_FORM_DATA.effectiveDate);
    expect(lastCall).toHaveProperty('purpose', '');
  });

  it('calls onChange with updated mndaTermType on radio change', async () => {
    const onChange = jest.fn();
    render(<NDAForm data={DEFAULT_FORM_DATA} onChange={onChange} />);
    const radio = screen.getByRole('radio', { name: /continues until terminated/i });
    await userEvent.click(radio);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ mndaTermType: 'until-terminated' })
    );
  });

  it('calls onChange with updated party1 company', async () => {
    const onChange = jest.fn();
    render(<NDAForm data={DEFAULT_FORM_DATA} onChange={onChange} />);
    const [party1Input] = screen.getAllByPlaceholderText('Acme Corp');
    await userEvent.type(party1Input, 'Z');
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as NDAFormData;
    expect(lastCall.party1.company).toBe('Z');
    // party2 should be unchanged
    expect(lastCall.party2).toEqual(DEFAULT_FORM_DATA.party2);
  });
});
