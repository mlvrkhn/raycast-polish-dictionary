import { ThesaurusEntry } from "../types";

const COMMENT_CHAR = "#";
const SEPARATOR = ";";

export function normalizePolish(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/ż/g, "z")
    .replace(/ź/g, "z")
    .trim();
}

export function parseThesaurusLine(line: string): ThesaurusEntry | null {
  const trimmedLine = line.trim();
  
  if (!trimmedLine || trimmedLine.startsWith(COMMENT_CHAR)) {
    return null;
  }

  const parts = trimmedLine.split(SEPARATOR);
  if (parts.length < 2) {
    return null;
  }

  const [word, ...synonyms] = parts;
  return {
    word: word.trim(),
    synonyms: synonyms
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => s !== word), // Remove self-references
  };
}

export function findSynonyms(searchWord: string, thesaurusContent: string): string[] {
  const normalizedSearch = normalizePolish(searchWord);
  if (!normalizedSearch) {
    return [];
  }

  const lines = thesaurusContent.split("\n");
  const matches = new Set<string>();

  for (const line of lines) {
    const entry = parseThesaurusLine(line);
    if (!entry) continue;

    const normalizedWord = normalizePolish(entry.word);
    
    // Direct match with the word
    if (normalizedWord === normalizedSearch) {
      entry.synonyms.forEach((s) => matches.add(s));
      continue;
    }

    // Check if search term is in synonyms
    const normalizedSynonyms = entry.synonyms.map(normalizePolish);
    if (normalizedSynonyms.includes(normalizedSearch)) {
      matches.add(entry.word);
      entry.synonyms
        .filter((s) => normalizePolish(s) !== normalizedSearch)
        .forEach((s) => matches.add(s));
    }
  }

  return Array.from(matches);
}
