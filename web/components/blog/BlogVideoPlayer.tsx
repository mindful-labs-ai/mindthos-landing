'use client';

interface BlogVideoPlayerProps {
  src: string;
  poster?: string;
}

/**
 * 블로그 본문 mp4 플레이어. `onContextMenu` 이벤트 핸들러를 사용하므로
 * Server Component 인 page.tsx 에서 직접 렌더할 수 없어 Client 로 분리.
 * (다운로드/우클릭 저장 차단 — controlsList="nodownload" + contextmenu 차단)
 */
export function BlogVideoPlayer({ src, poster }: BlogVideoPlayerProps) {
  return (
    <video
      controls
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
      preload="metadata"
      poster={poster}
      playsInline
      className="mt-12 aspect-video w-full rounded-2xl bg-black"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
