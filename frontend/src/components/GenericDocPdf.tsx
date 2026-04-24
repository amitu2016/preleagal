'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { DocSlug, DOC_NAMES, PARTY_LABELS, GenericDocFields, GenericPartyInfo } from '@/types/document';

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
  title: { fontSize: 16, fontFamily: 'Times-Bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 10, textAlign: 'center', color: '#555', marginBottom: 20 },
  hr: { borderBottomWidth: 0.5, borderBottomColor: '#cccccc', marginVertical: 14 },
  sectionTitle: { fontSize: 11, fontFamily: 'Times-Bold', marginBottom: 6 },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: 140, color: '#666666', fontSize: 9 },
  value: { flex: 1, fontSize: 9 },
  partyName: { fontFamily: 'Times-Bold', fontSize: 10, marginTop: 10, marginBottom: 4 },
  sigRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  sigBox: { width: 180 },
  sigLabel: { fontSize: 8, color: '#666666', marginBottom: 20 },
  sigLine: { borderBottomWidth: 0.5, borderBottomColor: '#666666' },
  footer: { fontSize: 8, color: '#aaaaaa', textAlign: 'center', marginTop: 24 },
});

function v(val: string | null | undefined, fallback: string) {
  return val?.trim() ? val : fallback;
}

function fmtKey(k: string) {
  return k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

function PartySection({ label, party }: { label: string; party?: GenericPartyInfo }) {
  return (
    <View>
      <Text style={s.partyName}>{label}</Text>
      <View style={s.row}><Text style={s.label}>Company</Text><Text style={s.value}>{v(party?.company, `[${label} Company]`)}</Text></View>
      <View style={s.row}><Text style={s.label}>Signer</Text><Text style={s.value}>{v(party?.signerName, '[Name]')}</Text></View>
      <View style={s.row}><Text style={s.label}>Title</Text><Text style={s.value}>{v(party?.title, '[Title]')}</Text></View>
      <View style={s.row}><Text style={s.label}>Notice Address</Text><Text style={s.value}>{v(party?.noticeAddress, '[Address]')}</Text></View>
    </View>
  );
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');
}

interface Props {
  documentType: DocSlug;
  fields: GenericDocFields;
  templateContent?: string;
}

export default function GenericDocPdf({ documentType, fields, templateContent }: Props) {
  const docName = DOC_NAMES[documentType];
  const [p1Label, p2Label] = PARTY_LABELS[documentType];
  const p1Name = v(fields.party1?.company, p1Label);
  const p2Name = v(fields.party2?.company, p2Label);
  const keyTerms = fields.keyTerms ?? {};

  return (
    <Document>
      <Page style={s.page}>
        <Text style={s.title}>{docName}</Text>
        <Text style={s.subtitle}>{p1Name} &amp; {p2Name}</Text>

        <View style={s.hr} />

        <Text style={s.sectionTitle}>Key Terms</Text>
        <View style={s.row}><Text style={s.label}>Effective Date</Text><Text style={s.value}>{v(fields.effectiveDate, '[Date]')}</Text></View>
        {fields.governingLaw ? <View style={s.row}><Text style={s.label}>Governing Law</Text><Text style={s.value}>{fields.governingLaw}</Text></View> : null}
        {fields.jurisdiction ? <View style={s.row}><Text style={s.label}>Jurisdiction</Text><Text style={s.value}>{fields.jurisdiction}</Text></View> : null}
        {Object.entries(keyTerms).map(([k, val]) => (
          <View key={k} style={s.row}>
            <Text style={s.label}>{fmtKey(k)}</Text>
            <Text style={s.value}>{v(val, `[${fmtKey(k)}]`)}</Text>
          </View>
        ))}

        <View style={s.hr} />

        <Text style={s.sectionTitle}>Parties</Text>
        <PartySection label={p1Label} party={fields.party1} />
        <PartySection label={p2Label} party={fields.party2} />

        <View style={s.hr} />

        <View style={s.sigRow}>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>Signature — {p1Label}</Text>
            <View style={s.sigLine} />
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>Signature — {p2Label}</Text>
            <View style={s.sigLine} />
          </View>
        </View>

        <Text style={s.footer}>Standard terms follow on the next page.</Text>
      </Page>
      {templateContent && (
        <Page style={s.page}>
          <Text style={{ ...s.sectionTitle, marginBottom: 10 }}>Standard Terms</Text>
          {templateContent.split('\n').map((line, i) => {
            const text = stripHtml(line);
            if (!text.trim() || text.startsWith('# ')) return null;
            const indent = (line.match(/^( +)/)?.[1]?.length ?? 0);
            const isSection = /^\d+\. /.test(text.trim()) && indent === 0;
            return (
              <Text
                key={i}
                style={{
                  fontSize: 8.5,
                  marginLeft: Math.min(Math.floor(indent / 4), 4) * 10,
                  marginBottom: isSection ? 4 : 1.5,
                  fontFamily: isSection ? 'Times-Bold' : 'Times-Roman',
                }}
              >
                {text.trim()}
              </Text>
            );
          })}
        </Page>
      )}
    </Document>
  );
}
