import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/empresa")({
  head: () => ({
    meta: [
      { title: "A empresa — MARIMAX" },
      {
        name: "description",
        content: "Conheça a MARIMAX: o que fazemos, nossos diferenciais e como trabalhamos.",
      },
      { property: "og:title", content: "A empresa — MARIMAX" },
      {
        property: "og:description",
        content: "Conheça a MARIMAX: o que fazemos, nossos diferenciais e como trabalhamos.",
      },
    ],
  }),
  component: Empresa,
});

function Empresa() {
  const { settings, products, orders } = useStore();

  return (
    <SiteLayout>
      <PageHeader eyebrow="Sobre nós" title="A empresa" description={settings.impact} />
      <section className="mx-auto max-w-4xl px-4 py-14">
        <p className="text-base leading-relaxed text-muted-foreground">{settings.about}</p>

        <h2 className="mt-12 text-2xl font-light">Diferenciais</h2>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {settings.differentials.map((d) => (
            <li key={d} className="surface-lux flex items-start gap-3 rounded-lg p-4 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {d}
            </li>
          ))}
        </ul>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Produtos", value: products.filter((p) => p.active).length },
            { label: "Pedidos", value: orders.length },
            { label: "Projetos entregues", value: orders.filter((o) => o.status === "entregue").length },
            { label: "Categorias", value: new Set(products.map((p) => p.category)).size },
          ].map((n) => (
            <div key={n.label} className="surface-lux rounded-lg p-5 text-center">
              <p className="text-3xl font-light text-primary">{n.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {n.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/produtos">Ver produtos e serviços</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/suporte">Falar com a equipe</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
