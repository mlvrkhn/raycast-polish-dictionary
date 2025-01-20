interface ThesaurusEntry {
  word: string;
  synonyms: string[];
}

export function parseThesaurusLine(line: string): ThesaurusEntry | null {
  if (line.startsWith('#') || !line.trim()) {
    return null;
  }
  
  const parts = line.split(';');
  if (parts.length < 2) {
    return null;
  }

  return {
    word: parts[0].trim(),
    synonyms: parts.slice(1).map(s => s.trim())
  };
}

export function findSynonyms(searchWord: string, thesaurusContent: string): string[] {
  const lines = thesaurusContent.split('\n');
  const matches: string[] = [];

  for (const line of lines) {
    const entry = parseThesaurusLine(line);
    if (!entry) continue;

    // Check if word matches either the main word or any of its synonyms
    if (entry.word.toLowerCase() === searchWord.toLowerCase()) {
      matches.push(...entry.synonyms);
    } else if (entry.synonyms.some(s => s.toLowerCase() === searchWord.toLowerCase())) {
      matches.push(entry.word);
      matches.push(...entry.synonyms.filter(s => s.toLowerCase() !== searchWord.toLowerCase()));
    }
  }

  return [...new Set(matches)]; // Remove duplicates
} 