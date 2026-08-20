import { SiteLayout, PageHeader } from "./Layout";

export function LegalPage({
  eyebrow,
  title,
  sections,
}: {
  eyebrow: string;
  title: string;
  sections: { h: string; p: string }[];
}) {
  return (
    <SiteLayout>
      <PageHeader eyebrow={eyebrow} title={title} />
      <section className="mx-auto max-w-3xl space-y-8 px-4 py-14">
        {sections.map((s) => (
          <div key={s.h}>
            <h2 className="text-xl font-light">{s.h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
          </div>
        ))}
        <p className="border-t border-border pt-6 text-xs text-muted-foreground">
          Última atualização: {new Date().getFullYear()}. MARIMAX.
        </p>
      </section>
    </SiteLayout>
  );
}
