'use client';

import Image from 'next/image';
import { useEffect } from 'react';

export function MetricsSection() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    let rafIds: number[] = [];

    /* === §08 metrics in-view + count-up (replays on every re-entry) === */
    {
      const strip = document.querySelector<HTMLElement>('.metrics-strip');
      if (strip) {
        const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

        type Target = { textNode: Text; value: number; hasComma: boolean; original: string };
        const valEls = Array.from(strip.querySelectorAll<HTMLElement>('.metric-val'));
        const targets: Target[] = [];
        valEls.forEach((el) => {
          const value = Number(el.dataset.count);
          if (!Number.isFinite(value)) return;
          const hasComma = el.dataset.comma === 'true';
          const original = hasComma ? value.toLocaleString('en-US') : String(value);
          let textNode = Array.from(el.childNodes).find(
            (n) => n.nodeType === Node.TEXT_NODE,
          ) as Text | undefined;
          if (!textNode) {
            textNode = document.createTextNode(original);
            el.insertBefore(textNode, el.firstChild);
          }
          targets.push({ textNode, value, hasComma, original });
        });

        const cancelRafs = () => {
          rafIds.forEach((id) => cancelAnimationFrame(id));
          rafIds = [];
        };

        const writeAll = (text: (t: Target) => string) => {
          targets.forEach((t) => { t.textNode.textContent = text(t); });
        };

        const resetToZero = () => {
          cancelRafs();
          writeAll((t) => (t.hasComma ? (0).toLocaleString('en-US') : '0'));
        };

        const restoreOriginals = () => {
          cancelRafs();
          writeAll((t) => t.original);
        };

        const startCountUp = () => {
          if (prefersReduced) {
            restoreOriginals();
            return;
          }
          cancelRafs();
          const duration = 1600;
          const stagger = 100;
          const ease = (p: number) => 1 - Math.pow(1 - p, 3);
          targets.forEach((t, i) => {
            const startAt = performance.now() + i * stagger;
            const tick = (now: number) => {
              if (now < startAt) {
                rafIds.push(requestAnimationFrame(tick));
                return;
              }
              const p = Math.min((now - startAt) / duration, 1);
              const current = Math.floor(t.value * ease(p));
              t.textNode.textContent = t.hasComma
                ? current.toLocaleString('en-US')
                : String(current);
              if (p < 1) {
                rafIds.push(requestAnimationFrame(tick));
              } else {
                t.textNode.textContent = t.original;
              }
            };
            rafIds.push(requestAnimationFrame(tick));
          });
        };

        let inView = false;
        const enter = () => {
          if (inView) return;
          inView = true;
          strip.classList.add('stats-in-view');
          startCountUp();
        };
        const leave = () => {
          if (!inView) return;
          inView = false;
          strip.classList.remove('stats-in-view');
          if (!prefersReduced) resetToZero();
        };

        const isStripVisible = () => {
          const r = strip.getBoundingClientRect();
          const vh = window.innerHeight || document.documentElement.clientHeight;
          const vw = window.innerWidth || document.documentElement.clientWidth;
          if (r.bottom <= 0 || r.top >= vh) return false;
          if (r.right <= 0 || r.left >= vw) return false;
          const visibleH = Math.min(r.bottom, vh) - Math.max(r.top, 0);
          return visibleH / Math.max(r.height, 1) >= 0.2 || visibleH >= vh * 0.2;
        };

        if (prefersReduced || !('IntersectionObserver' in window)) {
          enter();
        } else {
          if (!prefersReduced) resetToZero();

          const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting && e.intersectionRatio >= 0.2) {
                enter();
              } else if (!e.isIntersecting) {
                leave();
              }
            });
          }, { threshold: [0, 0.2, 0.5] });
          io.observe(strip);
          cleanups.push(() => io.disconnect());

          /* IO 첫 콜백이 누락되거나 지연되는 경우 대비 — 다음 프레임에 즉시 가시성 직접 확인 */
          const fallbackId = window.setTimeout(() => {
            if (!inView && isStripVisible()) enter();
          }, 60);
          cleanups.push(() => window.clearTimeout(fallbackId));
        }
      }
    }

    return () => {
      cleanups.forEach((fn) => fn());
      rafIds.forEach((id) => cancelAnimationFrame(id));
    };
  }, []);

  return (
<section className="wf-section tone-dark">
  <div className="container">
    <div className="wf-marker">
      <span className="num">08</span>
      <span className="name">숫자와 목소리로 본 마음토스</span>
      <span className="purpose">정량 4 + 후기 stream + 기관/사용처 strip · 차분한 신뢰 (placeholder 명시)</span>
    </div>

    
    <div className="metrics-screen">
    <div className="metrics-strip" aria-label="마음토스 정량 지표">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-val" data-count="1400" data-comma="true">1,400<span className="unit">+</span></div>
          <div className="metric-label">함께 쓰는 상담사</div>
        </div>

        <div className="metric-card">
          <div className="metric-val" data-count="10000" data-comma="true">10,000<span className="unit">+</span></div>
          <div className="metric-label">정리된 상담 기록</div>
        </div>

        <div className="metric-card">
          <div className="metric-val" data-count="12">12<span className="unit">시간+</span></div>
          <div className="metric-label">월 기록 시간 절감</div>
        </div>

        <div className="metric-card">
          <div className="metric-val" data-count="90">90<span className="unit">%</span></div>
          <div className="metric-label">마음토스 재구독</div>
        </div>
      </div>
    </div>
    </div>

    
    

    
    <div className="reviews-screen">
    
    <p className="tm-bridge">숫자로 보이는 변화 뒤에는,<br/>상담사들이 <span className="tm-bridge-mark">계속 찾게 된 이유</span>가 있습니다.</p>

    <div className="tm-section-label">실제 상담사들이 남긴 이야기</div>

    
    <div className="tm-stream" aria-label="상담사 후기 자동 스트림">
      <div className="tm-track">
        
        <article className="tm-card">
          <span className="tm-reason">기록 부담 감소</span>
          <h3 className="tm-card-title">기록 부담이 한결 가벼워졌어요</h3>
          <blockquote className="tm-text">회기 직후 떠오른 흐름을 빠르게 정리해두면, 퇴근 후 다시 기억을 붙잡고 쓰는 일이 줄어듭니다. 메모에 신경 쓰는 부담이 줄어드니 회기 자체에 더 머무를 수 있게 됐어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-01.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>김OO 상담사</b><span>13년차 상담사</span></div>
          </div>
        </article>

        <article className="tm-card">
          <span className="tm-reason">사례 정리 도움</span>
          <h3 className="tm-card-title">슈퍼비전 전에 정리가 쉬워졌어요</h3>
          <blockquote className="tm-text">무엇을 가져가야 할지 막막할 때, 회기 핵심과 질문거리가 먼저 정리되어 도움이 됩니다. 교수님이나 슈퍼바이저에게 가져갈 자료를 준비하는 부담이 줄었어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-05.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>이OO 수련생</b><span>상담 수련생</span></div>
          </div>
        </article>

        <article className="tm-card">
          <span className="tm-reason">기관 기록 정리</span>
          <h3 className="tm-card-title">기관 기록의 일관성이 잡혔어요</h3>
          <blockquote className="tm-text">센터마다 양식이 달라도 같은 회기 내용을 한 흐름으로 정리할 수 있어 좋았습니다. 같은 기록을 양식마다 다시 쓰는 시간이 줄어, 행정 부담이 눈에 띄게 가벼워졌어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-06.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>박OO 센터장</b><span>상담센터 운영자</span></div>
          </div>
        </article>

        <article className="tm-card">
          <span className="tm-reason">회기 정리 효율</span>
          <h3 className="tm-card-title">기록 정리에 쓰던 시간이 줄었어요</h3>
          <blockquote className="tm-text">상담 직후 짧은 시간 안에 초안이 정리되니, 퇴근 후 다시 기억을 붙잡고 쓰는 일이 줄었습니다. 이전보다 내담자와 나눈 흐름을 놓치지 않고 확인할 수 있었어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-04.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>정OO 상담사</b><span>청소년 상담사</span></div>
          </div>
        </article>

        <article className="tm-card">
          <span className="tm-reason">내담자에 집중</span>
          <h3 className="tm-card-title">메모 부담이 덜해졌어요</h3>
          <blockquote className="tm-text">이전에는 상담 중에도 ‘이걸 나중에 어떻게 적지’라는 생각이 많았습니다. 지금은 회기 중에는 내담자에게 더 집중하고, 끝난 뒤 초안을 보며 필요한 부분만 다듬게 됐어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-03.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>윤OO 상담사</b><span>대학상담센터 상담사</span></div>
          </div>
        </article>

        <article className="tm-card">
          <span className="tm-reason">관점 재검토</span>
          <h3 className="tm-card-title">막힐 때 다시 정리할 길이 생겼어요</h3>
          <blockquote className="tm-text">사례개념화가 막힐 때 다른 관점에서 정리된 초안을 보면 놓쳤던 단서가 보입니다. 그대로 쓰기보다, 제 판단을 다시 점검하는 기준점으로 활용하고 있어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-02.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>한OO 수련생</b><span>상담심리 대학원생</span></div>
          </div>
        </article>

        <article className="tm-card">
          <span className="tm-reason">양식 자동 변환</span>
          <h3 className="tm-card-title">양식이 달라도 한 흐름으로 정리돼요</h3>
          <blockquote className="tm-text">기관 양식에 맞춰 같은 내용을 반복해서 다시 쓰는 시간이 줄었습니다. 상담 흐름은 유지하면서 필요한 형식에 맞춰 정리할 수 있어 행정 부담이 덜해졌어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-01.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>최OO 상담사</b><span>사설 상담센터 상담사</span></div>
          </div>
        </article>

        <article className="tm-card">
          <span className="tm-reason">보고서 톤 정리</span>
          <h3 className="tm-card-title">보고서 다듬는 시간이 짧아졌어요</h3>
          <blockquote className="tm-text">제가 자주 쓰는 어투로 초안이 정리되니, 처음부터 다시 쓰지 않고 필요한 부분만 손보게 됐습니다. 행정 보고서까지 정리하는 흐름이 한결 자연스러워졌어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-04.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>서OO 실무자</b><span>정신건강복지센터 실무자</span></div>
          </div>
        </article>

        
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">기록 부담 감소</span>
          <h3 className="tm-card-title">기록 부담이 한결 가벼워졌어요</h3>
          <blockquote className="tm-text">회기 직후 떠오른 흐름을 빠르게 정리해두면, 퇴근 후 다시 기억을 붙잡고 쓰는 일이 줄어듭니다. 메모에 신경 쓰는 부담이 줄어드니 회기 자체에 더 머무를 수 있게 됐어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-01.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>김OO 상담사</b><span>13년차 상담사</span></div>
          </div>
        </article>
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">사례 정리 도움</span>
          <h3 className="tm-card-title">슈퍼비전 전에 정리가 쉬워졌어요</h3>
          <blockquote className="tm-text">무엇을 가져가야 할지 막막할 때, 회기 핵심과 질문거리가 먼저 정리되어 도움이 됩니다. 교수님이나 슈퍼바이저에게 가져갈 자료를 준비하는 부담이 줄었어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-05.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>이OO 수련생</b><span>상담 수련생</span></div>
          </div>
        </article>
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">기관 기록 정리</span>
          <h3 className="tm-card-title">기관 기록의 일관성이 잡혔어요</h3>
          <blockquote className="tm-text">센터마다 양식이 달라도 같은 회기 내용을 한 흐름으로 정리할 수 있어 좋았습니다. 같은 기록을 양식마다 다시 쓰는 시간이 줄어, 행정 부담이 눈에 띄게 가벼워졌어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-06.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>박OO 센터장</b><span>상담센터 운영자</span></div>
          </div>
        </article>
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">회기 정리 효율</span>
          <h3 className="tm-card-title">기록 정리에 쓰던 시간이 줄었어요</h3>
          <blockquote className="tm-text">상담 직후 짧은 시간 안에 초안이 정리되니, 퇴근 후 다시 기억을 붙잡고 쓰는 일이 줄었습니다. 이전보다 내담자와 나눈 흐름을 놓치지 않고 확인할 수 있었어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-04.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>정OO 상담사</b><span>청소년 상담사</span></div>
          </div>
        </article>
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">내담자에 집중</span>
          <h3 className="tm-card-title">메모 부담이 덜해졌어요</h3>
          <blockquote className="tm-text">이전에는 상담 중에도 ‘이걸 나중에 어떻게 적지’라는 생각이 많았습니다. 지금은 회기 중에는 내담자에게 더 집중하고, 끝난 뒤 초안을 보며 필요한 부분만 다듬게 됐어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-03.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>윤OO 상담사</b><span>대학상담센터 상담사</span></div>
          </div>
        </article>
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">관점 재검토</span>
          <h3 className="tm-card-title">막힐 때 다시 정리할 길이 생겼어요</h3>
          <blockquote className="tm-text">사례개념화가 막힐 때 다른 관점에서 정리된 초안을 보면 놓쳤던 단서가 보입니다. 그대로 쓰기보다, 제 판단을 다시 점검하는 기준점으로 활용하고 있어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-02.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>한OO 수련생</b><span>상담심리 대학원생</span></div>
          </div>
        </article>
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">양식 자동 변환</span>
          <h3 className="tm-card-title">양식이 달라도 한 흐름으로 정리돼요</h3>
          <blockquote className="tm-text">기관 양식에 맞춰 같은 내용을 반복해서 다시 쓰는 시간이 줄었습니다. 상담 흐름은 유지하면서 필요한 형식에 맞춰 정리할 수 있어 행정 부담이 덜해졌어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-01.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>최OO 상담사</b><span>사설 상담센터 상담사</span></div>
          </div>
        </article>
        <article className="tm-card" aria-hidden="true">
          <span className="tm-reason">보고서 톤 정리</span>
          <h3 className="tm-card-title">보고서 다듬는 시간이 짧아졌어요</h3>
          <blockquote className="tm-text">제가 자주 쓰는 어투로 초안이 정리되니, 처음부터 다시 쓰지 않고 필요한 부분만 손보게 됐습니다. 행정 보고서까지 정리하는 흐름이 한결 자연스러워졌어요.</blockquote>
          <div className="tm-author">
            <span className="tm-avatar"><Image src="/testimonial-04.jpg" alt="" width={400} height={400} loading="lazy" /></span>
            <div className="tm-who"><b>서OO 실무자</b><span>정신건강복지센터 실무자</span></div>
          </div>
        </article>
      </div>
    </div>

    </div>

    
  </div>
</section>
  );
}
