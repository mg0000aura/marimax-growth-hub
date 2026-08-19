import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

type Search = { q?: string; cat?: string };

export const Route = createFileRoute("/produtos/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    cat: typeof search["cat"] === "string" ? search["cat"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Produtos e serviços — MARIMAX" },
      {
        name: "description",
        content: "Todo o catálogo MARIMAX: categorias, filtros, preços e benefícios de cada item.",
      },
      { property: "og:title", content: "Produtos e serviços — MARIMAX" },
      { property: "og:description", content: "Todo o catálogo MARIMAX com filtros e preços." },
    ],
  }),
  component: Produtos,
});

function Produtos() {
  const { q, cat } = Route.useSearch();
  const { products } = useStore();
  const [term, setTerm] = useState(q ?? "");
  const [category, setCategory] = useState(cat ?? "");
  const [order, setOrder] = useState<"recentes" | "menor" | "maior">("recentes");

  const categories = useMemo(
    () => Array.from(new Set(products.filter((p) => p.active).map((p) => p.category))).sort(),
    [products],
  );

  const list = useMemo(() => {
    const t = term.trim().toLowerCase();
    let out = products.filter(
      (p) =>
        p.active &&
        (!category || p.category === category) &&
        (!t || p.name.toLowerCase().includes(t) || p.shortDesc.toLowerCase().includes(t)),
    );
    if (order === "menor") out = [...out].sort((a, b) => a.price - b.price);
    if (order === "maior") out = [...out].sort((a, b) => b.price - a.price);
    if (order === "recentes") out = [...out].sort((a, b) => b.createdAt - a.createdAt);
    return out;
  }, [products, term, category, order]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Catálogo"
        title="Produtos e serviços"
        description="Pesquise, filtre por categoria e escolha entre comprar direto ou solicitar um orçamento."
      />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Pesquisar no catálogo"
            className="md:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={category === "" ? "default" : "outline"}
              onClick={() => setCategory("")}
            >
              Todos
            </Button>
            {categories.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "default" : "outline"}
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
          <div className="md:ml-auto">
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as typeof order)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Ordenar"
            >
              <option value="recentes">Mais recentes</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="surface-lux mt-10 rounded-lg p-12 text-center text-sm text-muted-foreground">
            Nenhum produto encontrado. Os itens aparecem aqui assim que forem cadastrados no painel
            administrativo.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
