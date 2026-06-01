#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
opportunity_scorer.py — 전체 키워드 기회 점수 산출 도구

context/target-keywords.md의 모든 키워드에 대해 DataForSEO에서
실제 검색량을 조회하고 기회 점수를 계산하여 우선순위 목록을 출력합니다.

사용법:
    python opportunity_scorer.py
    python opportunity_scorer.py --top 20
    python opportunity_scorer.py --category case-conceptualization
    python opportunity_scorer.py --top 30 --output priorities.json
    python opportunity_scorer.py --help
"""

import argparse
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# 프로젝트 루트 설정
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
_KEYWORDS_FILE = _PROJECT_ROOT / "context" / "target-keywords.md"

sys.path.insert(0, str(Path(__file__).resolve().parent))
from dataforseo_client import DataForSEOClient, DataForSEOError


# ------------------------------------------------------------------
# 카테고리 매핑
# ------------------------------------------------------------------

_CATEGORY_MAP = {
    "case-conceptualization": "1. case-conceptualization",
    "counseling-skills": "2. counseling-skills",
    "training": "3. training",
    "career": "4. career",
    "operations": "5. operations",
    "self-care": "6. self-care",
    "trends": "7. trends",
    "tech-blog": "8. tech-blog",
}

_INTENT_SCORES = {
    "정보형": 60,
    "정보형/상업형": 70,
    "상업형/거래형": 90,
    "상업형": 80,
    "거래형": 100,
    "탐색형": 50,
}

_DEFAULT_INTENT_SCORE = 60


def _get_intent_score(intent_text: str) -> int:
    for key, score in _INTENT_SCORES.items():
        if key in intent_text:
            return score
    return _DEFAULT_INTENT_SCORE


# ------------------------------------------------------------------
# target-keywords.md 전체 파싱
# ------------------------------------------------------------------

def _parse_all_keywords(category_filter: Optional[str] = None) -> list[dict]:
    """
    target-keywords.md에서 모든 키워드를 파싱합니다.

    Args:
        category_filter: 필터링할 카테고리 슬러그 (예: "case-conceptualization")
                         None이면 전체 반환

    Returns:
        [{"keyword": str, "category": str, "intent": str, "intent_score": int, "type": str}]
    """
    if not _KEYWORDS_FILE.exists():
        print(f"오류: {_KEYWORDS_FILE} 파일을 찾을 수 없습니다.", file=sys.stderr)
        sys.exit(1)

    text = _KEYWORDS_FILE.read_text(encoding="utf-8")
    keywords = []
    seen = set()
    current_category = "unknown"
    # 카테고리 헤더를 만나기 전까지는 수집하지 않음 (파일 상단 메타 테이블 제외)
    in_category_section = False
    in_target_category = False

    # 카테고리 헤더 패턴: "### N. slug (..."
    category_pattern = re.compile(r"^###\s+\d+\.\s+([\w\-]+)")
    longtail_pattern = re.compile(r'^-\s+"([^"]+)"')

    for line in text.splitlines():
        stripped = line.strip()

        # 카테고리 헤더 감지
        m = category_pattern.match(stripped)
        if m:
            in_category_section = True
            current_category = m.group(1).lower()
            if category_filter:
                in_target_category = current_category == category_filter.lower()
            else:
                in_target_category = True
            continue

        # 비-카테고리 ## 섹션 감지 시 카테고리 파싱 종료
        # (경쟁사 대비 기회 키워드, 시즌별 키워드 캘린더 등)
        if in_category_section and stripped.startswith("## ") and not stripped.startswith("###"):
            in_category_section = False
            in_target_category = False
            continue

        if not in_category_section or not in_target_category:
            continue

        # 테이블 행 파싱
        if stripped.startswith("|") and not stripped.startswith("|---"):
            cells = [c.strip() for c in stripped.split("|") if c.strip()]
            if len(cells) < 2:
                continue
            kw = cells[0]
            intent = cells[2] if len(cells) > 2 else "정보형"

            # 헤더/구분자 제외
            if kw in ("키워드", "의도 유형", "시기", "키워드 클러스터", "주목 키워드"):
                continue
            if not kw or kw.startswith("-"):
                continue

            dedup_key = f"{current_category}:{kw}"
            if dedup_key not in seen:
                seen.add(dedup_key)
                keywords.append({
                    "keyword": kw,
                    "category": current_category,
                    "intent": intent,
                    "intent_score": _get_intent_score(intent),
                    "type": "core",
                })
            continue

        # 롱테일 키워드 파싱
        m = longtail_pattern.match(stripped)
        if m:
            kw = m.group(1)
            dedup_key = f"{current_category}:{kw}"
            if dedup_key not in seen:
                seen.add(dedup_key)
                keywords.append({
                    "keyword": kw,
                    "category": current_category,
                    "intent": "정보형",
                    "intent_score": _DEFAULT_INTENT_SCORE,
                    "type": "longtail",
                })

    return keywords


# ------------------------------------------------------------------
# 기회 점수 계산
# ------------------------------------------------------------------

def _compute_opportunity_score(
    volume: int,
    competition: float,
    intent_score: int,
    trend: list,
    all_volumes: list[int],
) -> float:
    """
    기회 점수 산출 (0-100).

    가중치:
        - 검색량: 35% (전체 대비 정규화)
        - 경쟁도 역수: 30%
        - 검색 의도: 20%
        - 트렌드: 15%
    """
    max_vol = max(all_volumes) if all_volumes else 1
    volume_score = min(100.0, (volume / max_vol) * 100) if max_vol > 0 else 0.0

    competition_score = (1.0 - min(1.0, float(competition))) * 100.0

    trend_score = 50.0
    if trend and len(trend) >= 6:
        recent = sum(trend[:3]) / 3
        older = sum(trend[3:6]) / 3
        if older > 0:
            trend_score = min(100.0, (recent / older) * 50.0)

    score = (
        volume_score * 0.35
        + competition_score * 0.30
        + float(intent_score) * 0.20
        + trend_score * 0.15
    )
    return round(score, 1)


# ------------------------------------------------------------------
# 메인 함수
# ------------------------------------------------------------------

def score_all_keywords(
    category_filter: Optional[str] = None,
    top_n: int = 20,
    client: Optional[DataForSEOClient] = None,
) -> dict:
    """
    target-keywords.md의 모든 키워드를 DataForSEO로 조회하고 기회 점수를 산출합니다.

    Args:
        category_filter: 특정 카테고리만 분석 (예: "case-conceptualization")
        top_n: 반환할 상위 키워드 수
        client: 기존 DataForSEOClient 인스턴스

    Returns:
        구조화된 우선순위 리포트 dict
    """
    if client is None:
        client = DataForSEOClient()

    # 1. 키워드 파싱
    print("context/target-keywords.md 파싱 중...")
    all_kw_meta = _parse_all_keywords(category_filter)
    print(f"  {len(all_kw_meta)}개 키워드 파싱 완료")

    if not all_kw_meta:
        print("분석할 키워드가 없습니다.")
        return {"error": "키워드 없음"}

    # 2. 배치 검색량 조회 (최대 700개씩)
    all_keywords = [m["keyword"] for m in all_kw_meta]
    batch_size = 700
    batches = [all_keywords[i:i + batch_size] for i in range(0, len(all_keywords), batch_size)]

    print(f"DataForSEO 검색량 조회 중... ({len(all_keywords)}개, {len(batches)}배치)")
    volume_data: dict[str, dict] = {}

    for idx, batch in enumerate(batches):
        if idx > 0:
            print(f"  배치 {idx + 1}/{len(batches)} 처리 중...")
            time.sleep(0.5)
        batch_result = client.get_search_volume_with_fallback(batch)
        volume_data.update(batch_result)

    print(f"  검색량 데이터 수신 완료 ({len(volume_data)}개)")

    # 3. 전체 검색량 목록 (정규화용)
    all_vols = [v.get("volume", 0) for v in volume_data.values()]

    # 4. 점수 계산
    scored = []
    for meta in all_kw_meta:
        kw = meta["keyword"]
        vdata = volume_data.get(kw, {})
        vol = vdata.get("volume", 0)
        comp = vdata.get("competition", 0.0)
        trend = vdata.get("trend", [])
        intent_score = meta.get("intent_score", _DEFAULT_INTENT_SCORE)

        opp_score = _compute_opportunity_score(vol, comp, intent_score, trend, all_vols)
        scored.append({
            "keyword": kw,
            "category": meta.get("category", ""),
            "type": meta.get("type", "core"),
            "intent": meta.get("intent", "정보형"),
            "volume": vol,
            "competition": comp,
            "competition_level": vdata.get("competition_level", ""),
            "cpc": vdata.get("cpc", 0.0),
            "opportunity_score": opp_score,
        })

    # 기회 점수 내림차순 정렬
    scored.sort(key=lambda x: x["opportunity_score"], reverse=True)

    # 5. 카테고리별 통계
    category_stats: dict[str, dict] = {}
    for item in scored:
        cat = item["category"]
        if cat not in category_stats:
            category_stats[cat] = {"count": 0, "avg_score": 0.0, "top_keyword": ""}
        category_stats[cat]["count"] += 1

    for cat in category_stats:
        cat_items = [s for s in scored if s["category"] == cat]
        if cat_items:
            category_stats[cat]["avg_score"] = round(
                sum(s["opportunity_score"] for s in cat_items) / len(cat_items), 1
            )
            category_stats[cat]["top_keyword"] = cat_items[0]["keyword"]

    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "category_filter": category_filter,
        "total_keywords_analyzed": len(scored),
        "category_stats": category_stats,
        "top_opportunities": scored[:top_n],
        "all_scored": scored,
    }

    return report


# ------------------------------------------------------------------
# CLI 진입점
# ------------------------------------------------------------------

def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="opportunity_scorer.py",
        description="target-keywords.md 전체 키워드 기회 점수 산출 도구",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
카테고리 슬러그:
  case-conceptualization, counseling-skills, training, career,
  operations, self-care, trends, tech-blog

예시:
  python opportunity_scorer.py
  python opportunity_scorer.py --top 20
  python opportunity_scorer.py --category case-conceptualization
  python opportunity_scorer.py --top 30 --output priorities.json
        """,
    )
    parser.add_argument(
        "--top",
        type=int,
        default=20,
        metavar="N",
        help="출력할 상위 기회 키워드 수 (기본: 20)",
    )
    parser.add_argument(
        "--category",
        metavar="SLUG",
        help="특정 카테고리만 분석 (예: case-conceptualization)",
    )
    parser.add_argument(
        "--output",
        metavar="FILE",
        help="결과를 저장할 JSON 파일 경로",
    )
    return parser


def main() -> None:
    parser = _build_parser()
    args = parser.parse_args()

    try:
        report = score_all_keywords(
            category_filter=args.category,
            top_n=args.top,
        )
    except DataForSEOError as e:
        print(f"오류: {e}", file=sys.stderr)
        sys.exit(1)

    output_json = json.dumps(report, ensure_ascii=False, indent=2)

    if args.output:
        out_path = Path(args.output)
        out_path.write_text(output_json, encoding="utf-8")
        print(f"\n결과 저장 완료: {out_path}")
    else:
        # 요약만 콘솔 출력
        print(f"\n=== 키워드 기회 점수 분석 결과 ===")
        print(f"분석 키워드: {report['total_keywords_analyzed']}개")
        if args.category:
            print(f"카테고리 필터: {args.category}")

        print(f"\n카테고리별 평균 기회 점수:")
        for cat, stats in sorted(
            report.get("category_stats", {}).items(),
            key=lambda x: x[1].get("avg_score", 0),
            reverse=True,
        ):
            print(
                f"  {cat}: 평균 {stats['avg_score']:.0f}점 "
                f"({stats['count']}개, 최상위: {stats['top_keyword']})"
            )

        print(f"\n상위 {args.top}개 기회 키워드:")
        for i, opp in enumerate(report.get("top_opportunities", []), 1):
            print(
                f"  {i:2d}. [{opp['opportunity_score']:.0f}점] {opp['keyword']} "
                f"({opp['category']}) — "
                f"검색량: {opp['volume']:,}, 경쟁도: {opp['competition']:.2f}"
            )

        print(f"\n전체 JSON을 파일로 저장하려면 --output 옵션을 사용하세요.")


if __name__ == "__main__":
    main()
