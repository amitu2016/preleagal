'use client';

import { NDAFormData, PartyInfo } from '@/types/nda';

interface Props {
  data: NDAFormData;
  onChange: (data: NDAFormData) => void;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1">
      {title}
    </h3>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

function PartyFields({
  label,
  party,
  onChange,
}: {
  label: string;
  party: PartyInfo;
  onChange: (p: PartyInfo) => void;
}) {
  function set(key: keyof PartyInfo, value: string) {
    onChange({ ...party, [key]: value });
  }
  return (
    <>
      <SectionHeader title={label} />
      <Field label="Company Name">
        <input
          className={inputCls}
          value={party.company}
          onChange={(e) => set('company', e.target.value)}
          placeholder="Acme Corp"
        />
      </Field>
      <Field label="Signer Name">
        <input
          className={inputCls}
          value={party.signerName}
          onChange={(e) => set('signerName', e.target.value)}
          placeholder="Jane Smith"
        />
      </Field>
      <Field label="Title">
        <input
          className={inputCls}
          value={party.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="CEO"
        />
      </Field>
      <Field label="Notice Address">
        <textarea
          className={inputCls}
          rows={2}
          value={party.noticeAddress}
          onChange={(e) => set('noticeAddress', e.target.value)}
          placeholder="123 Main St, San Francisco, CA 94105"
        />
      </Field>
    </>
  );
}

export default function NDAForm({ data, onChange }: Props) {
  function set<K extends keyof NDAFormData>(key: K, value: NDAFormData[K]) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-5">
      <SectionHeader title="Purpose & Dates" />

      <Field label="Purpose">
        <textarea
          className={inputCls}
          rows={3}
          value={data.purpose}
          onChange={(e) => set('purpose', e.target.value)}
        />
      </Field>

      <Field label="Effective Date">
        <input
          type="date"
          className={inputCls}
          value={data.effectiveDate}
          onChange={(e) => set('effectiveDate', e.target.value)}
        />
      </Field>

      <SectionHeader title="MNDA Term" />

      <Field label="Duration">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={data.mndaTermType === 'fixed'}
              onChange={() => set('mndaTermType', 'fixed')}
            />
            Expires after
            <input
              type="number"
              min={1}
              className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm"
              value={data.mndaTermYears}
              disabled={data.mndaTermType !== 'fixed'}
              onChange={(e) => set('mndaTermYears', Math.max(1, Number(e.target.value)))}
            />
            year(s) from Effective Date
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={data.mndaTermType === 'until-terminated'}
              onChange={() => set('mndaTermType', 'until-terminated')}
            />
            Continues until terminated
          </label>
        </div>
      </Field>

      <SectionHeader title="Term of Confidentiality" />

      <Field label="Duration">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={data.confidentialityTermType === 'fixed'}
              onChange={() => set('confidentialityTermType', 'fixed')}
            />
            <input
              type="number"
              min={1}
              className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm"
              value={data.confidentialityTermYears}
              disabled={data.confidentialityTermType !== 'fixed'}
              onChange={(e) =>
                set('confidentialityTermYears', Math.max(1, Number(e.target.value)))
              }
            />
            year(s) from Effective Date
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={data.confidentialityTermType === 'perpetuity'}
              onChange={() => set('confidentialityTermType', 'perpetuity')}
            />
            In perpetuity
          </label>
        </div>
      </Field>

      <SectionHeader title="Legal" />

      <Field label="Governing Law (State)">
        <input
          className={inputCls}
          value={data.governingLaw}
          onChange={(e) => set('governingLaw', e.target.value)}
          placeholder="Delaware"
        />
      </Field>

      <Field label="Jurisdiction (Court Location)">
        <input
          className={inputCls}
          value={data.jurisdiction}
          onChange={(e) => set('jurisdiction', e.target.value)}
          placeholder="New Castle, DE"
        />
      </Field>

      <Field label="MNDA Modifications (optional)">
        <textarea
          className={inputCls}
          rows={3}
          value={data.modifications}
          onChange={(e) => set('modifications', e.target.value)}
          placeholder="List any modifications to the standard terms…"
        />
      </Field>

      <PartyFields
        label="Party 1"
        party={data.party1}
        onChange={(p) => set('party1', p)}
      />

      <PartyFields
        label="Party 2"
        party={data.party2}
        onChange={(p) => set('party2', p)}
      />

      <div className="h-6" />
    </div>
  );
}
