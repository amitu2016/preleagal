'use client';

import { DocSlug, DOC_NAMES, PARTY_LABELS, GenericDocFields, GenericPartyInfo } from '@/types/document';

interface Props {
  documentType: DocSlug;
  fields: GenericDocFields;
}

function val(v: string | null | undefined, fallback: string) {
  return v?.trim() ? v : fallback;
}

function formatKey(k: string): string {
  return k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

function PartyBlock({ label, party }: { label: string; party?: GenericPartyInfo }) {
  return (
    <div className="mt-3">
      <p className="font-bold">{label}</p>
      <table className="mt-1 w-full text-[9pt]">
        <tbody>
          <tr>
            <td className="w-36 py-0.5 text-gray-500">Company</td>
            <td>{val(party?.company, `[${label} Company]`)}</td>
          </tr>
          <tr>
            <td className="py-0.5 text-gray-500">Signer</td>
            <td>{val(party?.signerName, '[Name]')}</td>
          </tr>
          <tr>
            <td className="py-0.5 text-gray-500">Title</td>
            <td>{val(party?.title, '[Title]')}</td>
          </tr>
          <tr>
            <td className="py-0.5 text-gray-500">Notice Address</td>
            <td>{val(party?.noticeAddress, '[Address]')}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function GenericDocPreview({ documentType, fields }: Props) {
  const docName = DOC_NAMES[documentType];
  const [p1Label, p2Label] = PARTY_LABELS[documentType];
  const p1Name = val(fields.party1?.company, p1Label);
  const p2Name = val(fields.party2?.company, p2Label);
  const keyTerms = fields.keyTerms ?? {};
  const hasKeyTerms = Object.keys(keyTerms).length > 0;

  return (
    <div className="h-full overflow-y-auto bg-gray-100 px-6 py-8">
      <div className="mx-auto max-w-[720px] bg-white px-16 py-16 shadow-md font-serif text-[10pt] leading-relaxed text-black">
        <p className="text-center text-[16pt] font-bold">{docName}</p>
        <p className="mt-1 text-center text-[10pt] text-gray-500">
          {p1Name} &amp; {p2Name}
        </p>

        <hr className="my-6 border-gray-300" />

        <p className="text-[11pt] font-bold">Key Terms</p>
        <div className="mt-3 space-y-1.5 text-[9.5pt]">
          <div className="flex gap-2">
            <span className="w-48 shrink-0 text-gray-500">Effective Date</span>
            <span>{val(fields.effectiveDate, '[Date]')}</span>
          </div>
          {fields.governingLaw && (
            <div className="flex gap-2">
              <span className="w-48 shrink-0 text-gray-500">Governing Law</span>
              <span>{fields.governingLaw}</span>
            </div>
          )}
          {fields.jurisdiction && (
            <div className="flex gap-2">
              <span className="w-48 shrink-0 text-gray-500">Jurisdiction</span>
              <span>{fields.jurisdiction}</span>
            </div>
          )}
          {hasKeyTerms &&
            Object.entries(keyTerms).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="w-48 shrink-0 text-gray-500">{formatKey(k)}</span>
                <span>{val(v, `[${formatKey(k)}]`)}</span>
              </div>
            ))}
        </div>

        <hr className="my-6 border-gray-300" />

        <p className="text-[11pt] font-bold">Parties</p>
        <PartyBlock label={p1Label} party={fields.party1} />
        <PartyBlock label={p2Label} party={fields.party2} />

        <hr className="my-6 border-gray-300" />

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-[8.5pt] text-gray-500">Signature — {p1Label}</p>
            <div className="mt-6 border-t border-gray-400 w-48" />
          </div>
          <div>
            <p className="text-[8.5pt] text-gray-500">Signature — {p2Label}</p>
            <div className="mt-6 border-t border-gray-400 w-48" />
          </div>
        </div>

        <p className="mt-8 text-center text-[8pt] text-gray-400">
          Preview shows key terms. Standard terms incorporated by reference.
        </p>
      </div>
    </div>
  );
}
