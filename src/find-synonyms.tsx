import { useState } from "react";
import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";

export default function Command() {
  const [word, setWord] = useState<string>("");
  const [definitions, setDefinitions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function searchWord(searchWord: string) {
    if (!searchWord) return;

    setIsLoading(true);
    try {
      // Use a simple Polish dictionary API
      const response = await fetch(`https://sjp.pl/slownik/szukaj.html?szukaj=${encodeURIComponent(searchWord)}`);
      const text = await response.text();
      
      // Basic parsing of definitions
      const definitionRegex = /<div class="haslo">(.*?)<\/div>/g;
      const matches = [...text.matchAll(definitionRegex)];
      
      const extractedDefinitions = matches
        .map(match => match[1])
        .filter(def => def.trim() !== '');

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
              title={def}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard 
                    title="Kopiuj definicję" 
                    content={def} 
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
