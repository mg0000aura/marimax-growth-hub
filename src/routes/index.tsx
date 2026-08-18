import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Logo } from "@/components/site/Logo";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MARIMAX — Produtos e serviços com padrão premium" },
      {
        name: "description",
        content:
          "Conheça a MARIMAX: catálogo premium, compra por PIX ou cartão, avaliações reais e suporte direto pelo WhatsApp.",
      },
      { property: "og:title", content: "MARIMAX — Produtos e serviços com padrão premium" },
      {
        property: "og:description",
        content: "Catálogo premium, compra segura e suporte direto. Conheça a MARIMAX.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { products, orders, settings, banners } = useStore();
  const actives = products.filter((p) => p.active);
  const categories = Array.from(new Set(actives.map((p) => p.category)));
  const featured = actives.slice(0, 4);

  return (
    <SiteLayout>
      {/* Primeira tela */}
      <section className="relative overflow-hidden border-b border-border/60">
        {settings.heroVideo ? (
          <video
            className="absolute inset-0 size-full object-cover opacity-30"
            src={settings.heroVideo}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div className="absolute inset-0 opacity-70">
            <div className="veil absolute inset-0" />
            <div className="absolute left-1/2 top-24 size-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl animate-lux-float" />
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
                backgroundSize: "72px 72px",
              }}
            />
          </div>
        )}

        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-24 text-center md:py-32">
          <Logo className="h-24 animate-lux-float md:h-32" />
          <h1 className="mt-6 text-5xl font-light tracking-[0.3em] md:text-6xl">MARIMAX</h1>
          <p className="mt-3 text-sm uppercase tracking-[0.34em] text-primary">{settings.slogan}</p>
          <p className="animate-lux-shine text-gold-gradient mt-8 max-w-2xl text-2xl font-light md:text-3xl">
            {settings.impact}
          </p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {settings.description}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/empresa">Conheça a empresa</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/produtos">
                Nossos produtos/serviços <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Banners administráveis */}
      {banners.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {banners.map((b) => (
              <a
                key={b.id}
                href={b.link || "#"}
                className="surface-lux relative aspect-[3/4] w-48 shrink-0 overflow-hidden rounded-lg"
              >
                <img src={b.image} alt={b.title} className="size-full object-cover" loading="lazy" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* O que a empresa faz */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="eyebrow">A MARIMAX</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-light">O que fazemos</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{settings.about}</p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Padrão premium", text: settings.differentials[0] ?? "" },
            { icon: ShieldCheck, title: "Compra segura", text: settings.differentials[2] ?? "" },
            { icon: Truck, title: "Entrega e suporte", text: settings.differentials[3] ?? "" },
          ].map((d) => (
            <div key={d.title} className="surface-lux rounded-lg p-6">
              <d.icon className="size-5 text-primary" />
              <h3 className="mt-4 text-lg font-normal">{d.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Button asChild variant="outline">
            <Link to="/empresa">Saiba mais</Link>
          </Button>
        </div>
      </section>

      {/* Principais produtos */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Catálogo</p>
            <h2 className="mt-2 text-3xl font-light">Principais produtos e serviços</h2>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/produtos">Ver todos</Link>
          </Button>
        </div>

        {featured.length === 0 ? (
          <div className="surface-lux mt-8 rounded-lg p-10 text-center text-sm text-muted-foreground">
            O catálogo será exibido aqui assim que os produtos forem cadastrados no painel
            administrativo.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Números reais da empresa */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-14 md:grid-cols-4">
          {[
            { label: "Projetos entregues", value: orders.filter((o) => o.status === "entregue").length },
            { label: "Produtos no catálogo", value: actives.length },
            { label: "Categorias", value: categories.length },
            { label: "Pedidos realizados", value: orders.length },
          ].map((n) => (
            <div key={n.label} className="text-center">
              <p className="text-4xl font-light text-primary">{n.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{n.label}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
