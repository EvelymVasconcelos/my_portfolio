import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";

type Tree = { [key: string]: string | Tree };

/** Caminhos de todas as folhas ("hero.title") de um arquivo de mensagens. */
function leaves(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? [path] : leaves(value, path);
  });
}

function values(tree: Tree): string[] {
  return Object.values(tree).flatMap((v) => (typeof v === "string" ? [v] : values(v)));
}

describe("mensagens nos três idiomas", () => {
  const base = leaves(pt as Tree).sort();

  it.each([
    ["en", en],
    ["es", es],
  ] as const)("%s tem exatamente as chaves de pt.json", (_name, messages) => {
    expect(leaves(messages as Tree).sort()).toEqual(base);
  });

  it.each([
    ["pt", pt],
    ["en", en],
    ["es", es],
  ] as const)(
    "%s não tem texto vazio nem travessão (regra de texto da design, D8)",
    (_name, messages) => {
      const texts = values(messages as Tree);
      expect(texts.filter((t) => t.trim() === "")).toEqual([]);
      expect(texts.filter((t) => t.includes("—"))).toEqual([]);
    }
  );
});
