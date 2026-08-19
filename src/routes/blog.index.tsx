import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { BLOG_CATEGORIES } from "@/lib/types";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Novidades e blog — MARIMAX" },
      {
        name: "description",
        content:
          "Notícias, novos produtos, projetos, bastidores, dicas e atualizações da MARIMAX.",
      },
      { property: "og:title", content: "Novidades e blog — MARIMAX" },
      { property: "og:description", content: "Conteúdos e novidades publicados pela MARIMAX." },
    ],
  }),
  component: Blog,
});

function Blog() {
  const { posts } = useStore();
  const [cat, setCat] = useState("Todas");
  const list = posts
    .filter((p) => cat === "Todas" || p.category === cat)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Novidades"
        title="Blog MARIMAX"
        description="Acompanhe lançamentos, projetos e bastidores da empresa."
      />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap gap-2">
          {["Todas", ...BLOG_CATEGORIES].map((c) => (
            <Button
              key={c}
              size="sm"
              variant={c === cat ? "default" : "outline"}
              onClick={() => setCat(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Nenhuma publicação nesta categoria ainda.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <Link
                key={p.id}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="surface-lux overflow-hidden rounded-lg transition-transform hover:-translate-y-0.5"
              >
                {p.cover && (
                  <img src={p.cover} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                )}
                <div className="p-5">
                  <p className="eyebrow">{p.category}</p>
                  <h2 className="mt-2 text-lg font-light">{p.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
