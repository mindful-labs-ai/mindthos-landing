#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
seo_scorer.py — 복합 SEO 품질 점수 산출기

keyword_analyzer와 readability_scorer를 임포트하고,
추가 SEO 항목(메타 길이, 슬러그, FAQ, 참조, 구조)을 검사하여
가중 합산 복합 점수를 반환합니다.
"""

import re
import json
import sys
from typing import Any

from keyword_analyzer import analyze_keywords
from readability_scorer import score_readability


# ---------------------------------------------------------------------------
# 개별 SEO 항목 검사
# ---------------------------------------------------------------------------

def check_meta_quality(content_obj: dict[str, Any]) -> dict[str, Any]:
    """
    메타 태그 품질 검사.

    반환:
        {
            meta_title_length: int,
            meta_description_length: int,
            meta_title_ok: bool,
            meta_description_ok: bool,
            meta_score: int (0-100),
            warnings: [str]
        }
    """
    meta_title: str = content_obj.get('meta_title', '')
    meta_description: str = content_obj.get('meta_description', '')
    warnings: list[str] = []

    mt_len = len(meta_title)
    md_len = len(meta_description)

    # meta_title: 30~60자 이상적
    if mt_len == 0:
        mt_score = 0
        warnings.append("meta_title이 없습니다 — SEO에 필수 항목입니다.")
    elif mt_len < 20:
        mt_score = 40
        warnings.append(f"meta_title이 {mt_len}자로 너무 짧습니다 (권장: 30~60자).")
    elif mt_len < 30:
        mt_score = 70
        warnings.append(f"meta_title이 {mt_len}자입니다 (권장: 30~60자).")
    elif mt_len <= 60:
        mt_score = 100
    elif mt_len <= 70:
        mt_score = 80
        warnings.append(f"meta_title이 {mt_len}자로 약간 깁니다 (권장: 30~60자).")
    else:
        mt_score = 50
        warnings.append(f"meta_title이 {mt_len}자로 너무 깁니다 — 검색 결과에서 잘릴 수 있습니다 (권장: 30~60자).")

    # meta_description: 120~155자 이상적
    if md_len == 0:
        md_score = 0
        warnings.append("meta_description이 없습니다 — 클릭률(CTR)에 직접적인 영향을 줍니다.")
    elif md_len < 80:
        md_score = 40
        warnings.append(f"meta_description이 {md_len}자로 너무 짧습니다 (권장: 120~155자).")
    elif md_len < 120:
        md_score = 70
        warnings.append(f"meta_description이 {md_len}자입니다 (권장: 120~155자).")
    elif md_len <= 155:
        md_score = 100
    elif md_len <= 170:
        md_score = 80
        warnings.append(f"meta_description이 {md_len}자로 약간 깁니다 (권장: 120~155자).")
    else:
        md_score = 50
        warnings.append(f"meta_description이 {md_len}자로 너무 깁니다 — 검색 결과에서 잘릴 수 있습니다 (권장: 120~155자).")

    meta_score = int((mt_score + md_score) / 2)

    return {
        'meta_title_length': mt_len,
        'meta_description_length': md_len,
        'meta_title_ok': 30 <= mt_len <= 60,
        'meta_description_ok': 120 <= md_len <= 155,
        'meta_score': meta_score,
        'warnings': warnings,
    }


def check_slug(content_obj: dict[str, Any]) -> dict[str, Any]:
    """
    슬러그 형식 검사 (소문자, 하이픈, 3~5단어).

    반환:
        {slug, word_count, is_lowercase, has_only_valid_chars, slug_score: 0-100, warnings}
    """
    slug: str = content_obj.get('slug', '')
    warnings: list[str] = []

    if not slug:
        return {
            'slug': '',
            'word_count': 0,
            'is_lowercase': False,
            'has_only_valid_chars': False,
            'slug_score': 0,
            'warnings': ["슬러그가 없습니다."],
        }

    is_lowercase = slug == slug.lower()
    has_only_valid_chars = bool(re.match(r'^[a-z0-9\-]+$', slug))
    words = [w for w in slug.split('-') if w]
    word_count = len(words)

    score = 100

    if not is_lowercase:
        score -= 30
        warnings.append(f"슬러그에 대문자가 포함되어 있습니다 (권장: 소문자만 사용).")

    if not has_only_valid_chars:
        score -= 30
        warnings.append("슬러그에 허용되지 않는 문자가 있습니다 (영소문자, 숫자, 하이픈만 허용).")

    if word_count < 3:
        score -= 20
        warnings.append(f"슬러그가 {word_count}단어로 너무 짧습니다 (권장: 3~5단어).")
    elif word_count > 7:
        score -= 15
        warnings.append(f"슬러그가 {word_count}단어로 너무 깁니다 (권장: 3~5단어).")
    elif word_count > 5:
        score -= 5
        warnings.append(f"슬러그가 {word_count}단어입니다 (권장: 3~5단어).")

    return {
        'slug': slug,
        'word_count': word_count,
        'is_lowercase': is_lowercase,
        'has_only_valid_chars': has_only_valid_chars,
        'slug_score': max(0, score),
        'warnings': warnings,
    }


def check_structure(content_obj: dict[str, Any]) -> dict[str, Any]:
    """
    콘텐츠 구조 검사 (FAQ, 참조, 헤딩 존재 여부).

    반환:
        {
            faq_count, references_count,
            has_h2, faq_ok, references_ok,
            structure_score: 0-100, warnings
        }
    """
    raw_content: str = content_obj.get('content', '')
    faq: list = content_obj.get('faq', [])
    references: list = content_obj.get('references', [])
    warnings: list[str] = []

    faq_count = len(faq)
    references_count = len(references)
    has_h2 = bool(re.search(r'^##\s+.+$', raw_content, flags=re.MULTILINE))

    score = 100

    # FAQ: 4~6개 이상적
    if faq_count == 0:
        score -= 30
        warnings.append("FAQ가 없습니다 — FAQ Schema로 검색 노출 기회를 늘릴 수 있습니다 (권장: 4~6개).")
    elif faq_count < 3:
        score -= 15
        warnings.append(f"FAQ가 {faq_count}개입니다 (권장: 4~6개).")
    elif faq_count > 8:
        score -= 10
        warnings.append(f"FAQ가 {faq_count}개로 많습니다 (권장: 4~6개) — 핵심 질문을 추려 간결하게 유지하세요.")

    # 참조: 1~5개 이상적
    if references_count == 0:
        score -= 20
        warnings.append("참조(references)가 없습니다 — 공신력 있는 출처가 E-E-A-T 점수에 도움이 됩니다 (권장: 1~5개).")
    elif references_count > 7:
        score -= 5
        warnings.append(f"참조가 {references_count}개로 많습니다 (권장: 1~5개).")

    # H2 헤딩 존재 여부
    if not has_h2:
        score -= 20
        warnings.append("H2 헤딩이 없습니다 — 문서 구조를 위해 반드시 H2 소제목을 추가하세요.")

    return {
        'faq_count': faq_count,
        'references_count': references_count,
        'has_h2': has_h2,
        'faq_ok': 4 <= faq_count <= 6,
        'references_ok': 1 <= references_count <= 5,
        'structure_score': max(0, score),
        'warnings': warnings,
    }


def check_content_length(content_obj: dict[str, Any]) -> dict[str, Any]:
    """
    본문 길이 점수 (별도 가중치 항목).

    반환:
        {content_length, length_score: 0-100, warnings}
    """
    from readability_scorer import strip_markdown
    raw_content: str = content_obj.get('content', '')
    plain = strip_markdown(raw_content)
    content_length = len(plain)
    warnings: list[str] = []

    if content_length < 1000:
        length_score = 20
        warnings.append(f"본문이 {content_length}자로 매우 짧습니다 (권장: 2,000~5,000자).")
    elif content_length < 1500:
        length_score = 50
        warnings.append(f"본문이 {content_length}자입니다 (권장: 2,000~5,000자).")
    elif content_length < 2000:
        length_score = 70
        warnings.append(f"본문이 {content_length}자입니다 — 조금 더 보강하면 좋습니다 (권장: 2,000~5,000자).")
    elif content_length <= 5000:
        length_score = 100
    elif content_length <= 6000:
        length_score = 85
        warnings.append(f"본문이 {content_length}자로 깁니다 (권장: 2,000~5,000자).")
    else:
        length_score = 60
        warnings.append(f"본문이 {content_length}자로 매우 깁니다 — 분리 또는 요약을 고려하세요.")

    return {
        'content_length': content_length,
        'length_score': length_score,
        'warnings': warnings,
    }


# ---------------------------------------------------------------------------
# 복합 점수 산출
# ---------------------------------------------------------------------------

def score_seo(data: dict[str, Any]) -> dict[str, Any]:
    """
    복합 SEO 점수 산출.

    가중치:
        - 키워드 점수:   30%
        - 가독성 점수:   25%
        - 메타 품질:     20%
        - 구조 점수:     15%
        - 본문 길이:     10%

    Args:
        data: content.json 형식의 딕셔너리

    Returns:
        {
            keyword_analysis, readability_analysis,
            meta_quality, slug_check, structure_check, content_length_check,
            composite_score: int (0-100),
            warnings: [str]
        }
    """
    content_obj = data.get('content', {})

    kw_result = analyze_keywords(data)
    read_result = score_readability(data)
    meta_result = check_meta_quality(content_obj)
    slug_result = check_slug(content_obj)
    struct_result = check_structure(content_obj)
    length_result = check_content_length(content_obj)

    kw_score = kw_result['overall_density_score']
    read_score = read_result['readability_score']
    meta_score = meta_result['meta_score']
    struct_score = struct_result['structure_score']
    length_score = length_result['length_score']

    composite_score = int(
        kw_score * 0.30
        + read_score * 0.25
        + meta_score * 0.20
        + struct_score * 0.15
        + length_score * 0.10
    )

    # 전체 경고 수집
    all_warnings: list[str] = (
        kw_result.get('warnings', [])
        + read_result.get('warnings', [])
        + meta_result.get('warnings', [])
        + slug_result.get('warnings', [])
        + struct_result.get('warnings', [])
        + length_result.get('warnings', [])
    )

    return {
        'keyword_analysis': kw_result,
        'readability_analysis': read_result,
        'meta_quality': meta_result,
        'slug_check': slug_result,
        'structure_check': struct_result,
        'content_length_check': length_result,
        'scores': {
            'keyword': kw_score,
            'readability': read_score,
            'meta': meta_score,
            'structure': struct_score,
            'content_length': length_score,
            'composite': composite_score,
        },
        'composite_score': composite_score,
        'warnings': all_warnings,
    }


def main() -> None:
    """단독 실행 시 CLI 진입점."""
    import argparse

    parser = argparse.ArgumentParser(
        description='한국어 복합 SEO 품질 점수 산출기',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예시:
  python seo_scorer.py ../content.json
  python seo_scorer.py content.json --output result.json
        """,
    )
    parser.add_argument('input', nargs='?', default='../content.json',
                        help='분석할 content.json 파일 경로 (기본값: ../content.json)')
    parser.add_argument('--output', '-o', default=None,
                        help='결과를 저장할 JSON 파일 경로 (기본값: stdout)')
    args = parser.parse_args()

    try:
        with open(args.input, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"오류: 파일을 찾을 수 없습니다 — {args.input}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"오류: JSON 파싱 실패 — {e}", file=sys.stderr)
        sys.exit(1)

    result = score_seo(data)
    output_json = json.dumps(result, ensure_ascii=False, indent=2)

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output_json)
        print(f"결과 저장 완료: {args.output}")
    else:
        print(output_json)


if __name__ == '__main__':
    main()
