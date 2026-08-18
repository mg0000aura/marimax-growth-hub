import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { brl, type Product, type Review } from "@/lib/types";

export function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-3.5 ${i <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground"}`}
        />
      ))}
    </span>
  );
}

export function ratingOf(reviews: Review[], productId: string) {
  const list = reviews.filter((r) => r.productId === productId);
  if (!list.length) return { avg: 0, count: 0 };
  return { avg: list.reduce((s, r) => s + r.rating, 0) / list.length, count: list.length };
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, favorites, toggleFavorite, reviews } = useStore();
  const { avg, count } = ratingOf(reviews, product.id);
  const fav = favorites.includes(product.id);

  return (
    <article className="surface-lux group flex flex-col overflow-hidden rounded-lg transition-transform hover:-translate-y-0.5">
      <Link to="/produtos/$id" params={{ id: product.id }} className="relative block aspect-square overflow-hidden bg-secondary">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="grid size-full place-items-center text-xs uppercase tracking-widest text-muted-foreground">
            MARIMAX
          </span>
        )}
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
            -{Math.round((1 - product.price / product.oldPrice) * 100)}%
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{product.category}</p>
        <Link to="/produtos/$id" params={{ id: product.id }} className="text-sm font-medium leading-snug hover:text-primary">
          {product.name}
        </Link>
        {count > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Stars value={avg} /> {avg.toFixed(1)} ({count})
          </span>
        )}
        <div className="mt-auto pt-2">
          {product.oldPrice && product.oldPrice > product.price && (
            <p className="text-xs text-muted-foreground line-through">{brl(product.oldPrice)}</p>
          )}
          <p className="text-lg text-primary">{brl(product.price)}</p>
          <p className="text-[11px] text-muted-foreground">À vista no PIX</p>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            className="flex-1"
            onClick={() => {
              addToCart({
                productId: product.id,
                name: product.name,
                price: product.price,
                qty: 1,
                image: product.images[0] ?? "",
              });
              toast.success("Adicionado ao carrinho");
            }}
          >
            <ShoppingBag className="mr-1 size-4" /> Comprar
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Favoritar"
            onClick={() => toggleFavorite(product.id)}
          >
            <Heart className={`size-4 ${fav ? "fill-primary text-primary" : ""}`} />
          </Button>
        </div>
      </div>
    </article>
  );
}
