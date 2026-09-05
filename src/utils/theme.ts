export type EditorialTheme = 'petrol' | 'plum' | 'midnight' | 'emerald';

export interface EditorialPaletteConfig {
  id: EditorialTheme;
  name: string;
  pdfSource: string;
  pdfPage: string;
  summary: string;
  sampleColorHex: string;
  accentHex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  headlineAccentClass: string;
  eyebrowBgClass: string;
  eyebrowTextClass: string;
  innerBoxBgClass: string;
  innerBoxBorderClass: string;
  inputBgClass: string;
  inputBorderClass: string;
  buttonBgClass: string;
  buttonHoverBgClass: string;
  buttonTextClass: string;
  secondaryButtonBgClass: string;
  secondaryButtonTextClass: string;
  secondaryButtonBorderClass: string;
  watermarkTextClass: string;
  subtitleClass: string;
  mutedClass: string;
  dotColor: string;
  glowClass: string;
}

export const EDITORIAL_PALETTES: Record<EditorialTheme, EditorialPaletteConfig> = {
  petrol: {
    id: 'petrol',
    name: 'Deep Slate Petrol',
    pdfSource: 'Page 4 Contents & Page 9 Overambitious',
    pdfPage: 'p. 04 / 09 / 20',
    summary: 'Iconic Superside report hero palette: oceanic petrol teal with electric tennis lime and ice cyan accents.',
    sampleColorHex: '#143d46',
    accentHex: '#d4f04c',
    bgClass: 'bg-[#143d46]',
    borderClass: 'border-[#1e535e]',
    textClass: 'text-[#f7f6f1]',
    headlineAccentClass: 'text-[#d4f04c]',
    eyebrowBgClass: 'bg-[#d4f04c]',
    eyebrowTextClass: 'text-[#0c262d]',
    innerBoxBgClass: 'bg-[#0f3139]',
    innerBoxBorderClass: 'border-[#1d4e5a]',
    inputBgClass: 'bg-[#0f3139]',
    inputBorderClass: 'border-[#1d4e5a]',
    buttonBgClass: 'bg-[#d4f04c]',
    buttonHoverBgClass: 'hover:bg-[#c3e038]',
    buttonTextClass: 'text-[#0c262d]',
    secondaryButtonBgClass: 'bg-[#0f3139]',
    secondaryButtonTextClass: 'text-white',
    secondaryButtonBorderClass: 'border-[#1e535e]',
    watermarkTextClass: 'text-[#1b4c57]',
    subtitleClass: 'text-[#c8dce2]',
    mutedClass: 'text-[#8faeb7]',
    dotColor: 'bg-[#d4f04c]',
    glowClass: 'shadow-[0_4px_24px_rgba(20,61,70,0.25)]',
  },
  plum: {
    id: 'plum',
    name: 'Mulberry Plum Noir',
    pdfSource: 'Page 11 Overwhelmed & Page 17 Overqualified',
    pdfPage: 'p. 11 / 17 / 28',
    summary: 'Velvety espresso plum noir paired with soft candy rose pink and warm vanilla cream.',
    sampleColorHex: '#291c24',
    accentHex: '#f8a5c2',
    bgClass: 'bg-[#291c24]',
    borderClass: 'border-[#3d2b37]',
    textClass: 'text-[#fdf8f5]',
    headlineAccentClass: 'text-[#f8a5c2]',
    eyebrowBgClass: 'bg-[#f8a5c2]',
    eyebrowTextClass: 'text-[#2a1320]',
    innerBoxBgClass: 'bg-[#1e131a]',
    innerBoxBorderClass: 'border-[#382331]',
    inputBgClass: 'bg-[#1e131a]',
    inputBorderClass: 'border-[#382331]',
    buttonBgClass: 'bg-[#f8a5c2]',
    buttonHoverBgClass: 'hover:bg-[#f691b2]',
    buttonTextClass: 'text-[#2a1320]',
    secondaryButtonBgClass: 'bg-[#1e131a]',
    secondaryButtonTextClass: 'text-white',
    secondaryButtonBorderClass: 'border-[#3d2b37]',
    watermarkTextClass: 'text-[#372430]',
    subtitleClass: 'text-[#e5ccd7]',
    mutedClass: 'text-[#ab8c9c]',
    dotColor: 'bg-[#f8a5c2]',
    glowClass: 'shadow-[0_4px_24px_rgba(41,28,36,0.25)]',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Ink Slate',
    pdfSource: 'Page 12 Creative Leaders & Page 30 Qualitative',
    pdfPage: 'p. 12 / 30',
    summary: 'High-contrast midnight slate ink with chartreuse lime and multi-pastel data nodes.',
    sampleColorHex: '#0e2127',
    accentHex: '#e2f752',
    bgClass: 'bg-[#0e2127]',
    borderClass: 'border-[#1b3a43]',
    textClass: 'text-[#f4f7f8]',
    headlineAccentClass: 'text-[#e2f752]',
    eyebrowBgClass: 'bg-[#e2f752]',
    eyebrowTextClass: 'text-[#08181c]',
    innerBoxBgClass: 'bg-[#09171c]',
    innerBoxBorderClass: 'border-[#17333c]',
    inputBgClass: 'bg-[#09171c]',
    inputBorderClass: 'border-[#17333c]',
    buttonBgClass: 'bg-[#e2f752]',
    buttonHoverBgClass: 'hover:bg-[#d4ea45]',
    buttonTextClass: 'text-[#08181c]',
    secondaryButtonBgClass: 'bg-[#09171c]',
    secondaryButtonTextClass: 'text-white',
    secondaryButtonBorderClass: 'border-[#1b3a43]',
    watermarkTextClass: 'text-[#18363f]',
    subtitleClass: 'text-[#b9d3dc]',
    mutedClass: 'text-[#799fa9]',
    dotColor: 'bg-[#e2f752]',
    glowClass: 'shadow-[0_4px_24px_rgba(14,33,39,0.3)]',
  },
  emerald: {
    id: 'emerald',
    name: 'Court Pine & Lime',
    pdfSource: 'Page 1 Cover & Page 14 Overloaded',
    pdfPage: 'p. 01 / 14',
    summary: 'Dark table tennis court pine green with high-voltage fluorescent tennis ball lime.',
    sampleColorHex: '#13372c',
    accentHex: '#d4f04c',
    bgClass: 'bg-[#13372c]',
    borderClass: 'border-[#1c4d3e]',
    textClass: 'text-[#f5faf7]',
    headlineAccentClass: 'text-[#d4f04c]',
    eyebrowBgClass: 'bg-[#d4f04c]',
    eyebrowTextClass: 'text-[#0b241c]',
    innerBoxBgClass: 'bg-[#0e2921]',
    innerBoxBorderClass: 'border-[#174134]',
    inputBgClass: 'bg-[#0e2921]',
    inputBorderClass: 'border-[#174134]',
    buttonBgClass: 'bg-[#d4f04c]',
    buttonHoverBgClass: 'hover:bg-[#c3e038]',
    buttonTextClass: 'text-[#0b241c]',
    secondaryButtonBgClass: 'bg-[#0e2921]',
    secondaryButtonTextClass: 'text-white',
    secondaryButtonBorderClass: 'border-[#1c4d3e]',
    watermarkTextClass: 'text-[#194537]',
    subtitleClass: 'text-[#bdded2]',
    mutedClass: 'text-[#7ca897]',
    dotColor: 'bg-[#d4f04c]',
    glowClass: 'shadow-[0_4px_24px_rgba(19,55,44,0.25)]',
  },
};
