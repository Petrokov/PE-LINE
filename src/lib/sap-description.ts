/**
 * SAP's B2B description arrives with its HTML stripped, so paragraphs and list
 * items are glued together ("850 °C.- Materijal je…", "vode.Prednosti
 * proizvoda:Robusna…"). This puts the breaks back for display; the stored text
 * stays exactly as SAP sent it.
 */
export function formatSapDescription(text: string): string {
  const upper = "A-ZČĆŠŽĐ";
  return text
    .replace(/\r\n/g, "\n")
    // ".- Item" → list item on its own line
    .replace(/([.:!?])\s*-\s+(?=\S)/g, "$1\n- ")
    // "word:Next" — a heading glued to its paragraph
    .replace(new RegExp(`([a-zčćšžđ]):(?=[${upper}])`, "g"), "$1:\n")
    // "word.Next" — two paragraphs glued together (not "1.5" or "PPs/Alu.")
    .replace(new RegExp(`([a-zčćšžđ)"“”])\\.(?=[${upper}][a-zčćšžđ])`, "g"), "$1.\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
