import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/supabase/queries';
import { SITE_CONFIG } from '@/constants/site';

export const runtime = 'nodejs';
export const alt = '마음토스 블로그';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface OpengraphImageProps {
  params: Promise<{ slug: string }>;
}

export default async function OpengraphImage({ params }: OpengraphImageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title ?? '마음토스 블로그';
  const category = post?.category?.name ?? '마음토스';
  const author = post?.author?.name ?? SITE_CONFIG.name;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(135deg, #44ce4b 0%, #65c377 50%, #eeee76 100%)',
          padding: '80px',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#1f1f1f',
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#44ce4b',
              fontSize: '24px',
              fontWeight: 800,
            }}
          >
            M
          </div>
          <span>{SITE_CONFIG.name} · {category}</span>
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: title.length > 30 ? '60px' : '76px',
              fontWeight: 800,
              color: '#1f1f1f',
              lineHeight: 1.18,
              letterSpacing: '-0.02em',
              maxWidth: '1040px',
              wordBreak: 'keep-all',
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#1f1f1f',
            fontSize: '24px',
            fontWeight: 500,
            opacity: 0.85,
          }}
        >
          <span>by {author}</span>
          <span>mindthos.com</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
