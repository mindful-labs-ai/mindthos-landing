#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
dataforseo_client.py — DataForSEO API 클라이언트

DataForSEO REST API에 대한 재사용 가능한 Python 클라이언트입니다.
표준 라이브러리(urllib.request)만 사용합니다.

사용법:
    from dataforseo_client import DataForSEOClient
    client = DataForSEOClient()
    result = client.get_search_volume(["번아웃", "우울증"])

    또는 직접 실행하여 연결 테스트:
    python dataforseo_client.py
"""

import json
import os
import ssl
import sys
import time
import base64
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional

# macOS Python SSL 인증서 문제 해결
_SSL_CONTEXT = ssl.create_default_context()
try:
    import certifi
    _SSL_CONTEXT.load_verify_locations(certifi.where())
except ImportError:
    # certifi가 없으면 시스템 인증서 사용 시도, 실패 시 검증 비활성화
    try:
        _SSL_CONTEXT.load_default_certs()
    except Exception:
        _SSL_CONTEXT.check_hostname = False
        _SSL_CONTEXT.verify_mode = ssl.CERT_NONE


# 프로젝트 루트: 이 파일은 scripts/seo-analysis/ 안에 있음.
# 마음토스는 Next.js 앱이 web/ 아래에 있고 .env.local 도 web/.env.local 에 위치.
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
_ENV_FILE = _PROJECT_ROOT / "web" / ".env.local"

BASE_URL = "https://api.dataforseo.com"


def _load_env_local(env_path: Path) -> dict[str, str]:
    """
    .env.local 파일을 수동으로 파싱하여 {KEY: VALUE} dict 반환.
    주석(#), 빈 줄, 따옴표를 처리합니다.
    """
    env_vars: dict[str, str] = {}
    if not env_path.exists():
        return env_vars
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip()
            # 따옴표 제거 (큰따옴표 또는 작은따옴표)
            if len(value) >= 2 and value[0] in ('"', "'") and value[-1] == value[0]:
                value = value[1:-1]
            env_vars[key] = value
    return env_vars


class DataForSEOError(Exception):
    """DataForSEO API 에러"""
    pass


class DataForSEOClient:
    """
    DataForSEO REST API 클라이언트.

    인증 정보 우선순위:
    1. 생성자 파라미터 (login, password)
    2. 환경 변수 (DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD)
    3. 프로젝트 루트의 .env.local 파일
    """

    def __init__(self, login: Optional[str] = None, password: Optional[str] = None):
        env = _load_env_local(_ENV_FILE)

        self.login = (
            login
            or os.environ.get("DATAFORSEO_LOGIN")
            or env.get("DATAFORSEO_LOGIN")
        )
        self.password = (
            password
            or os.environ.get("DATAFORSEO_PASSWORD")
            or env.get("DATAFORSEO_PASSWORD")
        )

        if not self.login or not self.password:
            raise DataForSEOError(
                "DataForSEO 인증 정보를 찾을 수 없습니다.\n"
                ".env.local 파일에 DATAFORSEO_LOGIN과 DATAFORSEO_PASSWORD를 설정하거나 "
                "환경 변수로 제공해 주세요."
            )

        credentials = f"{self.login}:{self.password}"
        encoded = base64.b64encode(credentials.encode("utf-8")).decode("utf-8")
        self._auth_header = f"Basic {encoded}"

    def _request(self, endpoint: str, payload: list) -> dict:
        """
        DataForSEO API에 POST 요청을 보냅니다.

        Args:
            endpoint: API 엔드포인트 (예: /v3/keywords_data/google/search_volume/live)
            payload: 요청 본문 (JSON 직렬화 가능한 list)

        Returns:
            API JSON 응답 dict

        Raises:
            DataForSEOError: API 오류 또는 네트워크 오류 발생 시
        """
        url = BASE_URL + endpoint
        body = json.dumps(payload).encode("utf-8")

        req = urllib.request.Request(
            url=url,
            data=body,
            headers={
                "Authorization": self._auth_header,
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=30, context=_SSL_CONTEXT) as resp:
                raw = resp.read()
                return json.loads(raw.decode("utf-8"))
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8", errors="replace")
            try:
                err_data = json.loads(raw)
                status_message = err_data.get("status_message", raw)
            except json.JSONDecodeError:
                status_message = raw
            raise DataForSEOError(
                f"HTTP {e.code} 오류: {status_message}"
            ) from e
        except urllib.error.URLError as e:
            raise DataForSEOError(
                f"네트워크 오류: {e.reason}\n인터넷 연결 또는 API 주소를 확인해 주세요."
            ) from e

    def _extract_results(self, response: dict, endpoint_label: str) -> list:
        """
        API 응답에서 tasks[0].result 배열을 추출합니다.
        오류 상태 코드를 감지하여 예외를 발생시킵니다.
        """
        tasks = response.get("tasks", [])
        if not tasks:
            raise DataForSEOError(f"[{endpoint_label}] API 응답에 tasks가 없습니다.")

        task = tasks[0]
        status_code = task.get("status_code", 0)
        status_message = task.get("status_message", "")

        if status_code not in (20000, 20100):
            raise DataForSEOError(
                f"[{endpoint_label}] API 작업 실패 (코드 {status_code}): {status_message}"
            )

        result = task.get("result") or []
        return result

    # ------------------------------------------------------------------
    # 공개 API 메서드
    # ------------------------------------------------------------------

    def get_search_volume(
        self,
        keywords: list[str],
        location_code: int = 2410,
        language_code: str = "ko",
    ) -> dict[str, dict]:
        """
        키워드 목록의 월간 검색량을 조회합니다.

        DataForSEO 엔드포인트:
            POST /v3/keywords_data/google/search_volume/live

        Args:
            keywords: 검색량을 조회할 키워드 목록 (최대 700개)
            location_code: 국가 코드 (기본값: 2410 = 대한민국)
            language_code: 언어 코드 (기본값: "ko")

        Returns:
            {keyword: {"volume": int, "competition": float, "cpc": float, "trend": list}} dict
        """
        if not keywords:
            return {}

        # API는 요청당 최대 700개 키워드를 허용
        chunks = [keywords[i:i + 700] for i in range(0, len(keywords), 700)]
        all_results: dict[str, dict] = {}

        for idx, chunk in enumerate(chunks):
            if idx > 0:
                time.sleep(0.5)

            payload = [
                {
                    "keywords": chunk,
                    "location_code": location_code,
                    "language_code": language_code,
                }
            ]
            response = self._request(
                "/v3/keywords_data/google/search_volume/live", payload
            )
            results = self._extract_results(response, "search_volume")

            for item in results:
                kw = item.get("keyword", "")
                monthly_searches = item.get("monthly_searches") or []
                # 최신 월 검색량을 volume으로 사용
                volume = 0
                if monthly_searches:
                    volume = monthly_searches[0].get("search_volume", 0) or 0

                all_results[kw] = {
                    "volume": volume,
                    "competition": item.get("competition") or 0.0,
                    "cpc": item.get("cpc") or 0.0,
                    "competition_level": item.get("competition_level", ""),
                    "trend": [
                        m.get("search_volume", 0) or 0
                        for m in (monthly_searches or [])
                    ],
                }

        return all_results

    def get_search_volume_with_fallback(
        self,
        keywords: list[str],
        location_code: int = 2410,
        language_code: str = "ko",
        max_serp_fallback: int = 10,
    ) -> dict[str, dict]:
        """
        검색량 조회 + null 키워드는 SERP 분석으로 간접 추정.

        Google Ads 정책으로 건강/의료 키워드(우울증, 심리상담 등)의
        검색량이 null로 반환될 수 있습니다. 이 경우 SERP 결과 수와
        경쟁 구도를 분석하여 검색량을 간접 추정합니다.

        Args:
            max_serp_fallback: SERP 폴백 최대 횟수 (기본 10).
                나머지 null 키워드는 기본 추정값(5,000)으로 처리.
        """
        # 1단계: 정상 검색량 조회
        results = self.get_search_volume(keywords, location_code, language_code)

        # 2단계: null/0인 키워드를 SERP 폴백
        null_keywords = [kw for kw, data in results.items() if data.get("volume", 0) == 0]

        if not null_keywords:
            return results

        # SERP 폴백 대상 제한 (비용/시간 절약)
        serp_targets = null_keywords[:max_serp_fallback]
        skip_targets = null_keywords[max_serp_fallback:]

        for kw in serp_targets:
            time.sleep(0.3)
            try:
                serp = self.get_serp_competitors(kw, location_code, language_code)
                organic_count = len(serp)

                # 도메인 분석으로 경쟁도 추정
                high_authority = 0
                for item in serp:
                    domain = item.get("domain", "")
                    if any(d in domain for d in [".go.kr", ".ac.kr", "naver.com", "health.kr", ".or.kr"]):
                        high_authority += 1

                # 검색량 간접 추정
                if organic_count >= 10:
                    estimated_volume = 10000
                elif organic_count >= 7:
                    estimated_volume = 5000
                elif organic_count >= 4:
                    estimated_volume = 1000
                else:
                    estimated_volume = 500

                competition = round(high_authority / max(organic_count, 1), 2)

                results[kw] = {
                    "volume": estimated_volume,
                    "competition": competition,
                    "cpc": 0.0,
                    "competition_level": "HIGH" if competition > 0.5 else "MEDIUM" if competition > 0.2 else "LOW",
                    "trend": [],
                    "estimated": True,
                    "serp_organic_count": organic_count,
                    "serp_high_authority": high_authority,
                }
            except DataForSEOError:
                results[kw]["estimated"] = True

        # SERP 폴백 한도 초과 키워드는 기본 추정값 부여
        for kw in skip_targets:
            results[kw] = {
                "volume": 5000,
                "competition": 0.3,
                "cpc": 0.0,
                "competition_level": "MEDIUM",
                "trend": [],
                "estimated": True,
                "serp_skipped": True,
            }

        return results

    def get_keyword_suggestions(
        self,
        seed_keyword: str,
        location_code: int = 2410,
        language_code: str = "ko",
        limit: int = 50,
    ) -> list[dict]:
        """
        시드 키워드 기반 관련 키워드 목록을 조회합니다.

        DataForSEO 엔드포인트:
            POST /v3/keywords_data/google/keywords_for_keywords/live

        Args:
            seed_keyword: 시드 키워드
            location_code: 국가 코드 (기본값: 2410 = 대한민국)
            language_code: 언어 코드 (기본값: "ko")
            limit: 반환할 최대 키워드 수 (기본값: 50)

        Returns:
            [{"keyword": str, "volume": int, "competition": float, "cpc": float}, ...] 목록
        """
        payload = [
            {
                "keywords": [seed_keyword],
                "location_code": location_code,
                "language_code": language_code,
                "include_seed_keyword": True,
                "limit": limit,
            }
        ]
        response = self._request(
            "/v3/keywords_data/google/keywords_for_keywords/live", payload
        )
        results = self._extract_results(response, "keyword_suggestions")

        suggestions = []
        for item in results[:limit]:
            monthly_searches = item.get("monthly_searches") or []
            volume = 0
            if monthly_searches:
                volume = monthly_searches[0].get("search_volume", 0) or 0

            suggestions.append(
                {
                    "keyword": item.get("keyword", ""),
                    "volume": volume,
                    "competition": item.get("competition") or 0.0,
                    "cpc": item.get("cpc") or 0.0,
                    "competition_level": item.get("competition_level", ""),
                }
            )

        return suggestions

    def get_serp_competitors(
        self,
        keyword: str,
        location_code: int = 2410,
        language_code: str = "ko",
    ) -> list[dict]:
        """
        키워드의 구글 검색 결과 상위 10개 URL을 조회합니다.

        DataForSEO 엔드포인트:
            POST /v3/serp/google/organic/live/regular

        Args:
            keyword: 분석할 키워드
            location_code: 국가 코드 (기본값: 2410 = 대한민국)
            language_code: 언어 코드 (기본값: "ko")

        Returns:
            [{"url": str, "title": str, "position": int, "snippet": str}, ...] 목록 (상위 10개)
        """
        payload = [
            {
                "keyword": keyword,
                "location_code": location_code,
                "language_code": language_code,
                "depth": 10,
            }
        ]
        response = self._request(
            "/v3/serp/google/organic/live/regular", payload
        )
        results = self._extract_results(response, "serp_competitors")

        competitors = []
        for result_block in results:
            items = result_block.get("items") or []
            for item in items:
                if item.get("type") != "organic":
                    continue
                competitors.append(
                    {
                        "url": item.get("url", ""),
                        "title": item.get("title", ""),
                        "position": item.get("rank_absolute", 0),
                        "snippet": item.get("description", ""),
                        "domain": item.get("domain", ""),
                    }
                )

        return competitors[:10]

    def get_keyword_difficulty(
        self,
        keywords: list[str],
        location_code: int = 2410,
        language_code: str = "ko",
    ) -> dict[str, dict]:
        """
        키워드 난이도(경쟁 수준)를 조회합니다.
        search_volume 응답의 competition_level 필드를 활용합니다.

        Args:
            keywords: 난이도를 조회할 키워드 목록
            location_code: 국가 코드 (기본값: 2410 = 대한민국)
            language_code: 언어 코드 (기본값: "ko")

        Returns:
            {keyword: {"difficulty_label": str, "competition": float}} dict
        """
        volume_data = self.get_search_volume(keywords, location_code, language_code)

        difficulty_map = {
            "LOW": "낮음",
            "MEDIUM": "중간",
            "HIGH": "높음",
            "": "알 수 없음",
        }

        return {
            kw: {
                "difficulty_label": difficulty_map.get(
                    data.get("competition_level", "").upper(), "알 수 없음"
                ),
                "competition": data.get("competition", 0.0),
            }
            for kw, data in volume_data.items()
        }

    def test_connection(self) -> bool:
        """
        간단한 API 호출로 연결 상태를 테스트합니다.

        Returns:
            연결 성공 시 True
        """
        try:
            result = self.get_search_volume(["심리상담"])
            return bool(result)
        except DataForSEOError:
            raise


# ------------------------------------------------------------------
# 직접 실행 시 연결 테스트
# ------------------------------------------------------------------

if __name__ == "__main__":
    print("DataForSEO API 연결 테스트 중...")
    try:
        client = DataForSEOClient()
        print(f"  인증 정보 로드 성공: {client.login}")
        print("  테스트 키워드 '심리상담' 검색량 조회 중...")
        result = client.get_search_volume(["심리상담"])
        if result:
            kw_data = result.get("심리상담", {})
            print(f"\n연결 성공!")
            print(f"  키워드: 심리상담")
            print(f"  월간 검색량: {kw_data.get('volume', 'N/A'):,}")
            print(f"  경쟁도: {kw_data.get('competition', 'N/A')}")
            print(f"  CPC: {kw_data.get('cpc', 'N/A')}")
            print(f"  경쟁 수준: {kw_data.get('competition_level', 'N/A')}")
        else:
            print("연결 성공 (결과 없음)")
        sys.exit(0)
    except DataForSEOError as e:
        print(f"\n연결 실패: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"\n예기치 않은 오류: {e}", file=sys.stderr)
        sys.exit(1)
