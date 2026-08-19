import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, MessageCircle, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Layout";
import { ProductCard, Stars, ratingOf } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useStore, uid } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { brl } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/produtos/$id")({
  component: ProdutoDetalhe,
});

function ProdutoDetalhe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { products, reviews, addToCart, registerProductView, saveReview, orders, settings } = useStore();
  const { user } = useAuth();
  const product = products.find((p) => p.id === id);
  const [img, setImg] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (product) registerProductView(product.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-2xl font-light">Produto não encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este item pode ter sido removido do catálogo.
          </p>
          <Button asChild className="mt-6">
            <Link to="/produtos">Ver catálogo</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const list = reviews.filter((r) => r.productId === product.id);
  const { avg, count } = ratingOf(reviews, product.id);
  const related = products.filter((p) => p.active && p.category === product.category && p.id !== product.id).slice(0, 4);
  const bought = orders.some(
    (o) => o.userId === user?.id && o.items.some((i) => i.productId === product.id),
  );

  function buy(now: boolean) {
    if (!product) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.images[0] ?? "",
    });
    if (now) void navigate({ to: "/carrinho" });
    else toast.success("Adicionado ao carrinho");
  }

  function quote() {
    if (!product) return;
    const text = `Olá! Quero um orçamento para: ${product.name}`;
    if (settings.whatsapp) {
      window.open(
        `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener",
      );
    } else {
      void navigate({ to: "/suporte" });
    }
  }

  function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Entre na sua conta para avaliar.");
      void navigate({ to: "/conta" });
      return;
    }
    if (comment.trim().length < 5) {
      toast.error("Escreva um comentário com pelo menos 5 caracteres.");
      return;
    }
    saveReview({
      id: uid(),
      productId: product!.id,
      productName: product!.name,
      rating,
      comment: comment.trim().slice(0, 800),
      name: user.name,
      verified: bought,
      createdAt: Date.now(),
    });
    setComment("");
    toast.success("Avaliação publicada. Obrigado!");
  }

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
        <div>
          <div className="surface-lux aspect-square overflow-hidden rounded-lg">
            {product.images[img] ? (
              <img src={product.images[img]} alt={product.name} className="size-full object-cover" />
            ) : (
              <span className="grid size-full place-items-center text-xs uppercase tracking-widest text-muted-foreground">
                MARIMAX
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setImg(i)}
                  className={`size-16 shrink-0 overflow-hidden rounded border ${i === img ? "border-primary" : "border-border"}`}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow">{product.category}</p>
          <h1 className="mt-2 text-3xl font-light">{product.name}</h1>
          {count > 0 && (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Stars value={avg} /> {avg.toFixed(1)} · {count} avaliações
            </p>
          )}
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.shortDesc}</p>

          <div className="mt-6">
            {product.oldPrice && product.oldPrice > product.price && (
              <p className="text-sm text-muted-foreground line-through">{brl(product.oldPrice)}</p>
            )}
            <p className="text-3xl text-primary">{brl(product.price)}</p>
            <p className="text-xs text-muted-foreground">À vista no PIX · ou no cartão</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => buy(true)}>
              <ShoppingBag className="mr-1 size-4" /> Comprar agora
            </Button>
            <Button size="lg" variant="outline" onClick={() => buy(false)}>
              Adicionar ao carrinho
            </Button>
            <Button size="lg" variant="ghost" onClick={quote}>
              <MessageCircle className="mr-1 size-4" /> Solicitar orçamento
            </Button>
          </div>

          {product.benefits.length > 0 && (
            <ul className="mt-8 space-y-2">
              {product.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-4 pb-14">
        <Block title="Descrição completa">{product.description}</Block>
        {product.included.length > 0 && (
          <div>
            <h2 className="text-2xl font-light">O que está incluído</h2>
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {product.included.map((i) => (
                <li key={i} className="surface-lux rounded-md p-3 text-sm">{i}</li>
              ))}
            </ul>
          </div>
        )}
        {product.forWho && <Block title="Para quem é">{product.forWho}</Block>}
        {product.howItWorks && <Block title="Como funciona">{product.howItWorks}</Block>}

        {product.faq.length > 0 && (
          <div>
            <h2 className="text-2xl font-light">Perguntas frequentes</h2>
            <Accordion type="single" collapsible className="mt-4">
              {product.faq.map((f, i) => (
                <AccordionItem key={i} value={`f${i}`}>
                  <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Avaliações */}
        <div>
          <h2 className="text-2xl font-light">Avaliações</h2>
          <div className="mt-4 space-y-3">
            {list.length === 0 && (
              <p className="text-sm text-muted-foreground">Este item ainda não tem avaliações.</p>
            )}
            {list.map((r) => (
              <article key={r.id} className="surface-lux rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} />
                  <span className="text-sm">{r.name}</span>
                  {r.verified && (
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-success">
                      Cliente verificado
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
              </article>
            ))}
          </div>

          <form onSubmit={submitReview} className="surface-lux mt-6 rounded-lg p-4">
            <p className="text-sm">Deixe sua avaliação</p>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-xl ${n <= rating ? "text-primary" : "text-muted-foreground"}`}
                  aria-label={`${n} estrelas`}
                >
                  ★
                </button>
              ))}
            </div>
            <Textarea
              className="mt-3"
              maxLength={800}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como foi sua experiência"
            />
            <Button type="submit" className="mt-3">Publicar avaliação</Button>
          </form>
        </div>

        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-light">Produtos relacionados</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-light">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
