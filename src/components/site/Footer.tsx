import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <Logo className="h-10" />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            MARIMAX — produtos e serviços com padrão premium, entrega conferida e suporte de verdade.
          </p>
        </div>
        <div>
          <h3 className="eyebrow">Navegar</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/empresa" className="hover:text-primary">A empresa</Link></li>
            <li><Link to="/produtos" className="hover:text-primary">Produtos e serviços</Link></li>
            <li><Link to="/avaliacoes" className="hover:text-primary">Avaliações</Link></li>
            <li><Link to="/blog" className="hover:text-primary">Novidades</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow">Conta</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/conta" className="hover:text-primary">Entrar / Criar conta</Link></li>
            <li><Link to="/carrinho" className="hover:text-primary">Carrinho</Link></li>
            <li><Link to="/suporte" className="hover:text-primary">Central de suporte</Link></li>
            <li><Link to="/adm" className="hover:text-primary">Painel administrativo</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow">Legal</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/termos" className="hover:text-primary">Termos de uso</Link></li>
            <li><Link to="/privacidade" className="hover:text-primary">Política de privacidade</Link></li>
            <li><Link to="/cookies" className="hover:text-primary">Política de cookies</Link></li>
            <li><Link to="/politica-de-compra" className="hover:text-primary">Política de compra</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MARIMAX. Todos os direitos reservados.
      </div>
    </footer>
  );
}
