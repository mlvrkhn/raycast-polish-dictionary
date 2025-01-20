import { useState } from "react";
import { Action, ActionPanel, Form, List, showToast, Toast } from "@raycast/api";
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
      // Note: This is a mock implementation. Replace with actual SJP API when available
      const mockDefinitions: WordDefinition[] = [
        {
          definition: "Główne znaczenie słowa",
          synonyms: ["synonim1", "synonim2"]
        }
      ];

      setDefinitions(mockDefinitions);
      
      if (mockDefinitions.length === 0) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Nie znaleziono definicji",
          message: `Brak informacji dla słowa "${searchWord}"`
        });
      }
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Błąd wyszukiwania",
        message: "Nie udało się pobrać definicji"
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
        <List.Section title="Definicje i synonimy">
          {definitions.map((def, index) => (
            <List.Item
              key={index}
              title={def.definition}
              subtitle={def.synonyms ? `Synonimy: ${def.synonyms.join(", ")}` : undefined}
              actions={
                <ActionPanel>
                  {def.synonyms && def.synonyms.map((synonym, synIndex) => (
                    <Action.CopyToClipboard 
                      key={synIndex} 
                      title={`Kopiuj synonim: ${synonym}`} 
                      content={synonym} 
                    />
                  ))}
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
