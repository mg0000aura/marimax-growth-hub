import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { brl } from "@/lib/types";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho — MARIMAX" },
      { name: "description", content: "Revise os itens escolhidos antes de finalizar a compra." },
      { property: "og:title", content: "Carrinho — MARIMAX" },
      { property: "og:description", content: "Revise seus itens e finalize a compra na MARIMAX." },
    ],
  }),
  component: Carrinho,
});

function Carrinho() {
  const { cart, setCartQty, removeFromCart } = useStore();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <SiteLayout>
      <PageHeader eyebrow="Compra" title="Seu carrinho" />
      <section className="mx-auto max-w-5xl px-4 py-12">
        {cart.length === 0 ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
            <Button asChild className="mt-6">
              <Link to="/produtos">Ver produtos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              {cart.map((i) => (
                <div key={i.productId} className="surface-lux flex gap-4 rounded-lg p-4">
                  <div className="size-20 shrink-0 overflow-hidden rounded bg-secondary">
                    {i.image && <img src={i.image} alt="" className="size-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{i.name}</p>
                    <p className="mt-1 text-primary">{brl(i.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button size="icon" variant="outline" className="size-7" onClick={() => setCartQty(i.productId, i.qty - 1)}>
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{i.qty}</span>
                      <Button size="icon" variant="outline" className="size-7" onClick={() => setCartQty(i.productId, i.qty + 1)}>
                        <Plus className="size-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="ml-auto size-7" onClick={() => removeFromCart(i.productId)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="surface-lux h-fit rounded-lg p-5">
              <h2 className="text-lg font-light">Resumo</h2>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{brl(subtotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Itens</span>
                <span>{cart.reduce((s, i) => s + i.qty, 0)}</span>
              </div>
              <Button asChild className="mt-6 w-full" size="lg">
                <Link to="/checkout">Finalizar compra</Link>
              </Button>
              <Button asChild variant="ghost" className="mt-2 w-full">
                <Link to="/produtos">Continuar comprando</Link>
              </Button>
            </aside>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
