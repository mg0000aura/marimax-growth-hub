import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — MARIMAX" },
      { name: "description", content: "Como a MARIMAX coleta, usa e protege os dados dos clientes." },
      { property: "og:title", content: "Política de privacidade — MARIMAX" },
      { property: "og:description", content: "Como tratamos e protegemos seus dados na MARIMAX." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Política de privacidade"
      sections={[
        {
          h: "Dados coletados",
          p: "Coletamos nome, e-mail e informações dos pedidos. Dados de pagamento são processados pelos meios de pagamento, não ficam armazenados no site.",
        },
        {
          h: "Uso dos dados",
          p: "Usamos os dados para identificar sua conta, processar pedidos, prestar suporte e melhorar a experiência de compra.",
        },
        {
          h: "Compartilhamento",
          p: "Não vendemos seus dados. Compartilhamos apenas o necessário com serviços de pagamento, entrega e infraestrutura.",
        },
        {
          h: "Seus direitos",
          p: "Você pode solicitar acesso, correção ou exclusão dos seus dados pela Central de suporte.",
        },
        {
          h: "Segurança",
          p: "Utilizamos autenticação segura, controle de acesso por nível de permissão e registro de atividades administrativas.",
        },
      ]}
    />
  ),
});
