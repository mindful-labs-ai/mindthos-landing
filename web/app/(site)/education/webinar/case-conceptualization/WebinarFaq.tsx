'use client';

import { useState } from 'react';

interface WebinarFaqProps {
  items: { q: string; a: string }[];
}

export function WebinarFaq({ items }: WebinarFaqProps) {
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <div className="webinar-faq-list">
      {items.map((it, idx) => {
        const open = openIdx === idx;
        const id = `webinar-faq-a-${idx}`;
        return (
          <article
            key={it.q}
            className={`webinar-faq-item ${open ? 'is-open' : ''}`}
          >
            <button
              type="button"
              className="webinar-faq-q"
              aria-expanded={open}
              aria-controls={id}
              onClick={() => setOpenIdx(open ? -1 : idx)}
            >
              <span className="webinar-faq-q-mark" aria-hidden>Q.</span>
              <h3 className="webinar-faq-q-text">{it.q}</h3>
              <span className="webinar-faq-toggle" aria-hidden>{open ? '−' : '+'}</span>
            </button>
            <div id={id} className="webinar-faq-a" hidden={!open}>
              <p>{it.a}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
