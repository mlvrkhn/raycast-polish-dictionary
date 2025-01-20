import { useState } from "react";
import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import axios from "axios";

interface WordDefinition {
  definition: string;
  synonyms?: string[];
}

export default function Command() {
  const [word, setWord] = useState<string>("");
  const [definitions, setDefinitions] = useState<WordDefinition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function searchWord(searchWord: string) {
    if (!searchWord) return;

    setIsLoading(true);
    try {
      // Use a proxy to avoid CORS issues
      const response = await axios.get(`https://cors-anywhere.herokuapp.com/https://sjp.pl/slownik/szukaj.html?szukaj=${encodeURIComponent(searchWord)}`);
      
      // Basic web scraping (very rudimentary, needs improvement)
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, 'text/html');
      
      const definitionElements = doc.querySelectorAll('.haslo');
      const extractedDefinitions: WordDefinition[] = Array.from(definitionElements).map(el => ({
        definition: el.textContent || '',
        synonyms: [] // SJP.pl doesn't directly provide synonyms
      }));

      setDefinitions(extractedDefinitions);
      
      if (extractedDefinitions.length === 0) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Nie znaleziono definicji",
          message: `Brak informacji dla słowa "${searchWord}"`
        });
      }
    } catch (error) {
      console.error(error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Błąd wyszukiwania",
        message: "Nie udało się pobrać definicji. Sprawdź połączenie internetowe."
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <List
      searchText={word}
      onSearchTextChange={setWord}
      searchBarPlaceholder="Wpisz polskie słowo"
      isLoading={isLoading}
    >
      {definitions.length > 0 ? (
        <List.Section title="Definicje">
          {definitions.map((def, index) => (
            <List.Item
              key={index}
              title={def.definition}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard 
                    title="Kopiuj definicję" 
                    content={def.definition} 
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ) : (
        <List.Section title="Wyszukiwanie">
          <List.Item
            title="Znajdź definicję"
            subtitle="Naciśnij Enter, aby wyszukać"
            actions={
              <ActionPanel>
                <Action 
                  title="Szukaj" 
                  onAction={() => searchWord(word)} 
                />
              </ActionPanel>
            }
          />
        </List.Section>
      )}
    </List>
  );
}
