'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { NDAFormData } from '@/types/nda';
import { formatDate, mndaTermText, confidentialityTermText, val } from '@/lib/ndaHelpers';

const s = StyleSheet.create({
  page: {
    paddingTop: 72,
    paddingBottom: 72,
    paddingHorizontal: 72,
    fontSize: 10,
    fontFamily: 'Times-Roman',
    color: '#000000',
    lineHeight: 1.5,
  },
  // Cover page
  coverTitle: {
    fontSize: 16,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  coverSubtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 20,
    color: '#444',
  },
  coverInstructions: {
    fontSize: 9,
    color: '#555',
    marginBottom: 18,
    lineHeight: 1.4,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    marginTop: 12,
    marginBottom: 2,
  },
  sectionMeta: {
    fontSize: 8.5,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 3,
  },
  sectionValue: {
    fontSize: 10,
    marginBottom: 2,
  },
  // Signature table
  table: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableLabelCell: {
    width: '25%',
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#000',
    fontSize: 9,
    fontFamily: 'Times-Bold',
  },
  tableDataCell: {
    width: '37.5%',
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#000',
    fontSize: 9,
    minHeight: 20,
  },
  tableDataCellLast: {
    width: '37.5%',
    padding: 5,
    fontSize: 9,
    minHeight: 20,
  },
  tableHeaderCell: {
    width: '37.5%',
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#000',
    fontSize: 9,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
  },
  tableHeaderCellLast: {
    width: '37.5%',
    padding: 5,
    fontSize: 9,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
  },
  // Standard terms page
  termsTitle: {
    fontSize: 13,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  clause: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  clauseText: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  bold: {
    fontFamily: 'Times-Bold',
  },
  footer: {
    fontSize: 8.5,
    color: '#555',
    marginTop: 24,
    textAlign: 'center',
  },
  highlight: {
    fontFamily: 'Times-Bold',
    textDecoration: 'underline',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 16,
  },
});


interface Props {
  data: NDAFormData;
}

export default function NDADocument({ data }: Props) {
  const purpose = val(data.purpose, '[Purpose]');
  const effectiveDate = formatDate(data.effectiveDate);
  const mndaTerm = mndaTermText(data);
  const confidTerm = confidentialityTermText(data);
  const govLaw = val(data.governingLaw, '[Governing Law]');
  const jurisdiction = val(data.jurisdiction, '[Jurisdiction]');
  const p1company = val(data.party1.company, '[Party 1 Company]');
  const p2company = val(data.party2.company, '[Party 2 Company]');

  return (
    <Document title="Mutual Non-Disclosure Agreement" author="Prelegal">
      {/* ── Cover Page ── */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.coverTitle}>Mutual Non-Disclosure Agreement</Text>
        <Text style={s.coverSubtitle}>
          {p1company} &amp; {p2company}
        </Text>

        <Text style={s.coverInstructions}>
          {'This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page and (2) the Common Paper Mutual NDA Standard Terms Version 1.0. Any modifications of the Standard Terms should be made on the Cover Page, which will control over conflicts with the Standard Terms.'}
        </Text>

        <View style={s.divider} />

        {/* Purpose */}
        <Text style={s.sectionLabel}>Purpose</Text>
        <Text style={s.sectionMeta}>How Confidential Information may be used</Text>
        <Text style={s.sectionValue}>{purpose}</Text>

        {/* Effective Date */}
        <Text style={s.sectionLabel}>Effective Date</Text>
        <Text style={s.sectionValue}>{effectiveDate}</Text>

        {/* MNDA Term */}
        <Text style={s.sectionLabel}>MNDA Term</Text>
        <Text style={s.sectionMeta}>The length of this MNDA</Text>
        <Text style={s.sectionValue}>
          {data.mndaTermType === 'fixed'
            ? `Expires ${data.mndaTermYears} year(s) from Effective Date.`
            : 'Continues until terminated in accordance with the terms of the MNDA.'}
        </Text>

        {/* Term of Confidentiality */}
        <Text style={s.sectionLabel}>Term of Confidentiality</Text>
        <Text style={s.sectionMeta}>How long Confidential Information is protected</Text>
        <Text style={s.sectionValue}>
          {data.confidentialityTermType === 'fixed'
            ? `${data.confidentialityTermYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
            : 'In perpetuity.'}
        </Text>

        {/* Governing Law & Jurisdiction */}
        <Text style={s.sectionLabel}>Governing Law &amp; Jurisdiction</Text>
        <Text style={s.sectionValue}>
          {'Governing Law: '}
          {govLaw}
          {'\nJurisdiction: '}
          {jurisdiction}
        </Text>

        {/* Modifications */}
        {data.modifications.trim() ? (
          <>
            <Text style={s.sectionLabel}>MNDA Modifications</Text>
            <Text style={s.sectionValue}>{data.modifications}</Text>
          </>
        ) : null}

        <View style={s.divider} />

        <Text style={[s.sectionValue, { marginBottom: 8 }]}>
          By signing this Cover Page, each party agrees to enter into this MNDA as of the
          Effective Date.
        </Text>

        {/* Signature table */}
        <View style={s.table}>
          <View style={s.tableRow}>
            <View style={s.tableLabelCell}>
              <Text> </Text>
            </View>
            <View style={s.tableHeaderCell}>
              <Text>PARTY 1</Text>
            </View>
            <View style={s.tableHeaderCellLast}>
              <Text>PARTY 2</Text>
            </View>
          </View>
          {[
            ['Company', p1company, p2company],
            ['Signer Name', val(data.party1.signerName, ''), val(data.party2.signerName, '')],
            ['Title', val(data.party1.title, ''), val(data.party2.title, '')],
            [
              'Notice Address',
              val(data.party1.noticeAddress, ''),
              val(data.party2.noticeAddress, ''),
            ],
            ['Signature', '', ''],
            ['Date', '', ''],
          ].map(([label, v1, v2], i, arr) => {
            const isLast = i === arr.length - 1;
            const rowStyle = isLast ? s.tableRowLast : s.tableRow;
            const minH = label === 'Signature' || label === 'Notice Address' ? 36 : 20;
            return (
              <View key={label} style={rowStyle}>
                <View style={s.tableLabelCell}>
                  <Text>{label}</Text>
                </View>
                <View style={[s.tableDataCell, { minHeight: minH }]}>
                  <Text>{v1}</Text>
                </View>
                <View style={[s.tableDataCellLast, { minHeight: minH }]}>
                  <Text>{v2}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={s.footer}>
          Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under CC BY 4.0.
        </Text>
      </Page>

      {/* ── Standard Terms ── */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.termsTitle}>Standard Terms</Text>

        {/* Clause 1 */}
        <View style={s.clause}>
          <Text style={s.clauseText}>
            <Text style={s.bold}>1. Introduction. </Text>
            {'This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page) ("MNDA") allows each party ("Disclosing Party") to disclose or make available information in connection with the '}
            <Text style={s.highlight}>{purpose}</Text>
            {' which (1) the Disclosing Party identifies to the receiving party ("Receiving Party") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("Confidential Information"). Each party\'s Confidential Information also includes the existence and status of the parties\' discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms ("Cover Page"). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.'}
          </Text>
        </View>

        {/* Clause 2 */}
        <View style={s.clause}>
          <Text style={s.clauseText}>
            <Text style={s.bold}>2. Use and Protection of Confidential Information. </Text>
            {'The Receiving Party shall: (a) use Confidential Information solely for the '}
            <Text style={s.highlight}>{purpose}</Text>
            {'; (b) not disclose Confidential Information to third parties without the Disclosing Party\'s prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the '}
            <Text style={s.highlight}>{purpose}</Text>
            {', provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.'}
          </Text>
        </View>

        {/* Clause 3 */}
        <View style={s.clause}>
          <Text style={s.clauseText}>
            <Text style={s.bold}>3. Exceptions. </Text>
            {'The Receiving Party\'s obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.'}
          </Text>
        </View>

        {/* Clause 4 */}
        <View style={s.clause}>
          <Text style={s.clauseText}>
            <Text style={s.bold}>4. Disclosures Required by Law. </Text>
            {'The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party\'s expense, with the Disclosing Party\'s efforts to obtain confidential treatment for the Confidential Information.'}
          </Text>
        </View>

        {/* Clause 5 */}
        <View style={s.clause}>
          <Text style={s.clauseText}>
            <Text style={s.bold}>5. Term and Termination. </Text>
            {'This MNDA commences on the '}
            <Text style={s.highlight}>{effectiveDate}</Text>
            {' and expires at the end of the '}
            <Text style={s.highlight}>{mndaTerm}</Text>
            {'. Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party\'s obligations relating to Confidential Information will survive for the '}
            <Text style={s.highlight}>{confidTerm}</Text>
            {', despite any expiration or termination of this MNDA.'}
          </Text>
        </View>

        {/* Clause 6 */}
        <View style={s.clause}>
          <Text style={s.clauseText}>
            <Text style={s.bold}>6. Return or Destruction of Confidential Information. </Text>
            {'Upon expiration or termination of this MNDA or upon the Disclosing Party\'s earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party\'s written request, destroy all Confidential Information in the Receiving Party\'s possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.'}
          </Text>
        </View>

        {/* Clause 7 */}
        <View style={s.clause}>
          <Text style={s.clauseText}>
            <Text style={s.bold}>7. Proprietary Rights. </Text>
            {'The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.'}
          </Text>
        </View>

        {/* Clause 8 */}
        <View style={s.clause}>
          <Text style={s.clauseText}>
            <Text style={s.bold}>8. Disclaimer. </Text>
            {'ALL CONFIDENTIAL INFORMATION IS PROVIDED "AS IS", WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.'}
          </Text>
        </View>

        {/* Clause 9 */}
        <View style={s.clause}>
          <Text style={s.clauseText}>
            <Text style={s.bold}>9. Governing Law and Jurisdiction. </Text>
            {'This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of '}
            <Text style={s.highlight}>{govLaw}</Text>
            {', without regard to the conflict of laws provisions of such '}
            <Text style={s.highlight}>{govLaw}</Text>
            {'. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in '}
            <Text style={s.highlight}>{jurisdiction}</Text>
            {'. Each party irrevocably submits to the exclusive jurisdiction of such courts in '}
            <Text style={s.highlight}>{jurisdiction}</Text>
            {' in any such suit, action, or proceeding.'}
          </Text>
        </View>

        {/* Clause 10 */}
        <View style={s.clause}>
          <Text style={s.clauseText}>
            <Text style={s.bold}>10. Equitable Relief. </Text>
            {'A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.'}
          </Text>
        </View>

        {/* Clause 11 */}
        <View style={s.clause}>
          <Text style={s.clauseText}>
            <Text style={s.bold}>11. General. </Text>
            {'Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party\'s permitted successors and assigns. Waivers must be signed by the waiving party\'s authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.'}
          </Text>
        </View>

        <Text style={s.footer}>
          Common Paper Mutual Non-Disclosure Agreement Version 1.0 — free to use under CC BY 4.0.
        </Text>
      </Page>
    </Document>
  );
}
