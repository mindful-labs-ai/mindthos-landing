#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
keyword_research.py — 키워드 리서치 CLI 도구

DataForSEO API를 사용하여 특정 토픽의 키워드 데이터를 수집하고
기회 점수를 산출합니다.

사용법:
    python keyword_research.py "번아웃"
    python keyword_research.py "번아웃" --expand
    python keyword_research.py "번아웃" --serp
    python keyword_research.py "번아웃" --expand --serp --output report.json
    python keyword_research.py --help
"""

import argparse
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# 프로젝트 루트 설정 (scripts/seo-analysis/ → 프로젝트 루트)
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
_KEYWORDS_FILE = _PROJECT_ROOT / "context" / "target-keywords.md"

# 로컬 모듈 import
sys.path.insert(0, str(Path(__file__).resolve().parent))
from dataforseo_client import DataForSEOClient, DataForSEOError


# ------------------------------------------------------------------
# 검색 의도 분류
# ------------------------------------------------------------------

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
    """검색 의도 문자열에서 점수를 반환합니다."""
    for key, score in _INTENT_SCORES.items():
        if key in intent_text:
            return score
    return _DEFAULT_INTENT_SCORE


# ------------------------------------------------------------------
# target-keywords.md 파싱
# ------------------------------------------------------------------

def _parse_target_keywords(topic: str) -> list[dict]:
    """
    context/target-keywords.md에서 topic과 관련된 키워드를 추출합니다.
    테이블 행에서 키워드, 검색 의도를 파싱합니다.

    Args:
        topic: 검색할 토픽 문자열 (예: "번아웃")

    Returns:
        [{"keyword": str, "intent": str, "intent_score": int}, ...] 목록
    """
    if not _KEYWORDS_FILE.exists():
        print(f"경고: {_KEYWORDS_FILE} 파일을 찾을 수 없습니다.", file=sys.stderr)
        return []

    import re
    text = _KEYWORDS_FILE.read_text(encoding="utf-8")
    keywords = []
    seen = set()
    in_category_section = False  # 카테고리 헤더를 만나기 전 메타 테이블 제외
    category_pattern = re.compile(r"^###\s+\d+\.\s+([\w\-]+)")
    longtail_pattern = re.compile(r'^-\s+"([^"]+)"')

    for raw_line in text.splitlines():
        line = raw_line.strip()

        # 카테고리 헤더 감지
        if category_pattern.match(line):
            in_category_section = True
            continue

        if not in_category_section:
            continue

        # 롱테일 키워드 (- "..." 형식)
        m = longtail_pattern.match(line)
        if m:
            kw = m.group(1)
            if kw not in seen:
                seen.add(kw)
                keywords.append({
                    "keyword": kw,
                    "intent": "정보형",
                    "intent_score": _DEFAULT_INTENT_SCORE,
                })
            continue

        # 테이블 행
        if not line.startswith("|") or line.startswith("|---"):
            continue
        cells = [c.strip() for c in line.split("|") if c.strip()]
        if len(cells) < 2:
            continue

        kw = cells[0]
        intent = cells[2] if len(cells) > 2 else "정보형"

        # 헤더 행 제외
        if kw in ("키워드", "의도 유형", "시기", "키워드 클러스터", "주목 키워드"):
            continue
        if not kw or kw.startswith("-"):
            continue

        if kw not in seen:
            seen.add(kw)
            keywords.append({
                "keyword": kw,
                "intent": intent,
                "intent_score": _get_intent_score(intent),
            })

    # topic 관련 키워드 필터링
    topic_lower = topic.lower()
    related = [k for k in keywords if topic_lower in k["keyword"].lower()]

    # 관련 키워드가 없으면 전체 반환 (최대 30개)
    if not related:
        return keywords[:30]

    return related


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
    기회 점수를 계산합니다 (0-100).

    가중치:
        - 검색량: 35% (전체 검색량 대비 정규화)
        - 경쟁도 역수: 30% (낮은 경쟁 = 높은 점수)
        - 검색 의도: 20%
        - 트렌드: 15% (최근 3개월 평균 vs 이전 3개월 평균)
    """
    # 검색량 점수 (0-100 정규화)
    max_vol = max(all_volumes) if all_volumes else 1
    volume_score = min(100.0, (volume / max_vol) * 100) if max_vol > 0 else 0.0

    # 경쟁도 역수 점수 (competition은 0-1)
    competition_score = (1.0 - float(competition)) * 100.0

    # 트렌드 점수
    trend_score = 50.0  # 기본값
    if trend and len(trend) >= 6:
        recent = sum(trend[:3]) / 3
        older = sum(trend[3:6]) / 3
        if older > 0:
            ratio = recent / older
            # 상승 트렌드 = 높은 점수
            trend_score = min(100.0, ratio * 50.0)

    score = (
        volume_score * 0.35
        + competition_score * 0.30
        + float(intent_score) * 0.20
        + trend_score * 0.15
    )
    return round(score, 1)


# ------------------------------------------------------------------
# 메인 리서치 함수
# ------------------------------------------------------------------

def research_keyword(
    topic: str,
    expand: bool = False,
    serp: bool = False,
    client: Optional[DataForSEOClient] = None,
) -> dict:
    """
    특정 토픽에 대한 키워드 리서치를 수행합니다.

    Args:
        topic: 리서치할 토픽 (예: "번아웃")
        expand: True이면 DataForSEO 키워드 제안도 조회
        serp: True이면 SERP 경쟁사 분석도 수행
        client: 기존 DataForSEOClient 인스턴스 (없으면 새로 생성)

    Returns:
        구조화된 리포트 dict
    """
    if client is None:
        client = DataForSEOClient()

    print(f"토픽 '{topic}' 리서치 시작...")

    # 1. target-keywords.md에서 관련 키워드 수집
    print("  context/target-keywords.md에서 관련 키워드 로드 중...")
    related_meta = _parse_target_keywords(topic)
    all_keywords = [k["keyword"] for k in related_meta]

    # 시드 키워드가 목록에 없으면 추가
    if topic not in all_keywords:
        all_keywords.insert(0, topic)

    print(f"  총 {len(all_keywords)}개 키워드 발견")

    # 2. DataForSEO 검색량 조회
    print(f"  DataForSEO 검색량 조회 중 ({len(all_keywords)}개)...")
    volume_data = client.get_search_volume_with_fallback(all_keywords)

    # 3. 시드 키워드 데이터
    seed_volume = volume_data.get(topic, {})
    seed_keywords = [
        {
            "keyword": topic,
            "volume": seed_volume.get("volume", 0),
            "competition": seed_volume.get("competition", 0.0),
            "cpc": seed_volume.get("cpc", 0.0),
            "competition_level": seed_volume.get("competition_level", ""),
            "difficulty": seed_volume.get("competition_level", "알 수 없음"),
        }
    ]

    # 4. 관련 키워드 + 볼륨 결합
    all_vols = [v.get("volume", 0) for v in volume_data.values()]
    related_keywords = []
    for meta in related_meta:
        kw = meta["keyword"]
        if kw == topic:
            continue
        vdata = volume_data.get(kw, {})
        related_keywords.append({
            "keyword": kw,
            "volume": vdata.get("volume", 0),
            "competition": vdata.get("competition", 0.0),
            "cpc": vdata.get("cpc", 0.0),
            "intent": meta.get("intent", "정보형"),
            "competition_level": vdata.get("competition_level", ""),
        })

    # 5. 키워드 제안 (--expand)
    suggested_keywords = []
    if expand:
        print(f"  DataForSEO 키워드 제안 조회 중 (시드: '{topic}')...")
        time.sleep(0.5)
        try:
            suggestions = client.get_keyword_suggestions(topic, limit=50)
            # 시드 키워드 자체만 반환된 경우 제외
            suggested_keywords = [s for s in suggestions if s.get("keyword", "").strip() != topic.strip()]
            print(f"  {len(suggested_keywords)}개 제안 키워드 수신")
        except DataForSEOError as e:
            print(f"  경고: 키워드 제안 조회 실패 - {e}", file=sys.stderr)

        # 제안 결과가 부족하면 (건강 키워드 등) target-keywords.md 같은 카테고리에서 보충
        if len(suggested_keywords) < 5:
            print(f"  제안 키워드 부족 ({len(suggested_keywords)}개) — target-keywords.md에서 같은 카테고리 키워드 보충 중...")
            try:
                sys.path.insert(0, str(Path(__file__).parent))
                from opportunity_scorer import _parse_all_keywords
                all_kw_meta = _parse_all_keywords()
                # 이미 related_keywords에 있는 키워드 제외
                existing = {r.get("keyword", "") for r in related_keywords}
                existing.add(topic)
                for kw_meta in all_kw_meta:
                    kw = kw_meta["keyword"]
                    if kw in existing:
                        continue
                    # 같은 카테고리이거나 토픽 단어가 포함된 키워드 선별
                    topic_words = set(topic.split())
                    kw_words = set(kw.split())
                    if topic_words & kw_words or any(tw in kw for tw in topic_words):
                        suggested_keywords.append({
                            "keyword": kw,
                            "volume": 0,
                            "competition": 0.0,
                            "cpc": 0.0,
                            "competition_level": "",
                            "source": "target-keywords.md",
                        })
                        existing.add(kw)
                    if len(suggested_keywords) >= 10:
                        break
                # 보충된 키워드의 검색량 조회
                supplement_kws = [s["keyword"] for s in suggested_keywords if s.get("source") == "target-keywords.md"]
                if supplement_kws:
                    vol_data = client.get_search_volume_with_fallback(supplement_kws, max_serp_fallback=3)
                    for s in suggested_keywords:
                        if s.get("source") == "target-keywords.md" and s["keyword"] in vol_data:
                            vd = vol_data[s["keyword"]]
                            s["volume"] = vd.get("volume", 0)
                            s["competition"] = vd.get("competition", 0.0)
                            s["cpc"] = vd.get("cpc", 0.0)
                print(f"  보충 완료: 총 {len(suggested_keywords)}개 제안 키워드")
            except Exception as e:
                print(f"  경고: 보충 키워드 로드 실패 - {e}", file=sys.stderr)

    # 6. SERP 분석 (--serp)
    serp_analysis = {}
    if serp:
        print(f"  SERP 경쟁사 분석 중 (키워드: '{topic}')...")
        time.sleep(0.5)
        try:
            competitors = client.get_serp_competitors(topic)
            # 도메인 목록에서 공통 패턴 파악
            domains = [c.get("domain", "") for c in competitors if c.get("domain")]
            serp_analysis = {
                "top_results": competitors,
                "unique_domains": len(set(domains)),
                "top_domains": list(dict.fromkeys(domains))[:5],
            }
            print(f"  SERP 상위 {len(competitors)}개 결과 수신")
        except DataForSEOError as e:
            print(f"  경고: SERP 분석 실패 - {e}", file=sys.stderr)

    # 7. 기회 키워드 산출
    opportunities = []
    for kw_entry in related_keywords + suggested_keywords:
        kw = kw_entry["keyword"]
        vol = kw_entry.get("volume", 0)
        comp = kw_entry.get("competition", 0.0)
        intent_score = kw_entry.get("intent_score", _DEFAULT_INTENT_SCORE)
        vdata = volume_data.get(kw, kw_entry)
        trend = vdata.get("trend", [])

        opp_score = _compute_opportunity_score(vol, comp, intent_score, trend, all_vols)
        opportunities.append({
            "keyword": kw,
            "volume": vol,
            "competition": comp,
            "cpc": kw_entry.get("cpc", 0.0),
            "intent": kw_entry.get("intent", "정보형"),
            "opportunity_score": opp_score,
        })

    # 기회 점수 내림차순 정렬
    opportunities.sort(key=lambda x: x["opportunity_score"], reverse=True)

    report = {
        "topic": topic,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "seed_keywords": seed_keywords,
        "related_keywords": related_keywords,
        "suggested_keywords": suggested_keywords,
        "serp_analysis": serp_analysis,
        "opportunities": opportunities[:20],
    }

    return report


# ------------------------------------------------------------------
# CLI 진입점
# ------------------------------------------------------------------

def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="keyword_research.py",
        description="DataForSEO 기반 한국어 키워드 리서치 도구",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예시:
  python keyword_research.py "번아웃"
  python keyword_research.py "번아웃" --expand
  python keyword_research.py "심리상담" --expand --serp --output report.json
        """,
    )
    parser.add_argument("topic", help="리서치할 토픽 키워드 (예: '번아웃')")
    parser.add_argument(
        "--expand",
        action="store_true",
        help="DataForSEO 키워드 제안도 함께 조회",
    )
    parser.add_argument(
        "--serp",
        action="store_true",
        help="구글 SERP 경쟁사 분석 수행",
    )
    parser.add_argument(
        "--output",
        metavar="FILE",
        help="결과를 저장할 JSON 파일 경로 (기본: 콘솔 출력)",
    )
    return parser


def main() -> None:
    parser = _build_parser()
    args = parser.parse_args()

    try:
        report = research_keyword(
            topic=args.topic,
            expand=args.expand,
            serp=args.serp,
        )
    except DataForSEOError as e:
        print(f"오류: {e}", file=sys.stderr)
        sys.exit(1)

    output_json = json.dumps(report, ensure_ascii=False, indent=2)

    if args.output:
        out_path = Path(args.output)
        out_path.write_text(output_json, encoding="utf-8")
        print(f"\n리포트 저장 완료: {out_path}")
    else:
        print("\n=== 키워드 리서치 결과 ===\n")
        print(output_json)

    # 요약 출력
    print(f"\n--- 요약 ---")
    print(f"토픽: {report['topic']}")
    print(f"관련 키워드: {len(report['related_keywords'])}개")
    if report["suggested_keywords"]:
        print(f"제안 키워드: {len(report['suggested_keywords'])}개")
    print(f"\n상위 기회 키워드 (최대 5개):")
    for opp in report["opportunities"][:5]:
        print(
            f"  [{opp['opportunity_score']:.0f}점] {opp['keyword']} "
            f"(검색량: {opp['volume']:,}, 경쟁도: {opp['competition']:.2f})"
        )


if __name__ == "__main__":
    main()
