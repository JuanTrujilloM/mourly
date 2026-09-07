import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import type { LegalDocument } from '@/lib/legal/types';

export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <div className="bg-page flex flex-1 flex-col">
      <LandingNavbar />
      <main className="px-4 pt-28 pb-20 sm:px-6 sm:pt-36">
        <article className="mx-auto max-w-2xl">
          <p className="label text-ink-3">Legal</p>
          <h1 className="heading text-ink mt-3 text-4xl sm:text-5xl">
            {document.title}
          </h1>
          <p className="text-ink-3 mt-4 text-sm">
            Versión {document.version} · Vigente desde {document.updatedAt}
          </p>
          {document.intro && (
            <p className="text-ink-2 mt-6 text-lg">{document.intro}</p>
          )}

          {document.sections.map((section) => (
            <section
              key={section.heading}
              className="border-line mt-10 border-t pt-8"
            >
              <h2 className="subheading text-ink text-[22px]">
                {section.heading}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="text-ink-2 mt-3 leading-relaxed">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="text-ink-2 mt-3 list-disc space-y-2 pl-5 leading-relaxed">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
