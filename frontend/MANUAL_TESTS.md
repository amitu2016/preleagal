# Manual Test Checklist — Mutual NDA Creator

Run these tests in a browser after `npm run dev`.

---

## 1. Layout & Initial State

- [ ] Page loads without console errors
- [ ] Header shows "Mutual NDA Creator" and the subtitle text
- [ ] Left panel contains the form; right panel shows the PDF preview
- [ ] Preview renders a PDF immediately on load (default values)
- [ ] "Download PDF" button is visible in the preview header
- [ ] The PDF shows two pages: Cover Page and Standard Terms

---

## 2. Purpose Field

- [ ] Default purpose text is pre-filled in the textarea
- [ ] Typing new text updates the textarea instantly
- [ ] After ~600 ms of not typing, the PDF preview refreshes with the new purpose
- [ ] The purpose text appears in Clause 1 and Clause 2 of the Standard Terms page
- [ ] Clearing the field shows "[Purpose]" placeholder in the PDF

---

## 3. Effective Date

- [ ] Today's date is pre-selected by default
- [ ] Changing the date updates the preview after the debounce delay
- [ ] The formatted date (e.g. "June 15, 2024") appears on the cover page and in Clause 5
- [ ] Clearing the date shows "[Effective Date]" in the PDF

---

## 4. MNDA Term

- [ ] "Expires after" radio is selected by default with 1 year
- [ ] The year number input is enabled when "Expires after" is selected
- [ ] Changing the year number updates the PDF (e.g. "Expires 3 year(s) from Effective Date")
- [ ] Selecting "Continues until terminated" disables the year number input
- [ ] The PDF shows "Continues until terminated…" text on the cover page when selected
- [ ] Switching back to "Expires after" re-enables the year field

---

## 5. Term of Confidentiality

- [ ] "Fixed years" radio is selected by default with 1 year
- [ ] The year number input is enabled for fixed terms
- [ ] Changing years updates the PDF after debounce
- [ ] Selecting "In perpetuity" disables the year number input
- [ ] The PDF shows "In perpetuity." on the cover page when selected
- [ ] Clause 5 on the Standard Terms page reflects the confidentiality term

---

## 6. Legal Section

- [ ] Governing Law input is empty by default
- [ ] Typing "Delaware" shows "[Governing Law]" placeholder replaced with "Delaware" in PDF (after debounce)
- [ ] Governing Law appears in Clause 9 of the Standard Terms
- [ ] Jurisdiction input is empty by default
- [ ] Typing a jurisdiction updates Clause 9 of the Standard Terms
- [ ] Empty Governing Law shows "[Governing Law]"; empty jurisdiction shows "[Jurisdiction]"

---

## 7. MNDA Modifications

- [ ] Modifications textarea is empty by default
- [ ] The "MNDA Modifications" section does NOT appear on the cover page when empty
- [ ] Typing a modification causes the section to appear on the cover page (after debounce)
- [ ] Clearing the modifications field removes the section from the PDF

---

## 8. Party 1 Fields

- [ ] All four Party 1 fields are empty by default
- [ ] Company Name: typing "Acme Corp" updates the cover page subtitle and signature table
- [ ] Empty company name shows "[Party 1 Company]" in the subtitle and signature table
- [ ] Signer Name: appears in the signature table after debounce
- [ ] Title: appears in the signature table after debounce
- [ ] Notice Address: appears in the signature table; textarea supports multi-line

---

## 9. Party 2 Fields

- [ ] All four Party 2 fields are empty by default
- [ ] Updating Party 2 fields does not affect Party 1 fields and vice versa
- [ ] Company Name appears in the cover subtitle as "Party1 & Party2"
- [ ] Signature table shows Party 2 data in the right column

---

## 10. Debounce Behaviour

- [ ] Rapidly typing in any field does NOT reload the PDF on every keystroke
- [ ] The form shows every character as it is typed (no delay on the input itself)
- [ ] After pausing for ~600 ms, the PDF preview reloads exactly once
- [ ] The "Preparing PDF…" state briefly appears during regeneration, then returns to "Download PDF"

---

## 11. Download PDF

- [ ] "Download PDF" button is disabled (greyed out) while the PDF is generating
- [ ] After generation, the button becomes active and clickable
- [ ] Clicking "Download PDF" downloads a file named `Mutual-NDA-<Party1>-<Party2>.pdf`
- [ ] When both company names are empty, the filename is `Mutual-NDA-Party1-Party2.pdf`
- [ ] The downloaded PDF contains both the Cover Page and Standard Terms

---

## 12. Signature Table (Cover Page)

- [ ] Table has columns: (label), PARTY 1, PARTY 2
- [ ] Rows: Company, Signer Name, Title, Notice Address, Signature, Date
- [ ] "Signature" and "Notice Address" rows are taller than other rows
- [ ] Data entered in the form appears in the correct cells

---

## 13. Standard Terms Page

- [ ] All 11 clauses are present (Introduction through General)
- [ ] Clause 1 and 2 reference the purpose text entered in the form
- [ ] Clause 5 references the effective date, MNDA term, and confidentiality term
- [ ] Clause 9 references the governing law and jurisdiction
- [ ] Footer reads "Common Paper Mutual Non-Disclosure Agreement Version 1.0"

---

## 14. Responsive / Edge Cases

- [ ] Very long company names do not break the signature table layout
- [ ] Very long purpose text wraps correctly in the PDF
- [ ] Setting MNDA term years to 0 or negative is prevented (min=1 enforced)
- [ ] Setting confidentiality years to 0 or negative is prevented (min=1 enforced)
- [ ] Scrolling the form does not affect the preview panel
- [ ] The form panel is independently scrollable

---

## 15. Accessibility

- [ ] All form labels are associated with their inputs
- [ ] Radio button groups are keyboard-navigable (arrow keys)
- [ ] Tab order through the form is logical (top to bottom)
- [ ] "Download PDF" link has `aria-disabled` when inactive
