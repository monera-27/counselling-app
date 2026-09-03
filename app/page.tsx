import Link from 'next/link';
import Container from '@/components/ui/Container';
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="relative bg-cream dark:bg-gray-900 overflow-hidden py-20 px-4 md:py-28">
        {/* Decorative navy block - top right */}
        <div className="absolute top-0 right-0 w-[38%] h-full pointer-events-none opacity-10 dark:opacity-20">
          <div className="w-full h-full bg-navy dark:bg-gold/20 clip-polygon-diagonal glass" />
        </div>

        <Container className="relative max-w-4xl">
          <p className="text-teal dark:text-gold-light text-sm tracking-[0.12em] uppercase font-sans font-semibold mb-4">
            Counselling &amp; Spiritual Care
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-navy dark:text-cream leading-[1.15] mb-6">
            Gentle Support,
            <br />
            <span className="text-teal dark:text-gold">Spiritual Growth.</span>
          </h1>
          <div className="w-16 h-0.5 bg-gold mb-6" />
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed font-sans mb-10">
            Professional counselling services integrated with scripture reading,
            devotional notes, and spiritual resources — all in one place.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="lg" href="/book-session">
              Book a Session
            </Button>
            <Button variant="gold" size="lg" href="/bible">
              Read the Bible
            </Button>
          </div>
        </Container>
      </section>

      {/* ── What We Offer (with clickable cards) ── */}
      <section className="bg-white dark:bg-gray-950 py-16 px-4">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-navy dark:text-cream font-serif text-3xl md:text-4xl font-bold mb-0">
              What We Offer
            </h2>
            <div className="w-16 h-0.5 bg-gold mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '📖',
                title: 'Bible Reading',
                desc: 'KJV, ASV, and Amplified versions with Strong\'s concordance, word search, and personal notes.',
                href: '/bible',
              },
              {
                icon: '💬',
                title: 'Counselling Sessions',
                desc: 'Book one-on-one sessions with a licensed counsellor. Flexible scheduling, intake form included.',
                href: '/book-session',
              },
              {
                icon: '📚',
                title: 'Resources',
                desc: 'Curated articles, audio, and videos for your spiritual growth and emotional wellbeing.',
                href: '/resources',
              },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="block group">
                <Card accent hover className="h-full text-center transition-all duration-300 cursor-pointer">
                  <CardContent className="text-center">
                    <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-110">
                      {item.icon}
                    </div>
                    <h3 className="text-navy dark:text-cream font-serif text-xl font-bold mb-3 group-hover:text-gold transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-sans m-0">
                      {item.desc}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1 text-gold font-serif text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                      Learn More
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Navy Section (Our Approach) ── */}
      <section className="relative bg-navy dark:bg-gray-950 py-16 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 bottom-0 w-[30%] pointer-events-none">
          <div className="w-full h-full bg-gold/10 dark:bg-gold/5 clip-polygon-diagonal-reverse" />
        </div>

        <Container className="relative">
          <div className="text-center mb-12">
            <h2 className="text-cream dark:text-gray-100 font-serif text-3xl md:text-4xl font-bold mb-0">
              Our Approach
            </h2>
            <div className="w-16 h-0.5 bg-gold mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {
                title: 'Faith-Centred',
                desc: 'Scripture integrated with evidence-based counselling practices.',
              },
              {
                title: 'Person-Centred',
                desc: 'Every session shaped around your unique journey and needs.',
              },
              {
                title: 'Holistic Healing',
                desc: 'Emotional, spiritual, and psychological wellbeing together.',
              },
            ].map((item) => (
              <div key={item.title}>
                <div className="w-8 h-0.5 bg-gold mb-4" />
                <h3 className="text-cream dark:text-gray-100 font-serif text-lg font-bold mb-2">
                  {item.title}
                </h3>
                <p className="text-cream/70 dark:text-gray-300 text-sm leading-relaxed font-sans m-0">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-teal dark:bg-gray-800 py-16 px-4 text-center">
        <Container>
          <h2 className="text-white font-serif text-3xl md:text-4xl font-bold mb-4">
            Ready to Begin?
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
          <p className="text-white/85 dark:text-gray-200 text-base max-w-md mx-auto leading-relaxed font-sans mb-8">
            Booking is simple. Fill in a short intake form and we&apos;ll be in touch to confirm your session.
          </p>
          <Button variant="primary" size="lg" href="/book-session">
            Book a Session
          </Button>
        </Container>
      </section>
    </div>
  );
}