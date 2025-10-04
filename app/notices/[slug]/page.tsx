import NoticeClient from './NoticeClient';

interface NoticeDetailPageProps {
  params: {
    slug: string;
  };
}

// Required for static export - generate empty params, handle client-side
export async function generateStaticParams() {
  return [];
}

// Enable dynamic params (client-side routing)
export const dynamicParams = true;

export default function NoticeDetailPage({ params }: NoticeDetailPageProps) {
  return <NoticeClient slug={params.slug} />;
}
