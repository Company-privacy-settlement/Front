import { notFound } from 'next/navigation';
import { DocsArticle } from '@/components/docs-article';
import { docs } from '@/lib/docs';
export const dynamicParams = false;
export function generateStaticParams() { return docs.filter(doc => doc.slug).map(doc => ({ slug: doc.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params, doc = docs.find(d => d.slug === slug);
  if (!doc) return {};
  return { title: doc.title + ' · Docs', description: doc.description };
}
export default async function DocsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params, doc = docs.find(d => d.slug === slug);
  if (!doc) notFound();
  return <DocsArticle doc={doc}/>;
}
