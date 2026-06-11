import Container from '@/components/ui/Container';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function HomePage() {
  return (
    <Container className="py-8">
      {/* Hero section */}
      <section className="text-center mb-12">
        <h1 className="mb-4">Welcome to SoulCare</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Read scripture, book counselling sessions, and find spiritual resources.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <Button href="/booking">Book a Session</Button>
          <Button variant="outline" href="/bible">Read Bible</Button>
        </div>
      </section>

      {/* Feature cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3>📖 Bible Reading</h3>
          </CardHeader>
          <CardContent>
            Multiple versions, search, and personal notes.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3>💬 Counselling</h3>
          </CardHeader>
          <CardContent>
            Pay-as-you-go sessions with licensed counsellors.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3>📚 Resources</h3>
          </CardHeader>
          <CardContent>
            Articles, audio, and videos for spiritual growth.
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}