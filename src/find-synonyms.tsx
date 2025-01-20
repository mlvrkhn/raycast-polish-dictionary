import { useState, useEffect } from "react";
import { Action, ActionPanel, List, showToast, Toast, environment } from "@raycast/api";
import * as fs from "fs/promises";
import * as path from "path";
import { findSynonyms } from "./utils/thesaurus";

export default function Command() {
  const [word, setWord] = useState<string>("");
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [thesaurusContent, setThesaurusContent] = useState<string>("");

  // Load thesaurus file once when component mounts
  useEffect(() => {
    async function loadThesaurus() {
      try {
        // Use environment.assetsPath for correct path resolution
        const thesaurusPath = path.join(environment.assetsPath, "thesaurus-utf8.txt");
        const content = await fs.readFile(thesaurusPath, "utf-8");
        setThesaurusContent(content);
      } catch (error) {
        console.error(error);
        await showToast({
          style: Toast.Style.Failure,
          title: "Błąd wczytywania",
          message: "Nie udało się wczytać słownika synonimów.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadThesaurus();
  }, []);

  // Search on each keystroke
  useEffect(() => {
    if (!thesaurusContent || !word) {
      setSynonyms([]);
      return;
    }

    const results = findSynonyms(word, thesaurusContent);
    setSynonyms(results);
  }, [word, thesaurusContent]);

  return (
    <List
      searchText={word}
      onSearchTextChange={setWord}
      searchBarPlaceholder="Wpisz polskie słowo"
      isLoading={isLoading}
    >
      {synonyms.length > 0 ? (
        <List.Section title="Synonimy">
          {synonyms.map((synonym, index) => (
            <List.Item
              key={index}
              title={synonym}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard title="Kopiuj synonim" content={synonym} />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ) : (
        <List.Section title="Wyszukiwanie">
          <List.Item
            title={word ? "Brak synonimów" : "Wpisz słowo aby wyszukać"}
            subtitle={word ? `Nie znaleziono synonimów dla "${word}"` : ""}
          />
        </List.Section>
      )}
    </List>
  );
}
