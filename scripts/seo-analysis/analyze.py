#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
analyze.py — SEO 분석 CLI 진입점

모든 분석 모듈(keyword_analyzer, readability_scorer, seo_scorer)을 실행하고
통합 보고서를 생성합니다.

사용법:
  python analyze.py [content.json 경로] [--output 보고서.json]

기본값:
  - 입력: ../content.json
  - 출력: stdout (JSON)
"""

import json
import sys
import argparse
from datetime import datetime, timezone

# 같은 디렉토리 내 모듈 임포트
from keyword_analyzer import analyze_keywords
from readability_scorer import score_readability
from seo_scorer import score_seo


# ---------------------------------------------------------------------------
# 등급 산정
# ---------------------------------------------------------------------------

def get_grade(score: int) -> str:
    """점수에 따른 등급 반환."""
    if score >= 90:
        return 'A'
    elif score >= 70:
        return 'B'
    elif score >= 50:
        return 'C'
    elif score >= 30:
        return 'D'
    else:
        return 'F'


def get_grade_label(grade: str) -> str:
    """등급에 대한 한국어 설명."""
    labels = {
        'A': '우수 — 검색 노출에 적합한 고품질 콘텐츠입니다.',
        'B': '양호 — 몇 가지 개선으로 더 좋은 성과를 낼 수 있습니다.',
        'C': '보통 — 주요 항목 개선이 필요합니다.',
        'D': '미흡 — SEO 기준을 충족하려면 상당한 보완이 필요합니다.',
        'F': '불량 — 콘텐츠 전면 재작성 또는 구조 개편을 권장합니다.',
    }
    return labels.get(grade, '')


# ---------------------------------------------------------------------------
# 권장 사항 생성
# ---------------------------------------------------------------------------

def generate_recommendations(seo_result: dict) -> list[str]:
    """
    분석 결과에서 우선순위가 높은 권장 사항 목록을 생성합니다.
    중복 제거 후 최대 10개 반환.
    """
    seen: set[str] = set()
    recommendations: list[str] = []

    all_warnings: list[str] = seo_result.get('warnings', [])

    for w in all_warnings:
        # 중복 제거
        key = w[:30]
        if key not in seen:
            seen.add(key)
            recommendations.append(w)
        if len(recommendations) >= 10:
            break

    # 권장 사항이 없으면 긍정적 메시지
    if not recommendations:
        recommendations.append("모든 SEO 항목이 권장 기준을 충족합니다. 정기적으로 콘텐츠를 업데이트해 신선도를 유지하세요.")

    return recommendations


# ---------------------------------------------------------------------------
# 메인 분석 함수
# ---------------------------------------------------------------------------

def run_analysis(data: dict) -> dict:
    """
    전체 SEO 분석 실행 및 통합 보고서 반환.

    Args:
        data: content.json 형식의 딕셔너리

    Returns:
        {
            timestamp, overall_score, grade, grade_label,
            keyword_analysis, readability_analysis, seo_analysis,
            recommendations
        }
    """
    # 각 모듈 실행
    kw_result = analyze_keywords(data)
    read_result = score_readability(data)
    seo_result = score_seo(data)

    overall_score = seo_result['composite_score']
    grade = get_grade(overall_score)
    recommendations = generate_recommendations(seo_result)

    report = {
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'overall_score': overall_score,
        'grade': grade,
        'grade_label': get_grade_label(grade),
        'scores': seo_result.get('scores', {}),
        'keyword_analysis': kw_result,
        'readability_analysis': read_result,
        'seo_analysis': {
            'meta_quality': seo_result.get('meta_quality', {}),
            'slug_check': seo_result.get('slug_check', {}),
            'structure_check': seo_result.get('structure_check', {}),
            'content_length_check': seo_result.get('content_length_check', {}),
        },
        'recommendations': recommendations,
    }

    return report


# ---------------------------------------------------------------------------
# CLI 진입점
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        prog='analyze.py',
        description='한국어 블로그 SEO 품질 분석기',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  python analyze.py
      → ../content.json 을 분석하고 결과를 stdout으로 출력

  python analyze.py path/to/content.json
      → 지정한 파일을 분석

  python analyze.py path/to/content.json --output report.json
      → 결과를 report.json 파일에 저장

분석 항목:
  - 키워드 밀도 및 위치 분포 (제목/첫 단락/H2/메타)
  - 한국어 가독성 (문장 길이, 단락 길이, H2 분포)
  - 메타 태그 품질 (meta_title/meta_description 길이)
  - 슬러그 형식 (소문자, 하이픈, 단어 수)
  - 구조 완성도 (FAQ, 참조, 헤딩)
  - 본문 길이

등급 기준:
  A (90점 이상)  — 우수
  B (70~89점)   — 양호
  C (50~69점)   — 보통
  D (30~49점)   — 미흡
  F (30점 미만)  — 불량
        """,
    )
    parser.add_argument(
        'input',
        nargs='?',
        default='../content.json',
        help='분석할 content.json 파일 경로 (기본값: ../content.json)',
    )
    parser.add_argument(
        '--output', '-o',
        default=None,
        metavar='FILE',
        help='결과를 저장할 JSON 파일 경로 (기본값: stdout)',
    )
    args = parser.parse_args()

    # 파일 읽기
    try:
        with open(args.input, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"오류: 입력 파일을 찾을 수 없습니다 — {args.input}", file=sys.stderr)
        print("도움말: python analyze.py --help", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"오류: JSON 파싱 실패 — {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"오류: {e}", file=sys.stderr)
        sys.exit(1)

    # 분석 실행
    try:
        report = run_analysis(data)
    except Exception as e:
        print(f"오류: 분석 중 문제가 발생했습니다 — {e}", file=sys.stderr)
        sys.exit(1)

    # 결과 출력
    output_json = json.dumps(report, ensure_ascii=False, indent=2)

    if args.output:
        try:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(output_json)
            print(f"SEO 분석 완료: {args.output}")
            print(f"종합 점수: {report['overall_score']}점 / 등급: {report['grade']} — {report['grade_label']}")
        except IOError as e:
            print(f"오류: 파일 저장 실패 — {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print(output_json)

    sys.exit(0)


if __name__ == '__main__':
    main()
