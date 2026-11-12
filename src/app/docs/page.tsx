import { DocsArticle } from '@/components/docs-article';
import { docs } from '@/lib/docs';
export const metadata = { title: 'Getting started · Docs', description: docs[0].description };
export default function DocsHome() { return <DocsArticle doc={docs[0]}/>; }
