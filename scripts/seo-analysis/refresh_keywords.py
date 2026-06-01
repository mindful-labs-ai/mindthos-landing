#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
refresh_keywords.py — target-keywords.md 실제 검색량 데이터로 갱신

context/target-keywords.md의 키워드 테이블에 있는 "높음/중간/낮음" 추정치를
DataForSEO에서 조회한 실제 월간 검색량, 경쟁도, CPC 데이터로 교체합니다.
파일 구조(카테고리, 설명, 롱테일 섹션 등)는 그대로 유지됩니다.

사용법:
    python refresh_keywords.py
    python refresh_keywords.py --dry-run
    python refresh_keywords.py --help
"""

import argparse
import re
import sys
import time
from pathlib import Path
from typing import Optional

# 프로젝트 루트 설정
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
_KEYWORDS_FILE = _PROJECT_ROOT / "context" / "target-keywords.md"

sys.path.insert(0, str(Path(__file__).resolve().parent))
from dataforseo_client import DataForSEOClient, DataForSEOError


# ------------------------------------------------------------------
# 테이블 행 파싱 / 재생성 헬퍼
# ------------------------------------------------------------------

# 기존 파일의 테이블 헤더 패턴
_TABLE_HEADER_PATTERN = re.compile(
    r"^\|\s*키워드\s*\|.*\|"
)

# 테이블 구분자 행 패턴
_TABLE_DIVIDER_PATTERN = re.compile(r"^\|[-:|\s]+\|$")

# 키워드 테이블 행 패턴 ("|키워드|추정치|의도|경쟁도|" 형식)
_TABLE_ROW_PATTERN = re.compile(r"^\|([^|]+)\|([^|]*)\|([^|]*)\|([^|]*)\|")


def _format_volume(volume: int) -> str:
    """검색량을 읽기 좋은 형식으로 변환합니다."""
    if volume >= 10000:
        return f"{volume // 1000}만+"
    elif volume >= 1000:
        return f"{volume:,}"
    elif volume > 0:
        return str(volume)
    else:
        return "데이터 없음"


def _format_competition(competition: float) -> str:
    """경쟁도를 소수점 2자리 형식으로 변환합니다."""
    return f"{competition:.2f}"


def _format_cpc(cpc: float) -> str:
    """CPC를 원화 형식으로 변환합니다."""
    if cpc > 0:
        return f"₩{int(cpc):,}"
    return "-"


def _rebuild_table_row(cells: list[str], volume_data: dict) -> str:
    """
    기존 테이블 행을 실제 DataForSEO 데이터로 재구성합니다.

    Args:
        cells: 기존 셀 목록 [키워드, 추정치, 의도, 경쟁도]
        volume_data: {keyword: {volume, competition, cpc, ...}} dict

    Returns:
        새 마크다운 테이블 행 문자열
    """
    kw = cells[0].strip()
    intent = cells[2].strip() if len(cells) > 2 else ""
    original_competition = cells[3].strip() if len(cells) > 3 else ""

    vdata = volume_data.get(kw, {})
    vol = vdata.get("volume", 0)
    comp = vdata.get("competition", None)
    cpc = vdata.get("cpc", 0.0)
    comp_level = vdata.get("competition_level", "")

    if vdata:
        volume_str = _format_volume(vol)
        if comp is not None:
            competition_str = _format_competition(comp)
            if comp_level:
                competition_str += f" ({comp_level})"
        else:
            competition_str = original_competition
        cpc_str = _format_cpc(cpc)
    else:
        # 데이터 없는 경우 원본 유지
        volume_str = cells[1].strip() if len(cells) > 1 else ""
        competition_str = original_competition
        cpc_str = "-"

    return f"| {kw} | {volume_str} | {intent} | {competition_str} | {cpc_str} |"


# ------------------------------------------------------------------
# 메인 파싱 및 갱신 함수
# ------------------------------------------------------------------

def _extract_table_keywords(text: str) -> list[str]:
    """파일에서 모든 테이블 키워드를 추출합니다."""
    keywords = []
    seen = set()

    for line in text.splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            continue
        if _TABLE_DIVIDER_PATTERN.match(stripped):
            continue
        if _TABLE_HEADER_PATTERN.match(stripped):
            continue

        cells = [c for c in stripped.split("|") if c.strip()]
        if not cells:
            continue

        kw = cells[0].strip()
        # 헤더/구분자/메타 테이블 셀 제외
        if kw in ("키워드", "의도 유형", "시기", "주목 키워드", "데이터 소스", "항목") or kw.startswith("-"):
            continue
        if not kw:
            continue
        # 검색 의도 분류 테이블, 시즌 캘린더 등 비-키워드 테이블 셀 제외
        skip_prefixes = ("정보형", "상업형", "거래형", "탐색형", "3월", "5-6월", "9월", "11-12월", "연중")
        if any(kw.startswith(p) for p in skip_prefixes):
            continue
        # 괄호로 시작하거나 영문 설명이 포함된 셀 제외 (예: "Informational")
        if "(" in kw and ")" in kw and any(c.isascii() and c.isalpha() for c in kw):
            continue

        if kw not in seen:
            seen.add(kw)
            keywords.append(kw)

    return keywords


def _rewrite_file(text: str, volume_data: dict) -> str:
    """
    파일 텍스트를 줄 단위로 재처리하여 테이블 데이터를 갱신합니다.
    비-테이블 섹션(롱테일, 설명 등)은 원본 그대로 유지합니다.

    새 테이블 헤더는 CPC 컬럼을 추가합니다:
    | 키워드 | 월간 검색량 | 검색 의도 | 경쟁도 | CPC |
    """
    lines = text.splitlines(keepends=True)
    result = []
    in_keyword_table = False

    for line in lines:
        stripped = line.rstrip("\n").rstrip("\r")

        # 테이블 헤더 감지 및 교체
        if _TABLE_HEADER_PATTERN.match(stripped.strip()):
            in_keyword_table = True
            # 헤더를 실제 데이터 컬럼으로 교체
            result.append("| 키워드 | 월간 검색량 | 검색 의도 | 경쟁도 | CPC |\n")
            continue

        # 구분자 행 업데이트
        if in_keyword_table and _TABLE_DIVIDER_PATTERN.match(stripped.strip()):
            result.append("|-------|------------|---------|------|-----|\n")
            continue

        # 테이블 데이터 행 처리
        if in_keyword_table and stripped.strip().startswith("|"):
            cells = [c for c in stripped.strip().split("|") if c.strip() != ""]
            if not cells:
                in_keyword_table = False
                result.append(line if line.endswith("\n") else line + "\n")
                continue

            kw = cells[0].strip()
            # 헤더 행이 또 나왔으면 skip
            if kw in ("키워드", "의도 유형", "시기"):
                result.append(line if line.endswith("\n") else line + "\n")
                continue

            new_row = _rebuild_table_row(cells, volume_data)
            result.append(new_row + "\n")
            continue

        # 테이블 이외의 행: 테이블 종료 감지
        if in_keyword_table and not stripped.strip().startswith("|"):
            in_keyword_table = False

        result.append(line if line.endswith("\n") else line + "\n")

    return "".join(result)


def refresh_keywords(
    dry_run: bool = False,
    client: Optional[DataForSEOClient] = None,
) -> dict:
    """
    target-keywords.md를 실제 DataForSEO 데이터로 갱신합니다.

    Args:
        dry_run: True이면 파일을 수정하지 않고 변경 내용만 출력
        client: 기존 DataForSEOClient 인스턴스

    Returns:
        {"updated": int, "skipped": int, "keywords": [...]} 결과 요약 dict
    """
    if client is None:
        client = DataForSEOClient()

    if not _KEYWORDS_FILE.exists():
        print(f"오류: {_KEYWORDS_FILE} 파일을 찾을 수 없습니다.", file=sys.stderr)
        sys.exit(1)

    print(f"파일 로드 중: {_KEYWORDS_FILE}")
    original_text = _KEYWORDS_FILE.read_text(encoding="utf-8")

    # 1. 모든 키워드 추출
    keywords = _extract_table_keywords(original_text)
    print(f"  {len(keywords)}개 키워드 발견")

    if not keywords:
        print("갱신할 키워드가 없습니다.")
        return {"updated": 0, "skipped": 0, "keywords": []}

    # 2. 배치 검색량 조회
    batch_size = 700
    batches = [keywords[i:i + batch_size] for i in range(0, len(keywords), batch_size)]
    print(f"DataForSEO 검색량 조회 중 ({len(keywords)}개, {len(batches)}배치)...")

    volume_data: dict[str, dict] = {}
    for idx, batch in enumerate(batches):
        if idx > 0:
            print(f"  배치 {idx + 1}/{len(batches)} 처리 중...")
            time.sleep(0.5)
        batch_result = client.get_search_volume_with_fallback(batch)
        volume_data.update(batch_result)

    print(f"  {len(volume_data)}개 키워드 데이터 수신")

    # 3. 파일 재작성
    updated_text = _rewrite_file(original_text, volume_data)

    # 4. 변경 사항 집계
    updated_count = sum(1 for kw in keywords if kw in volume_data and volume_data[kw].get("volume", 0) > 0)
    skipped_count = len(keywords) - updated_count

    if dry_run:
        print("\n[DRY RUN] 변경 미적용 — 아래 내용이 반영될 예정입니다:\n")
        # 변경된 줄만 diff 출력
        orig_lines = original_text.splitlines()
        new_lines = updated_text.splitlines()
        changes_shown = 0
        for i, (orig, new) in enumerate(zip(orig_lines, new_lines), 1):
            if orig != new:
                print(f"  라인 {i}:")
                print(f"    이전: {orig}")
                print(f"    이후: {new}")
                changes_shown += 1
                if changes_shown >= 10:
                    remaining = sum(1 for o, n in zip(orig_lines, new_lines) if o != n) - changes_shown
                    if remaining > 0:
                        print(f"  ... 외 {remaining}개 라인 변경")
                    break
        print(f"\n총 {updated_count}개 키워드 데이터 갱신 예정, {skipped_count}개 데이터 없음")
    else:
        _KEYWORDS_FILE.write_text(updated_text, encoding="utf-8")
        print(f"\n파일 갱신 완료: {_KEYWORDS_FILE}")
        print(f"  갱신된 키워드: {updated_count}개")
        print(f"  데이터 없음: {skipped_count}개")

    return {
        "updated": updated_count,
        "skipped": skipped_count,
        "keywords": [
            {
                "keyword": kw,
                "volume": volume_data.get(kw, {}).get("volume", 0),
                "competition": volume_data.get(kw, {}).get("competition", 0.0),
                "cpc": volume_data.get(kw, {}).get("cpc", 0.0),
                "competition_level": volume_data.get(kw, {}).get("competition_level", ""),
                "has_data": kw in volume_data,
            }
            for kw in keywords
        ],
    }


# ------------------------------------------------------------------
# CLI 진입점
# ------------------------------------------------------------------

def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="refresh_keywords.py",
        description="target-keywords.md를 DataForSEO 실제 데이터로 갱신",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
이 스크립트는 context/target-keywords.md의 키워드 테이블에서
"높음/중간/낮음" 추정치를 실제 DataForSEO 데이터로 교체합니다.

갱신되는 컬럼:
  - 월간 검색량: 실제 월간 검색량 숫자
  - 경쟁도: 0.00-1.00 소수점 + 경쟁 수준 (LOW/MEDIUM/HIGH)
  - CPC: 클릭당 비용 (원화)

예시:
  python refresh_keywords.py --dry-run    # 변경 미리보기
  python refresh_keywords.py              # 실제 파일 갱신
        """,
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="실제 파일 수정 없이 변경 내용만 출력",
    )
    return parser


def main() -> None:
    parser = _build_parser()
    args = parser.parse_args()

    try:
        result = refresh_keywords(dry_run=args.dry_run)
    except DataForSEOError as e:
        print(f"오류: {e}", file=sys.stderr)
        sys.exit(1)

    if not args.dry_run:
        print("\n상위 10개 갱신 결과:")
        for item in result.get("keywords", [])[:10]:
            status = "갱신" if item["has_data"] else "데이터 없음"
            vol = item.get("volume", 0)
            print(
                f"  [{status}] {item['keyword']}: "
                f"검색량 {vol:,}, 경쟁도 {item['competition']:.2f}"
            )


if __name__ == "__main__":
    main()
