import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — MARIMAX" },
      { name: "description", content: "Condições de uso do site e dos serviços da MARIMAX." },
      { property: "og:title", content: "Termos de uso — MARIMAX" },
      { property: "og:description", content: "Condições de uso do site e serviços MARIMAX." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Termos de uso"
      sections={[
        {
          h: "Aceitação",
          p: "Ao navegar ou comprar no site da MARIMAX você concorda com estes termos. Se não concordar, não utilize o site.",
        },
        {
          h: "Conta do cliente",
          p: "O cadastro é obrigatório para comprar. Você é responsável por manter a senha em segurança e pelas ações feitas na sua conta.",
        },
        {
          h: "Produtos e preços",
          p: "Descrições, imagens e preços podem ser atualizados a qualquer momento. Erros evidentes de digitação não obrigam a empresa à venda.",
        },
        {
          h: "Uso indevido",
          p: "É proibido tentar burlar o sistema, copiar conteúdo sem autorização ou utilizar o site para fins ilícitos.",
        },
        {
          h: "Contato",
          p: "Dúvidas sobre estes termos podem ser enviadas pela Central de suporte.",
        },
      ]}
    />
  ),
});
