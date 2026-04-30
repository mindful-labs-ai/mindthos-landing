import Link from 'next/link';
import { FOOTER_NAV } from '@/constants/nav';
import { BUSINESS_INFO, SITE_CONFIG } from '@/constants/site';
import { NewsletterForm } from '@/components/forms/NewsletterForm';

export function Footer() {
  return (
    <footer className="bg-[var(--bg-deep)] text-[var(--text-on-dark)]">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--gutter)] py-14 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* ① 브랜드 */}
          <div>
            <p className="text-lg font-semibold">{SITE_CONFIG.name}</p>
            <p className="mt-2 max-w-xs text-[length:var(--t-small)] text-[var(--text-on-dark-muted)]">
              {SITE_CONFIG.mission}
            </p>
            <div className="mt-6 max-w-sm">
              <NewsletterForm variant="dark" />
            </div>
          </div>

          {/* ② 마음토스 */}
          <FooterColumn
            heading="마음토스"
            items={[...FOOTER_NAV.service]}
          />

          {/* ③ 회사 */}
          <div>
            <h3 className="mb-3 text-[length:var(--t-eyebrow)] font-semibold uppercase tracking-wider text-[var(--text-on-dark-muted)]">
              회사
            </h3>
            <ul className="space-y-2 text-[length:var(--t-small)] text-white/78">
              {FOOTER_NAV.company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {SITE_CONFIG.email ? (
                <li>
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    className="transition-colors hover:text-white"
                  >
                    {SITE_CONFIG.email}
                  </a>
                </li>
              ) : null}
              {BUSINESS_INFO.address ? (
                <li className="text-[length:var(--t-meta)] text-white/55">
                  {BUSINESS_INFO.address}
                </li>
              ) : null}
            </ul>
            {(SITE_CONFIG.social.instagram ||
              SITE_CONFIG.social.linkedin ||
              SITE_CONFIG.social.twitter) ? (
              <ul className="mt-4 flex gap-3 text-[length:var(--t-small)] text-white/78">
                {SITE_CONFIG.social.instagram ? (
                  <li>
                    <a
                      href={SITE_CONFIG.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white"
                    >
                      Instagram
                    </a>
                  </li>
                ) : null}
                {SITE_CONFIG.social.linkedin ? (
                  <li>
                    <a
                      href={SITE_CONFIG.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white"
                    >
                      LinkedIn
                    </a>
                  </li>
                ) : null}
                {SITE_CONFIG.social.twitter ? (
                  <li>
                    <a
                      href={SITE_CONFIG.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white"
                    >
                      X
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>

          {/* ④ 약관 */}
          <FooterColumn heading="약관" items={[...FOOTER_NAV.legal]} />
        </div>
      </div>

      <FooterBottom />
    </footer>
  );
}

function FooterColumn({
  heading,
  items,
}: {
  heading: string;
  items: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-[length:var(--t-eyebrow)] font-semibold uppercase tracking-wider text-[var(--text-on-dark-muted)]">
        {heading}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-[length:var(--t-small)] text-white/78 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterBottom() {
  const lines: string[] = [];
  if (BUSINESS_INFO.companyName) lines.push(BUSINESS_INFO.companyName);
  if (BUSINESS_INFO.ceo) lines.push(`대표이사 ${BUSINESS_INFO.ceo}`);
  if (BUSINESS_INFO.brn) lines.push(`사업자등록번호 ${BUSINESS_INFO.brn}`);
  if (BUSINESS_INFO.ecommerceLicense)
    lines.push(`통신판매업신고 ${BUSINESS_INFO.ecommerceLicense}`);

  return (
    <div className="border-t border-white/8">
      <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-3 px-[var(--gutter)] py-6 text-[length:var(--t-meta)] text-white/55">
        <p>
          © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
        </p>
        {lines.length > 0 ? (
          <p className="leading-relaxed">{lines.join(' · ')}</p>
        ) : null}
        {BUSINESS_INFO.privacyOfficer.name ||
        BUSINESS_INFO.privacyOfficer.email ? (
          <p>
            개인정보 보호책임자{' '}
            {BUSINESS_INFO.privacyOfficer.name
              ? `${BUSINESS_INFO.privacyOfficer.name} · `
              : ''}
            {BUSINESS_INFO.privacyOfficer.email ? (
              <a
                href={`mailto:${BUSINESS_INFO.privacyOfficer.email}`}
                className="text-white/78 transition-colors hover:text-white"
              >
                {BUSINESS_INFO.privacyOfficer.email}
              </a>
            ) : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}
