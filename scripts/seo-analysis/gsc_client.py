"""
Google Search Console 연동 클라이언트

블로그 발행 후 검색 성과 분석에 사용합니다.
- 키워드별 노출/클릭/CTR/평균 순위
- URL별 검색 성과
- 인덱싱 상태 확인

설정 방법:
1. Google Cloud Console에서 프로젝트 생성
2. Search Console API 활성화
3. 서비스 계정 생성 → JSON 키 다운로드
4. Search Console에서 서비스 계정 이메일을 사용자로 추가
5. .env.local에 추가:
   GSC_CREDENTIALS_PATH=path/to/service-account.json
   GSC_SITE_URL=https://mindthos.com
"""

import json
import os
import sys
from datetime import datetime, timedelta


def load_env():
    """Load .env.local from web/ (Next.js 앱 디렉토리)."""
    env_path = os.path.join(os.path.dirname(__file__), '..', '..', 'web', '.env.local')
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars


class GSCClient:
    """Google Search Console API 클라이언트 (OAuth2 서비스 계정)"""

    def __init__(self):
        env = load_env()
        self.credentials_path = env.get('GSC_CREDENTIALS_PATH') or os.environ.get('GSC_CREDENTIALS_PATH')
        self.site_url = env.get('GSC_SITE_URL') or os.environ.get('GSC_SITE_URL', 'https://mindthos.com')

        if not self.credentials_path:
            raise EnvironmentError(
                "GSC_CREDENTIALS_PATH가 설정되지 않았습니다.\n"
                "Google Cloud 서비스 계정 JSON 키 경로를 .env.local에 추가하세요:\n"
                "  GSC_CREDENTIALS_PATH=/path/to/service-account.json\n\n"
                "설정 가이드: https://developers.google.com/webmaster-tools/v1/how-tos/service_accounts"
            )

    def get_search_performance(self, days=28, dimensions=None):
        """
        검색 성과 데이터 조회.

        Args:
            days: 조회 기간 (최근 N일)
            dimensions: ['query', 'page', 'date', 'device', 'country']

        Returns:
            {
                "rows": [
                    {"keys": ["키워드"], "clicks": 10, "impressions": 500, "ctr": 0.02, "position": 12.3}
                ]
            }
        """
        # TODO: google-auth + google-api-python-client 설치 후 구현
        # pip install google-auth google-api-python-client
        raise NotImplementedError(
            "GSC API 연동이 아직 활성화되지 않았습니다. 설정 방법은 모듈 docstring을 참조하세요."
        )

    def get_top_queries(self, days=28, limit=50):
        """상위 검색어 조회 (클릭 순)."""
        raise NotImplementedError("GSC API 연동이 아직 활성화되지 않았습니다.")

    def get_page_performance(self, url_prefix="/blog/", days=28):
        """블로그 페이지별 검색 성과."""
        raise NotImplementedError("GSC API 연동이 아직 활성화되지 않았습니다.")

    def get_indexing_status(self, urls: list):
        """URL 인덱싱 상태 확인."""
        raise NotImplementedError("GSC API 연동이 아직 활성화되지 않았습니다.")


def check_setup():
    """GSC 연동 상태 확인."""
    env = load_env()
    cred_path = env.get('GSC_CREDENTIALS_PATH') or os.environ.get('GSC_CREDENTIALS_PATH')
    site_url = env.get('GSC_SITE_URL') or os.environ.get('GSC_SITE_URL')

    print("=== Google Search Console 연동 상태 ===\n")

    if cred_path and os.path.exists(cred_path):
        print(f"✅ 서비스 계정 키: {cred_path}")
        try:
            with open(cred_path) as f:
                cred = json.load(f)
            print(f"   이메일: {cred.get('client_email', '?')}")
        except Exception:
            print("   ⚠️ JSON 파일 읽기 실패")
    elif cred_path:
        print(f"❌ 서비스 계정 키 파일 없음: {cred_path}")
    else:
        print("❌ GSC_CREDENTIALS_PATH 미설정")

    if site_url:
        print(f"✅ 사이트 URL: {site_url}")
    else:
        print("⚠️ GSC_SITE_URL 미설정 (기본값: https://mindthos.com)")

    print("\n📋 필요한 패키지:")
    try:
        import google.auth
        print("  ✅ google-auth 설치됨")
    except ImportError:
        print("  ❌ google-auth 미설치 → pip install google-auth")

    try:
        from googleapiclient import discovery
        print("  ✅ google-api-python-client 설치됨")
    except ImportError:
        print("  ❌ google-api-python-client 미설치 → pip install google-api-python-client")

    print("\n📌 설정 순서:")
    print("  1. Google Cloud Console → 프로젝트 생성")
    print("  2. Search Console API 활성화")
    print("  3. 서비스 계정 생성 → JSON 키 다운로드")
    print("  4. Search Console → 설정 → 사용자 → 서비스 계정 이메일 추가")
    print("  5. .env.local에 GSC_CREDENTIALS_PATH, GSC_SITE_URL 추가")


if __name__ == '__main__':
    check_setup()
