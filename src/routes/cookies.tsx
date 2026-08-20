import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Política de cookies — MARIMAX" },
      { name: "description", content: "Quais cookies e armazenamentos locais o site da MARIMAX utiliza." },
      { property: "og:title", content: "Política de cookies — MARIMAX" },
      { property: "og:description", content: "Uso de cookies e armazenamento local no site MARIMAX." },
    ],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Política de cookies"
      sections={[
        {
          h: "O que usamos",
          p: "Utilizamos armazenamento local do navegador para manter sua sessão de login, o carrinho e os favoritos entre as visitas.",
        },
        {
          h: "Cookies essenciais",
          p: "São necessários para o funcionamento do site: autenticação, carrinho e preferências básicas.",
        },
        {
          h: "Métricas",
          p: "Contamos visitas e visualizações de forma agregada, para entender quais produtos despertam mais interesse.",
        },
        {
          h: "Como controlar",
          p: "Você pode limpar os dados do site pelas configurações do navegador. Isso encerra a sessão e apaga o carrinho salvo.",
        },
      ]}
    />
  ),
});
