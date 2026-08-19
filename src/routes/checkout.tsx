import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore, uid } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { brl, type Order } from "@/lib/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — MARIMAX" },
      { name: "description", content: "Pagamento por PIX ou cartão com resumo completo do pedido." },
      { property: "og:title", content: "Checkout — MARIMAX" },
      { property: "og:description", content: "Finalize seu pedido com PIX ou cartão na MARIMAX." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const navigate = useNavigate();
  const { cart, coupons, clearCart, saveOrder, log } = useStore();
  const { user } = useAuth();
  const [payment, setPayment] = useState<"pix" | "cartao">("pix");
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; percent: number } | null>(null);
  const [done, setDone] = useState<Order | null>(null);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = applied ? (subtotal * applied.percent) / 100 : 0;
  const total = Math.max(subtotal - discount, 0);

  if (done) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="eyebrow">Pedido confirmado</p>
          <h1 className="mt-3 text-3xl font-light">Obrigado, {done.userName}!</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Pedido <strong>#{done.id.slice(0, 8).toUpperCase()}</strong> registrado por{" "}
            {done.payment === "pix" ? "PIX" : "cartão"} no valor de {brl(done.total)}. Você acompanha
            o status na sua conta.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild>
              <Link to="/conta">Meus pedidos</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/produtos">Continuar comprando</Link>
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl font-light">Entre para finalizar</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            O login é obrigatório antes da compra. Sua sessão fica salva no dispositivo.
          </p>
          <Button asChild className="mt-6">
            <Link to="/conta">Entrar ou criar conta</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  if (cart.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl font-light">Carrinho vazio</h1>
          <Button asChild className="mt-6">
            <Link to="/produtos">Ver produtos</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  function applyCoupon() {
    const found = coupons.find(
      (c) => c.active && c.code.toLowerCase() === code.trim().toLowerCase(),
    );
    if (!found) {
      toast.error("Cupom inválido ou expirado.");
      return;
    }
    setApplied({ code: found.code, percent: found.percent });
    toast.success(`Cupom ${found.code} aplicado (-${found.percent}%)`);
  }

  function confirm() {
    if (!user) return;
    const order: Order = {
      id: uid(),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      items: cart,
      subtotal,
      discount,
      total,
      payment,
      ...(applied ? { coupon: applied.code } : {}),
      status: "pendente",
      createdAt: Date.now(),
    };
    saveOrder(order);
    log(user.email, `Pedido ${order.id} criado`);
    clearCart();
    setDone(order);
    void navigate;
  }

  return (
    <SiteLayout>
      <PageHeader eyebrow="Pagamento" title="Checkout" />
      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="surface-lux rounded-lg p-5">
            <h2 className="text-lg font-light">Seus dados</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {user.name} · {user.email}
            </p>
          </div>

          <div className="surface-lux rounded-lg p-5">
            <h2 className="text-lg font-light">Forma de pagamento</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["pix", "cartao"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPayment(p)}
                  className={`rounded-md border p-4 text-left text-sm transition-colors ${
                    payment === p ? "border-primary bg-accent" : "border-border"
                  }`}
                >
                  <span className="block font-medium">{p === "pix" ? "PIX" : "Cartão"}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {p === "pix"
                      ? "Confirmação rápida, sem taxas"
                      : "Parcelamento conforme o emissor"}
                  </span>
                </button>
              ))}
            </div>
            {payment === "cartao" && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="cardname">Nome no cartão</Label>
                  <Input id="cardname" maxLength={80} placeholder="Como está impresso" />
                </div>
                <div>
                  <Label htmlFor="cardnum">Número do cartão</Label>
                  <Input id="cardnum" inputMode="numeric" maxLength={19} placeholder="0000 0000 0000 0000" />
                </div>
              </div>
            )}
          </div>

          <div className="surface-lux rounded-lg p-5">
            <h2 className="text-lg font-light">Cupom de desconto</h2>
            <div className="mt-3 flex gap-2">
              <Input
                value={code}
                maxLength={24}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Digite o cupom"
              />
              <Button variant="outline" onClick={applyCoupon}>
                Aplicar
              </Button>
            </div>
          </div>
        </div>

        <aside className="surface-lux h-fit rounded-lg p-5">
          <h2 className="text-lg font-light">Resumo da compra</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {cart.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {i.qty}× {i.name}
                </span>
                <span>{brl(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{brl(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Desconto ({applied?.code})</span>
                <span>-{brl(discount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 text-lg">
              <span>Total</span>
              <span className="text-primary">{brl(total)}</span>
            </div>
          </div>
          <Button size="lg" className="mt-6 w-full" onClick={confirm}>
            Confirmar pedido
          </Button>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Ao confirmar você concorda com a política de compra e os termos de uso.
          </p>
        </aside>
      </section>
    </SiteLayout>
  );
}
