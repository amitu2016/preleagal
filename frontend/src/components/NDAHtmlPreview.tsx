'use client';

import { NDAFormData } from '@/types/nda';
import { formatDate, mndaTermText, confidentialityTermText, val } from '@/lib/ndaHelpers';

interface Props {
  data: NDAFormData;
}

function H(text: string) {
  return <span className="font-bold underline">{text}</span>;
}

export default function NDAHtmlPreview({ data }: Props) {
  const purpose = val(data.purpose, '[Purpose]');
  const effectiveDate = formatDate(data.effectiveDate);
  const mndaTerm = mndaTermText(data);
  const confidTerm = confidentialityTermText(data);
  const govLaw = val(data.governingLaw, '[Governing Law]');
  const jurisdiction = val(data.jurisdiction, '[Jurisdiction]');
  const p1company = val(data.party1.company, '[Party 1 Company]');
  const p2company = val(data.party2.company, '[Party 2 Company]');

  const rows: [string, string, string][] = [
    ['Company', p1company, p2company],
    ['Signer Name', val(data.party1.signerName, ''), val(data.party2.signerName, '')],
    ['Title', val(data.party1.title, ''), val(data.party2.title, '')],
    ['Notice Address', val(data.party1.noticeAddress, ''), val(data.party2.noticeAddress, '')],
    ['Signature', '', ''],
    ['Date', '', ''],
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-100 px-6 py-8">
      {/* Page 1 — Cover */}
      <div className="mx-auto mb-8 max-w-[720px] bg-white px-16 py-16 shadow-md font-serif text-[10pt] leading-relaxed text-black">
        <p className="text-center text-[16pt] font-bold">Mutual Non-Disclosure Agreement</p>
        <p className="mt-1 text-center text-[10pt] text-gray-500">{p1company} &amp; {p2company}</p>

        <p className="mt-4 text-[9pt] leading-snug text-gray-600">
          This Mutual Non-Disclosure Agreement (the &ldquo;MNDA&rdquo;) consists of: (1) this Cover Page and
          (2) the Common Paper Mutual NDA Standard Terms Version 1.0. Any modifications of the
          Standard Terms should be made on the Cover Page, which will control over conflicts with
          the Standard Terms.
        </p>

        <hr className="my-4 border-gray-300" />

        <p className="mt-3 font-bold">Purpose</p>
        <p className="text-[8.5pt] italic text-gray-500">How Confidential Information may be used</p>
        <p>{purpose}</p>

        <p className="mt-3 font-bold">Effective Date</p>
        <p>{effectiveDate}</p>

        <p className="mt-3 font-bold">MNDA Term</p>
        <p className="text-[8.5pt] italic text-gray-500">The length of this MNDA</p>
        <p>
          {data.mndaTermType === 'fixed'
            ? `Expires ${data.mndaTermYears} year(s) from Effective Date.`
            : 'Continues until terminated in accordance with the terms of the MNDA.'}
        </p>

        <p className="mt-3 font-bold">Term of Confidentiality</p>
        <p className="text-[8.5pt] italic text-gray-500">How long Confidential Information is protected</p>
        <p>
          {data.confidentialityTermType === 'fixed'
            ? `${data.confidentialityTermYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
            : 'In perpetuity.'}
        </p>

        <p className="mt-3 font-bold">Governing Law &amp; Jurisdiction</p>
        <p>Governing Law: {govLaw}</p>
        <p>Jurisdiction: {jurisdiction}</p>

        {data.modifications.trim() && (
          <>
            <p className="mt-3 font-bold">MNDA Modifications</p>
            <p className="whitespace-pre-wrap">{data.modifications}</p>
          </>
        )}

        <hr className="my-4 border-gray-300" />

        <p className="mb-4">
          By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
        </p>

        {/* Signature table */}
        <table className="w-full border-collapse border border-black text-[9pt]">
          <thead>
            <tr>
              <th className="w-1/4 border border-black p-1" />
              <th className="w-[37.5%] border border-black p-1 text-center">PARTY 1</th>
              <th className="w-[37.5%] border border-black p-1 text-center">PARTY 2</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, v1, v2]) => (
              <tr key={label}>
                <td className="border border-black p-1 font-bold align-top">{label}</td>
                <td className={`border border-black p-1 align-top whitespace-pre-wrap ${label === 'Signature' || label === 'Notice Address' ? 'h-9' : ''}`}>{v1}</td>
                <td className={`border border-black p-1 align-top whitespace-pre-wrap ${label === 'Signature' || label === 'Notice Address' ? 'h-9' : ''}`}>{v2}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-6 text-center text-[8.5pt] text-gray-500">
          Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under CC BY 4.0.
        </p>
      </div>

      {/* Page 2 — Standard Terms */}
      <div className="mx-auto max-w-[720px] bg-white px-16 py-16 shadow-md font-serif text-[10pt] leading-relaxed text-black">
        <p className="mb-4 text-center text-[13pt] font-bold">Standard Terms</p>

        <p className="mb-3 text-justify">
          <strong>1. Introduction. </strong>
          This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the
          Cover Page) (&ldquo;MNDA&rdquo;) allows each party (&ldquo;Disclosing Party&rdquo;) to disclose or make
          available information in connection with the {H(purpose)} which (1) the Disclosing Party
          identifies to the receiving party (&ldquo;Receiving Party&rdquo;) as &ldquo;confidential&rdquo;,
          &ldquo;proprietary&rdquo;, or the like or (2) should be reasonably understood as confidential or
          proprietary due to its nature and the circumstances of its disclosure
          (&ldquo;Confidential Information&rdquo;). Each party&rsquo;s Confidential Information also includes the
          existence and status of the parties&rsquo; discussions and information on the Cover Page.
          Confidential Information includes technical or business information, product designs or
          roadmaps, requirements, pricing, security and compliance documentation, technology,
          inventions and know-how. To use this MNDA, the parties must complete and sign a cover
          page incorporating these Standard Terms (&ldquo;Cover Page&rdquo;). Each party is identified on
          the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.
        </p>

        <p className="mb-3 text-justify">
          <strong>2. Use and Protection of Confidential Information. </strong>
          The Receiving Party shall: (a) use Confidential Information solely for the {H(purpose)};
          (b) not disclose Confidential Information to third parties without the Disclosing Party&rsquo;s
          prior written approval, except that the Receiving Party may disclose Confidential
          Information to its employees, agents, advisors, contractors and other representatives
          having a reasonable need to know for the {H(purpose)}, provided these representatives are
          bound by confidentiality obligations no less protective of the Disclosing Party than the
          applicable terms in this MNDA and the Receiving Party remains responsible for their
          compliance with this MNDA; and (c) protect Confidential Information using at least the
          same protections the Receiving Party uses for its own similar information but no less than
          a reasonable standard of care.
        </p>

        <p className="mb-3 text-justify">
          <strong>3. Exceptions. </strong>
          The Receiving Party&rsquo;s obligations in this MNDA do not apply to information that it can
          demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party;
          (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without
          confidentiality restrictions; (c) it rightfully obtained from a third party without
          confidentiality restrictions; or (d) it independently developed without using or
          referencing the Confidential Information.
        </p>

        <p className="mb-3 text-justify">
          <strong>4. Disclosures Required by Law. </strong>
          The Receiving Party may disclose Confidential Information to the extent required by law,
          regulation or regulatory authority, subpoena or court order, provided (to the extent
          legally permitted) it provides the Disclosing Party reasonable advance notice of the
          required disclosure and reasonably cooperates, at the Disclosing Party&rsquo;s expense, with
          the Disclosing Party&rsquo;s efforts to obtain confidential treatment for the Confidential
          Information.
        </p>

        <p className="mb-3 text-justify">
          <strong>5. Term and Termination. </strong>
          This MNDA commences on the {H(effectiveDate)} and expires at the end of the {H(mndaTerm)}.
          Either party may terminate this MNDA for any or no reason upon written notice to the
          other party. The Receiving Party&rsquo;s obligations relating to Confidential Information will
          survive for the {H(confidTerm)}, despite any expiration or termination of this MNDA.
        </p>

        <p className="mb-3 text-justify">
          <strong>6. Return or Destruction of Confidential Information. </strong>
          Upon expiration or termination of this MNDA or upon the Disclosing Party&rsquo;s earlier
          request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly
          after the Disclosing Party&rsquo;s written request, destroy all Confidential Information in
          the Receiving Party&rsquo;s possession or control or return it to the Disclosing Party; and
          (c) if requested by the Disclosing Party, confirm its compliance with these obligations
          in writing. As an exception to subsection (b), the Receiving Party may retain
          Confidential Information in accordance with its standard backup or record retention
          policies or as required by law, but the terms of this MNDA will continue to apply to the
          retained Confidential Information.
        </p>

        <p className="mb-3 text-justify">
          <strong>7. Proprietary Rights. </strong>
          The Disclosing Party retains all of its intellectual property and other rights in its
          Confidential Information and its disclosure to the Receiving Party grants no license
          under such rights.
        </p>

        <p className="mb-3 text-justify">
          <strong>8. Disclaimer. </strong>
          ALL CONFIDENTIAL INFORMATION IS PROVIDED &ldquo;AS IS&rdquo;, WITH ALL FAULTS, AND WITHOUT
          WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A
          PARTICULAR PURPOSE.
        </p>

        <p className="mb-3 text-justify">
          <strong>9. Governing Law and Jurisdiction. </strong>
          This MNDA and all matters relating hereto are governed by, and construed in accordance
          with, the laws of the State of {H(govLaw)}, without regard to the conflict of laws
          provisions of such {H(govLaw)}. Any legal suit, action, or proceeding relating to this
          MNDA must be instituted in the federal or state courts located in {H(jurisdiction)}. Each
          party irrevocably submits to the exclusive jurisdiction of such courts in {H(jurisdiction)}{' '}
          in any such suit, action, or proceeding.
        </p>

        <p className="mb-3 text-justify">
          <strong>10. Equitable Relief. </strong>
          A breach of this MNDA may cause irreparable harm for which monetary damages are an
          insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to
          seek appropriate equitable relief, including an injunction, in addition to its other
          remedies.
        </p>

        <p className="mb-3 text-justify">
          <strong>11. General. </strong>
          Neither party has an obligation under this MNDA to disclose Confidential Information to
          the other or proceed with any proposed transaction. Neither party may assign this MNDA
          without the prior written consent of the other party, except that either party may assign
          this MNDA in connection with a merger, reorganization, acquisition or other transfer of
          all or substantially all its assets or voting securities. Any assignment in violation of
          this Section is null and void. This MNDA will bind and inure to the benefit of each
          party&rsquo;s permitted successors and assigns. Waivers must be signed by the waiving
          party&rsquo;s authorized representative and cannot be implied from conduct. If any provision
          of this MNDA is held unenforceable, it will be limited to the minimum extent necessary
          so the rest of this MNDA remains in effect. This MNDA (including the Cover Page)
          constitutes the entire agreement of the parties with respect to its subject matter, and
          supersedes all prior and contemporaneous understandings, agreements, representations, and
          warranties, whether written or oral, regarding such subject matter. This MNDA may only
          be amended, modified, waived, or supplemented by an agreement in writing signed by both
          parties. Notices, requests and approvals under this MNDA must be sent in writing to the
          email or postal addresses on the Cover Page and are deemed delivered on receipt. This
          MNDA may be executed in counterparts, including electronic copies, each of which is
          deemed an original and which together form the same agreement.
        </p>

        <p className="mt-6 text-center text-[8.5pt] text-gray-500">
          Common Paper Mutual Non-Disclosure Agreement Version 1.0 — free to use under CC BY 4.0.
        </p>
      </div>
    </div>
  );
}
