import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/blog/$slug")({
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const { posts } = useStore();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-2xl font-light">Publicação não encontrada</h1>
          <Button asChild className="mt-6">
            <Link to="/blog">Ver todas as novidades</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-14">
        <p className="eyebrow">{post.category}</p>
        <h1 className="mt-3 text-4xl font-light">{post.title}</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString("pt-BR")}
        </p>
        {post.cover && (
          <img src={post.cover} alt="" className="mt-6 w-full rounded-lg object-cover" />
        )}
        <p className="mt-8 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {post.content}
        </p>
        <Button asChild variant="outline" className="mt-10">
          <Link to="/blog">Voltar</Link>
        </Button>
      </article>
    </SiteLayout>
  );
}
