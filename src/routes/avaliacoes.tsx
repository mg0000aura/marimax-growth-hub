import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/Layout";
import { Stars } from "@/components/site/ProductCard";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Avaliações de clientes — MARIMAX" },
      {
        name: "description",
        content: "Notas, comentários e experiências reais de quem já comprou na MARIMAX.",
      },
      { property: "og:title", content: "Avaliações de clientes — MARIMAX" },
      { property: "og:description", content: "Notas e comentários reais de clientes MARIMAX." },
    ],
  }),
  component: Avaliacoes,
});

function Avaliacoes() {
  const { reviews } = useStore();
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Reputação"
        title="Avaliações"
        description="Cada avaliação é enviada por um cliente com conta na MARIMAX."
      />
      <section className="mx-auto max-w-4xl px-4 py-12">
        {reviews.length > 0 && (
          <div className="surface-lux mb-8 flex items-center gap-4 rounded-lg p-6">
            <p className="text-4xl font-light text-primary">{avg.toFixed(1)}</p>
            <div>
              <Stars value={avg} />
              <p className="mt-1 text-xs text-muted-foreground">{reviews.length} avaliações</p>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Ainda não há avaliações publicadas. Elas aparecem aqui assim que os clientes avaliarem
            um produto.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {[...reviews]
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((r) => (
                <article key={r.id} className="surface-lux rounded-lg p-5">
                  <div className="flex items-center gap-3">
                    {r.photo ? (
                      <img src={r.photo} alt="" className="size-9 rounded-full object-cover" />
                    ) : (
                      <span className="grid size-9 place-items-center rounded-full bg-accent text-xs">
                        {r.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <p className="text-sm">{r.name}</p>
                      <Stars value={r.rating} />
                    </div>
                    {r.verified && (
                      <span className="ml-auto rounded-full bg-success/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-success">
                        Cliente verificado
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{r.comment}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {r.productName}
                  </p>
                </article>
              ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
