import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { brl } from "@/lib/types";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Área do cliente — MARIMAX" },
      {
        name: "description",
        content: "Acesse sua conta MARIMAX: pedidos, favoritos, cupons e dados pessoais.",
      },
      { property: "og:title", content: "Área do cliente — MARIMAX" },
      { property: "og:description", content: "Pedidos, favoritos e dados pessoais da sua conta." },
    ],
  }),
  component: Conta,
});

function Conta() {
  const { user, loading, signIn, signUp, resetPassword, logout, updateName, usingFirebase } = useAuth();
  const { orders, favorites, products, coupons } = useStore();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || password.length < 6) {
      toast.error("Informe um e-mail válido e senha com pelo menos 6 caracteres.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        if (name.trim().length < 2) throw new Error("Informe seu nome.");
        await signUp(name.trim().slice(0, 60), email.trim(), password);
        toast.success("Conta criada. Bem-vindo!");
      } else {
        await signIn(email.trim(), password);
        toast.success("Login realizado.");
      }
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível continuar.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <SiteLayout>
        <div className="py-24 text-center text-sm text-muted-foreground">Carregando…</div>
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <PageHeader
          eyebrow="Área do cliente"
          title={mode === "login" ? "Entrar" : "Criar conta"}
          description="Sua sessão fica salva neste dispositivo — você não precisa logar toda vez."
        />
        <section className="mx-auto max-w-md px-4 py-12">
          <form onSubmit={submit} className="surface-lux space-y-4 rounded-lg p-6">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} maxLength={120} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pass">Senha</Label>
              <Input id="pass" type="password" value={password} maxLength={72} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
            <div className="flex justify-between text-xs text-muted-foreground">
              <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                {mode === "login" ? "Criar uma conta" : "Já tenho conta"}
              </button>
              {usingFirebase && (
                <button
                  type="button"
                  onClick={() => {
                    if (!email.includes("@")) {
                      toast.error("Informe seu e-mail primeiro.");
                      return;
                    }
                    void resetPassword(email.trim())
                      .then(() => toast.success("Enviamos o link de recuperação."))
                      .catch((err: unknown) =>
                        toast.error(err instanceof Error ? err.message : "Falhou."),
                      );
                  }}
                >
                  Esqueci minha senha
                </button>
              )}
            </div>
          </form>
        </section>
      </SiteLayout>
    );
  }

  const myOrders = orders.filter((o) => o.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);
  const favProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <SiteLayout>
      <PageHeader eyebrow="Área do cliente" title={`Olá, ${user.name}`} />
      <section className="mx-auto max-w-5xl px-4 py-12">
        <Tabs defaultValue="pedidos">
          <TabsList className="flex-wrap">
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
            <TabsTrigger value="cupons">Cupons</TabsTrigger>
            <TabsTrigger value="dados">Dados pessoais</TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos" className="mt-6 space-y-3">
            {myOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">Você ainda não fez pedidos.</p>
            )}
            {myOrders.map((o) => (
              <div key={o.id} className="surface-lux rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] uppercase tracking-wider">
                    {o.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString("pt-BR")} ·{" "}
                  {o.payment === "pix" ? "PIX" : "Cartão"}
                </p>
                <ul className="mt-2 text-sm text-muted-foreground">
                  {o.items.map((i) => (
                    <li key={i.productId}>
                      {i.qty}× {i.name}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-primary">{brl(o.total)}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="favoritos" className="mt-6">
            {favProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum favorito ainda.{" "}
                <Link to="/produtos" className="text-primary">
                  Ver catálogo
                </Link>
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {favProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cupons" className="mt-6 space-y-2">
            {coupons.filter((c) => c.active).length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum cupom disponível no momento.</p>
            )}
            {coupons
              .filter((c) => c.active)
              .map((c) => (
                <div key={c.code} className="surface-lux flex justify-between rounded-lg p-4 text-sm">
                  <span className="tracking-widest">{c.code}</span>
                  <span className="text-primary">-{c.percent}%</span>
                </div>
              ))}
          </TabsContent>

          <TabsContent value="dados" className="mt-6">
            <div className="surface-lux max-w-md space-y-4 rounded-lg p-6">
              <div>
                <Label>E-mail</Label>
                <Input value={user.email} readOnly />
              </div>
              <div>
                <Label htmlFor="nn">Nome</Label>
                <Input
                  id="nn"
                  maxLength={60}
                  value={newName || user.name}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <Button
                onClick={() => {
                  void updateName((newName || user.name).trim().slice(0, 60))
                    .then(() => toast.success("Dados atualizados."))
                    .catch(() => toast.error("Não foi possível atualizar."));
                }}
              >
                Salvar
              </Button>
              <div className="border-t border-border pt-4">
                <Button variant="outline" onClick={() => void logout()}>
                  Sair da conta
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Sair encerra a sessão salva neste dispositivo.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}
