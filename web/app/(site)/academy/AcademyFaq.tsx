'use client';

import { useState } from 'react';

interface AcademyFaqProps {
  items: { q: string; a: string }[];
}

export function AcademyFaq({ items }: AcademyFaqProps) {
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <div className="academy-faq-list">
      {items.map((it, idx) => {
        const open = openIdx === idx;
        const id = `academy-faq-a-${idx}`;
        return (
          <article
            key={it.q}
            className={`academy-faq-item ${open ? 'is-open' : ''}`}
          >
            <button
              type="button"
              className="academy-faq-q"
              aria-expanded={open}
              aria-controls={id}
              onClick={() => setOpenIdx(open ? -1 : idx)}
            >
              <span className="academy-faq-q-mark" aria-hidden>Q.</span>
              <h3 className="academy-faq-q-text">{it.q}</h3>
              <span className="academy-faq-toggle" aria-hidden>
                {open ? '−' : '+'}
              </span>
            </button>
            <div className="academy-faq-a" id={id} role="region" hidden={!open}>
              <p className="academy-faq-a-text">{it.a}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
