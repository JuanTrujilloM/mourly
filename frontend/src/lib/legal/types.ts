export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  intro?: string;
  version: string;
  updatedAt: string;
  sections: LegalSection[];
}
