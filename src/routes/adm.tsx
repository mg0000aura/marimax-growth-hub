import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore, uid } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { brl, type Order, type Post, type Product } from "@/lib/types";

export const Route = createFileRoute("/adm")({
  head: () => ({
    meta: [
      { title: "Painel administrativo — MARIMAX" },
      { name: "description", content: "Área restrita de gestão da loja MARIMAX." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel administrativo — MARIMAX" },
      { property: "og:description", content: "Área restrita de gestão da loja MARIMAX." },
    ],
  }),
  component: Adm,
});

const ADM_KEY = "marimax:admUnlocked";

function Adm() {
  const { user, loading } = useAuth();
  const store = useStore();
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");

  // O desbloqueio fica salvo no navegador e só vale enquanto o código não mudar.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(ADM_KEY);
    setUnlocked(Boolean(saved) && saved === store.settings.adminCode);
  }, [store.settings.adminCode]);

  if (loading) {
    return (
      <AdmShell>
        <p className="py-24 text-center text-sm text-muted-foreground">Verificando acesso…</p>
      </AdmShell>
    );
  }

  if (!user) {
    return (
      <AdmShell>
        <div className="mx-auto max-w-md py-24 text-center">
          <h1 className="text-2xl font-medium">Acesso administrativo</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Entre com sua conta antes de acessar o painel.
          </p>
          <Button asChild className="mt-6">
            <Link to="/conta">Ir para o login</Link>
          </Button>
        </div>
      </AdmShell>
    );
  }

  if (!unlocked) {
    return (
      <AdmShell>
        <form
          className="mx-auto max-w-sm space-y-4 py-24"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim() !== store.settings.adminCode) {
              toast.error("Código inválido.");
              return;
            }
            window.localStorage.setItem(ADM_KEY, store.settings.adminCode);
            setUnlocked(true);
            store.log(user.email, "Login no painel administrativo");
          }}
        >
          <h1 className="text-2xl font-medium">Verificação em duas etapas</h1>
          <p className="text-sm text-muted-foreground">
            Informe o código administrativo para liberar o painel nesta sessão.
          </p>
          <div>
            <Label htmlFor="code">Código</Label>
            <Input id="code" type="password" maxLength={40} value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <Button type="submit" className="w-full">Entrar no painel</Button>
        </form>
      </AdmShell>
    );
  }

  return (
    <AdmShell>
      <div className="flex flex-wrap items-center justify-between gap-3 py-6">
        <div>
          <h1 className="text-2xl font-medium">Painel MARIMAX</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/">Ver site</Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              window.localStorage.removeItem(ADM_KEY);
              setUnlocked(false);
              store.log(user.email, "Bloqueou o painel administrativo");
            }}
          >
            Bloquear painel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stats" className="pb-20">
        <TabsList className="flex-wrap">
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="cupons">Cupons</TabsTrigger>
          <TabsTrigger value="blog">Notícias</TabsTrigger>
          <TabsTrigger value="textos">Textos</TabsTrigger>
          <TabsTrigger value="atividade">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-6"><Stats /></TabsContent>
        <TabsContent value="produtos" className="mt-6"><Produtos /></TabsContent>
        <TabsContent value="pedidos" className="mt-6"><Pedidos /></TabsContent>
        <TabsContent value="clientes" className="mt-6"><Clientes /></TabsContent>
        <TabsContent value="cupons" className="mt-6"><Cupons /></TabsContent>
        <TabsContent value="blog" className="mt-6"><Noticias /></TabsContent>
        <TabsContent value="textos" className="mt-6"><Textos /></TabsContent>
        <TabsContent value="atividade" className="mt-6"><Atividade /></TabsContent>
      </Tabs>
    </AdmShell>
  );
}

function AdmShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-theme min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4">{children}</div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-medium">{value}</p>
    </div>
  );
}

function Stats() {
  const { orders, products, profiles, settings } = useStore();
  const paid = orders.filter((o) => o.status !== "cancelado");
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const buyers = new Set(paid.map((o) => o.userId));
  const recurring = [...buyers].filter(
    (id) => paid.filter((o) => o.userId === id).length > 1,
  ).length;
  const conversion = settings.visits ? (paid.length / settings.visits) * 100 : 0;
  const mostViewed = [...products].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5);
  const sold = new Map<string, number>();
  paid.forEach((o) => o.items.forEach((i) => sold.set(i.name, (sold.get(i.name) ?? 0) + i.qty)));
  const mostSold = [...sold.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Visitantes" value={settings.visits} />
        <Card title="Visualizações" value={settings.views} />
        <Card title="Vendas" value={paid.length} />
        <Card title="Faturamento" value={brl(revenue)} />
        <Card title="Conversão" value={`${conversion.toFixed(1)}%`} />
        <Card title="Clientes novos" value={buyers.size - recurring} />
        <Card title="Clientes recorrentes" value={recurring} />
        <Card title="Cadastros" value={profiles.length} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium">Produtos mais vistos</h3>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {mostViewed.length === 0 && <li>Sem dados ainda.</li>}
            {mostViewed.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.name}</span>
                <span>{p.views ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium">Produtos mais vendidos</h3>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {mostSold.length === 0 && <li>Sem dados ainda.</li>}
            {mostSold.map(([name, qty]) => (
              <li key={name} className="flex justify-between">
                <span>{name}</span>
                <span>{qty}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const emptyProduct = (): Product => ({
  id: uid(),
  name: "",
  category: "Geral",
  price: 0,
  images: [],
  shortDesc: "",
  description: "",
  included: [],
  benefits: [],
  forWho: "",
  howItWorks: "",
  faq: [],
  active: true,
  views: 0,
  createdAt: Date.now(),
});

function Produtos() {
  const { products, saveProduct, deleteProduct, log } = useStore();
  const { user } = useAuth();
  const [draft, setDraft] = useState<Product | null>(null);
  const lines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

  if (draft) {
    return (
      <form
        className="max-w-2xl space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.name.trim()) {
            toast.error("Informe o nome do produto.");
            return;
          }
          saveProduct({ ...draft, name: draft.name.trim().slice(0, 120) });
          log(user?.email ?? "adm", `Salvou o produto ${draft.name}`);
          toast.success("Produto salvo.");
          setDraft(null);
        }}
      >
        <h2 className="text-lg font-medium">Produto</h2>
        <Field label="Nome"><Input maxLength={120} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
        <Field label="Categoria"><Input maxLength={40} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Preço (R$)">
            <Input type="number" min={0} step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
          </Field>
          <Field label="Preço antigo (opcional)">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={draft.oldPrice ?? ""}
              onChange={(e) => {
                const { oldPrice: _drop, ...rest } = draft;
                setDraft(e.target.value ? { ...rest, oldPrice: Number(e.target.value) } : rest);
              }}
            />
          </Field>
        </div>
        <Field label="Imagens (uma URL por linha)">
          <Textarea value={draft.images.join("\n")} onChange={(e) => setDraft({ ...draft, images: lines(e.target.value) })} />
        </Field>
        <Field label="Descrição curta"><Input maxLength={160} value={draft.shortDesc} onChange={(e) => setDraft({ ...draft, shortDesc: e.target.value })} /></Field>
        <Field label="Descrição completa"><Textarea maxLength={4000} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
        <Field label="O que está incluído (um por linha)">
          <Textarea value={draft.included.join("\n")} onChange={(e) => setDraft({ ...draft, included: lines(e.target.value) })} />
        </Field>
        <Field label="Benefícios (um por linha)">
          <Textarea value={draft.benefits.join("\n")} onChange={(e) => setDraft({ ...draft, benefits: lines(e.target.value) })} />
        </Field>
        <Field label="Para quem é"><Textarea maxLength={600} value={draft.forWho} onChange={(e) => setDraft({ ...draft, forWho: e.target.value })} /></Field>
        <Field label="Como funciona"><Textarea maxLength={600} value={draft.howItWorks} onChange={(e) => setDraft({ ...draft, howItWorks: e.target.value })} /></Field>
        <Field label="FAQ (pergunta | resposta por linha)">
          <Textarea
            value={draft.faq.map((f) => `${f.q} | ${f.a}`).join("\n")}
            onChange={(e) =>
              setDraft({
                ...draft,
                faq: lines(e.target.value).map((l) => {
                  const [q, ...rest] = l.split("|");
                  return { q: (q ?? "").trim(), a: rest.join("|").trim() };
                }),
              })
            }
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
          Visível no site
        </label>
        <div className="flex gap-2">
          <Button type="submit">Salvar</Button>
          <Button type="button" variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <Button onClick={() => setDraft(emptyProduct())}>Adicionar produto</Button>
      <div className="mt-4 space-y-2">
        {products.length === 0 && <p className="text-sm text-muted-foreground">Nenhum produto cadastrado.</p>}
        {products.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
            <span className="flex-1 text-sm">{p.name}</span>
            <span className="text-sm text-muted-foreground">{brl(p.price)}</span>
            <span className="text-xs text-muted-foreground">{p.active ? "ativo" : "oculto"}</span>
            <Button size="sm" variant="outline" onClick={() => setDraft(p)}>Editar</Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                deleteProduct(p.id);
                log(user?.email ?? "adm", `Removeu o produto ${p.name}`);
              }}
            >
              Remover
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pedidos() {
  const { orders, saveOrder, log } = useStore();
  const { user } = useAuth();
  const status: Order["status"][] = ["pendente", "pago", "entregue", "cancelado"];
  return (
    <div className="space-y-2">
      {orders.length === 0 && <p className="text-sm text-muted-foreground">Nenhum pedido.</p>}
      {[...orders].sort((a, b) => b.createdAt - a.createdAt).map((o) => (
        <div key={o.id} className="rounded-lg border border-border p-4">
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <span>#{o.id.slice(0, 8).toUpperCase()} · {o.userName}</span>
            <span>{brl(o.total)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(o.createdAt).toLocaleString("pt-BR")} · {o.payment} · {o.userEmail}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {status.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={o.status === s ? "default" : "outline"}
                onClick={() => {
                  saveOrder({ ...o, status: s });
                  log(user?.email ?? "adm", `Pedido ${o.id} → ${s}`);
                }}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Clientes() {
  const { orders } = useStore();
  const clients = useMemo(() => {
    const map = new Map<string, { name: string; email: string; count: number; total: number }>();
    orders.forEach((o) => {
      const cur = map.get(o.userId) ?? { name: o.userName, email: o.userEmail, count: 0, total: 0 };
      map.set(o.userId, { ...cur, count: cur.count + 1, total: cur.total + o.total });
    });
    return [...map.values()];
  }, [orders]);

  return (
    <div className="space-y-2">
      {clients.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cliente com pedidos ainda.</p>}
      {clients.map((c) => (
        <div key={c.email} className="flex flex-wrap justify-between gap-2 rounded-lg border border-border p-3 text-sm">
          <span>{c.name} · {c.email}</span>
          <span className="text-muted-foreground">{c.count} pedidos · {brl(c.total)}</span>
        </div>
      ))}
    </div>
  );
}

function Cupons() {
  const { coupons, saveCoupon, deleteCoupon } = useStore();
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState(10);

  return (
    <div className="max-w-xl space-y-4">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const c = code.trim().toUpperCase().slice(0, 24);
          if (!c) return;
          saveCoupon({ code: c, percent: Math.min(Math.max(percent, 1), 90), active: true });
          setCode("");
          toast.success("Cupom criado.");
        }}
      >
        <Field label="Código"><Input value={code} maxLength={24} onChange={(e) => setCode(e.target.value)} /></Field>
        <Field label="Desconto %"><Input type="number" min={1} max={90} value={percent} onChange={(e) => setPercent(Number(e.target.value))} /></Field>
        <Button type="submit">Criar</Button>
      </form>
      <div className="space-y-2">
        {coupons.map((c) => (
          <div key={c.code} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
            <span>{c.code} · -{c.percent}%</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => saveCoupon({ ...c, active: !c.active })}>
                {c.active ? "Desativar" : "Ativar"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteCoupon(c.code)}>Remover</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Noticias() {
  const { posts, savePost, deletePost } = useStore();
  const [draft, setDraft] = useState<Post | null>(null);

  if (draft) {
    return (
      <form
        className="max-w-2xl space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const title = draft.title.trim().slice(0, 140);
          if (!title) return;
          savePost({
            ...draft,
            title,
            slug:
              draft.slug ||
              title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          });
          toast.success("Publicação salva.");
          setDraft(null);
        }}
      >
        <Field label="Título"><Input maxLength={140} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
        <Field label="Categoria"><Input maxLength={40} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></Field>
        <Field label="Capa (URL)"><Input value={draft.cover ?? ""} onChange={(e) => setDraft({ ...draft, cover: e.target.value })} /></Field>
        <Field label="Resumo"><Textarea maxLength={300} value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} /></Field>
        <Field label="Conteúdo"><Textarea maxLength={6000} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} /></Field>
        <div className="flex gap-2">
          <Button type="submit">Publicar</Button>
          <Button type="button" variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <Button
        onClick={() =>
          setDraft({
            id: uid(),
            title: "",
            slug: "",
            category: "Notícias",
            excerpt: "",
            content: "",
            createdAt: Date.now(),
          })
        }
      >
        Nova publicação
      </Button>
      <div className="mt-4 space-y-2">
        {posts.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
            <span>{p.title}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setDraft(p)}>Editar</Button>
              <Button size="sm" variant="ghost" onClick={() => deletePost(p.id)}>Remover</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Textos() {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState(settings);
  useEffect(() => setForm(settings), [settings]);

  return (
    <form
      className="max-w-2xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        updateSettings(form);
        toast.success("Textos atualizados.");
      }}
    >
      <Field label="Slogan"><Input maxLength={100} value={form.slogan} onChange={(e) => setForm({ ...form, slogan: e.target.value })} /></Field>
      <Field label="Frase de impacto"><Input maxLength={140} value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} /></Field>
      <Field label="Breve descrição"><Textarea maxLength={400} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      <Field label="Sobre a empresa"><Textarea maxLength={1200} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} /></Field>
      <Field label="Diferenciais (um por linha)">
        <Textarea
          value={form.differentials.join("\n")}
          onChange={(e) => setForm({ ...form, differentials: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
        />
      </Field>
      <Field label="Vídeo de fundo da home (URL mp4)"><Input value={form.heroVideo} onChange={(e) => setForm({ ...form, heroVideo: e.target.value })} /></Field>
      <Field label="WhatsApp (com DDI/DDD)"><Input maxLength={20} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></Field>
      <Field label="E-mail de contato"><Input maxLength={120} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
      <Field label="Código administrativo (2ª etapa)"><Input maxLength={40} value={form.adminCode} onChange={(e) => setForm({ ...form, adminCode: e.target.value })} /></Field>
      <Button type="submit">Salvar alterações</Button>
    </form>
  );
}

function Atividade() {
  const { activity } = useStore();
  return (
    <div className="space-y-2">
      {activity.length === 0 && <p className="text-sm text-muted-foreground">Sem registros ainda.</p>}
      {activity.map((a) => (
        <div key={a.id} className="rounded-lg border border-border p-3 text-sm">
          <span>{a.what}</span>
          <p className="text-xs text-muted-foreground">
            {a.who} · {new Date(a.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex-1">
      <Label className="mb-1 block text-xs">{label}</Label>
      {children}
    </div>
  );
}
