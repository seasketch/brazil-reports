export interface LangDetails {
  /** language name in English */
  name: string;
  /** language name in that language */
  localName?: string;
  /** language code, as defined in poeditor */
  code: string;
  /** is language direction right-to-left */
  rtl?: boolean;
}

const languages: LangDetails[] = [
  { name: "English", localName: "English", code: "EN" },
  ...[
    { name: "Spanish", localName: "Español", code: "es" },
    {
      name: "Portuguese",
      localName: "Portuguese",
      code: "pt",
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
];

export default languages;
