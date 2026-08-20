import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/politica-de-compra")({
  head: () => ({
    meta: [
      { title: "Política de compra — MARIMAX" },
      { name: "description", content: "Pagamento, prazos, trocas e cancelamento nas compras da MARIMAX." },
      { property: "og:title", content: "Política de compra — MARIMAX" },
      { property: "og:description", content: "Regras de pagamento, prazos e cancelamento na MARIMAX." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Política de compra"
      sections={[
        {
          h: "Pagamento",
          p: "Aceitamos PIX e cartão. O pedido é confirmado após a aprovação do pagamento.",
        },
        {
          h: "Prazos",
          p: "Os prazos de produção e entrega são informados na página de cada produto ou combinados no orçamento.",
        },
        {
          h: "Cancelamento e arrependimento",
          p: "Compras online podem ser canceladas em até 7 dias corridos após o recebimento, conforme o Código de Defesa do Consumidor.",
        },
        {
          h: "Trocas e defeitos",
          p: "Em caso de defeito, entre em contato pela Central de suporte com fotos e o número do pedido para avaliação.",
        },
        {
          h: "Cupons",
          p: "Cupons são válidos enquanto estiverem ativos e não são cumulativos, salvo indicação em contrário.",
        },
      ]}
    />
  ),
});
