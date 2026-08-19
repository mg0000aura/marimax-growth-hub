import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/suporte")({
  head: () => ({
    meta: [
      { title: "Atendimento e suporte — MARIMAX" },
      {
        name: "description",
        content: "Fale com a MARIMAX por WhatsApp, e-mail ou formulário. FAQ e assistente Amanda.",
      },
      { property: "og:title", content: "Atendimento e suporte — MARIMAX" },
      { property: "og:description", content: "Canais de atendimento, FAQ e assistente da MARIMAX." },
    ],
  }),
  component: Suporte;
});

const FAQ = [
  { q: "Quais formas de pagamento?", a: "PIX e cartão de crédito. O PIX confirma mais rápido." },
  { q: "Preciso ter conta para comprar?", a: "Sim. O login é obrigatório e fica salvo no dispositivo." },
  { q: "Como acompanho meu pedido?", a: "Na Área do cliente, aba Pedidos, com status atualizado." },
  { q: "Posso pedir orçamento?", a: "Sim. Em cada produto há o botão Solicitar orçamento." },
  { q: "Como uso um cupom?", a: "No checkout, digite o código no campo Cupom e clique em Aplicar." },
];

function answer(text: string) {
  const t = text.toLowerCase();
  if (t.includes("pix") || t.includes("pagamento") || t.includes("cartão"))
    return "Aceitamos PIX e cartão. No checkout você escolhe a forma antes de confirmar.";
  if (t.includes("cupom") || t.includes("desconto"))
    return "Digite o cupom no checkout, campo Cupom, e clique em Aplicar.";
  if (t.includes("pedido") || t.includes("entrega") || t.includes("status"))
    return "Você acompanha tudo em Conta › Pedidos, com o status atualizado pela equipe.";
  if (t.includes("senha") || t.includes("login") || t.includes("conta"))
    return "Sua sessão fica salva no dispositivo. Se esqueceu a senha, use 'Esqueci minha senha' na tela de login.";
  if (t.includes("orçamento"))
    return "Na página do produto há o botão Solicitar orçamento, que abre nosso WhatsApp.";
  return "Sou a Amanda, assistente da MARIMAX. Posso ajudar com pagamento, pedidos, cupons, conta e orçamentos. Se preferir falar com uma pessoa, use o WhatsApp aqui ao lado.";
}

function Suporte() {
  const { settings } = useStore();
  const [chat, setChat] = useState<{ me: boolean; text: string }[]>([
    { me: false, text: "Oi! Eu sou a Amanda. Como posso ajudar você hoje?" },
  ]);
  const [msg, setMsg] = useState("");

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = msg.trim().slice(0, 500);
    if (!text) return;
    setChat((c) => [...c, { me: true, text }, { me: false, text: answer(text) }]);
    setMsg("");
  }

  function contact(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Mensagem registrada. Retornamos pelo e-mail informado.");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Atendimento"
        title="Central de suporte"
        description="Escolha o canal que preferir. Respondemos em horário comercial."
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2">
        <div className="space-y-6">
          <div className="surface-lux rounded-lg p-6">
            <h2 className="text-lg font-light">Canais diretos</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  if (!settings.whatsapp) {
                    toast.info("O WhatsApp ainda não foi configurado no painel administrativo.");
                    return;
                  }
                  window.open(
                    `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`,
                    "_blank",
                    "noopener",
                  );
                }}
              >
                <MessageCircle className="mr-1 size-4" /> WhatsApp
              </Button>
              <Button variant="outline" asChild>
                <a href={`mailto:${settings.email}`}>
                  <Mail className="mr-1 size-4" /> {settings.email}
                </a>
              </Button>
            </div>
          </div>

          <form onSubmit={contact} className="surface-lux space-y-4 rounded-lg p-6">
            <h2 className="text-lg font-light">Formulário</h2>
            <div>
              <Label htmlFor="n">Nome</Label>
              <Input id="n" required maxLength={80} />
            </div>
            <div>
              <Label htmlFor="e">E-mail</Label>
              <Input id="e" type="email" required maxLength={120} />
            </div>
            <div>
              <Label htmlFor="m">Mensagem</Label>
              <Textarea id="m" required maxLength={1000} />
            </div>
            <Button type="submit">Enviar mensagem</Button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="surface-lux rounded-lg p-6">
            <h2 className="text-lg font-light">Chat com a Amanda</h2>
            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
              {chat.map((c, i) => (
                <p
                  key={i}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    c.me ? "ml-auto bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  {c.text}
                </p>
              ))}
            </div>
            <form onSubmit={send} className="mt-4 flex gap-2">
              <Input
                value={msg}
                maxLength={500}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Escreva sua dúvida"
              />
              <Button type="submit" size="icon">
                <Send className="size-4" />
              </Button>
            </form>
          </div>

          <div className="surface-lux rounded-lg p-6">
            <h2 className="text-lg font-light">Perguntas frequentes</h2>
            <Accordion type="single" collapsible className="mt-2">
              {FAQ.map((f, i) => (
                <AccordionItem key={i} value={`q${i}`}>
                  <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
