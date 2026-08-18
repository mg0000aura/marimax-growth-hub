import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User, Headphones } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

const nav = [
  { to: "/", label: "Home" },
  { to: "/empresa", label: "Empresa" },
  { to: "/produtos", label: "Produtos" },
  { to: "/avaliacoes", label: "Avaliações" },
  { to: "/blog", label: "Novidades" },
  { to: "/suporte", label: "Atendimento" },
] as const;

export function Header() {
  const { cart } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  function search(e: React.FormEvent) {
    e.preventDefault();
    void navigate({ to: "/produtos", search: { q: term || undefined } });
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <nav className="mt-8 flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm tracking-wide text-foreground/80 hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/conta"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm tracking-wide text-foreground/80 hover:bg-accent"
              >
                Minha conta
              </Link>
            </nav>
            <form onSubmit={search} className="mt-6">
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Pesquisar produtos"
              />
            </form>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-9" />
        </Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-xs uppercase tracking-[0.18em] text-foreground/70 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <form onSubmit={search} className="hidden lg:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Pesquisar"
                className="h-9 w-44 pl-8"
              />
            </div>
          </form>
          <Button variant="ghost" size="icon" asChild aria-label="Atendimento">
            <Link to="/suporte">
              <Headphones className="size-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Carrinho" className="relative">
            <Link to="/carrinho">
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="ml-1">
            <Link to="/conta">
              <User className="mr-1 size-4" />
              {user ? user.name.split(" ")[0] : "Entrar"}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
