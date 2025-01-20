import { useState, useEffect } from "react";
import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import { readFileSync } from "fs";
import { join } from "path";
import { findSynonyms } from "./utils/thesaurus";

interface State {
  synonyms: string[];
  isLoading: boolean;
}

export default function Command() {
  const [word, setWord] = useState<string>("");
  const [state, setState] = useState<State>({
    synonyms: [],
    isLoading: false
  });

  const searchWord = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setState({ synonyms: [], isLoading: false });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Use the exact path where Raycast is looking
      const extensionDir = '/Users/mlvrkhn/.config/raycast/extensions/polish-thesaurus';
      const thesaurusPath = join(extensionDir, "thesaurus-1.5.txt");
      console.log('Looking for thesaurus at:', thesaurusPath);
      const thesaurusContent = readFileSync(thesaurusPath, 'utf8');
      
      // Find synonyms
      const foundSynonyms = findSynonyms(searchTerm, thesaurusContent);
      
      setState({
        synonyms: foundSynonyms,
        isLoading: false
      });

      if (foundSynonyms.length === 0) {
        showToast({
          style: Toast.Style.Failure,
          title: "Nie znaleziono synonimów",
          message: `Brak synonimów dla słowa "${searchTerm}"`
        });
      }
    } catch (error) {
      console.error('Error reading thesaurus:', error);  // Add error logging
      showToast({
        style: Toast.Style.Failure,
        title: "Błąd",
        message: "Nie udało się wczytać słownika synonimów"
      });
      setState({ synonyms: [], isLoading: false });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (word) {
        searchWord(word);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [word]);

  return (
    <List
      searchText={word}
      onSearchTextChange={setWord}
      searchBarPlaceholder="Wpisz polskie słowo"
      isLoading={state.isLoading}
    >
      {state.synonyms.length > 0 ? (
        <List.Section title="Synonimy">
          {state.synonyms.map((synonym, index) => (
            <List.Item
              key={index}
              title={synonym}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard 
                    title="Kopiuj synonim" 
                    content={synonym} 
                  />
                  <Action
                    title="Szukaj tego synonimu"
                    onAction={() => {
                      setWord(synonym);
                    }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ) : (
        <List.EmptyView
          title="Wpisz słowo aby znaleźć synonimy"
          description="Synonimy zostaną wyświetlone automatycznie podczas wpisywania"
        />
      )}
    </List>
  );
}
