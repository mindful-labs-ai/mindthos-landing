"""
Google Analytics 4 연동 클라이언트

블로그 오가닉 트래픽 및 전환 분석에 사용합니다.
- 페이지별 세션/사용자/이탈률
- 오가닉 검색 트래픽 추이
- 전환 이벤트 (상담 예약, 뉴스레터 구독)

설정 방법:
1. Google Cloud Console에서 프로젝트 생성
2. Google Analytics Data API 활성화
3. 서비스 계정 생성 → JSON 키 다운로드
4. GA4 속성 → 관리 → 속성 액세스 관리 → 서비스 계정 이메일 추가
5. .env.local에 추가:
   GA4_CREDENTIALS_PATH=path/to/service-account.json
   GA4_PROPERTY_ID=properties/123456789
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


class GA4Client:
    """Google Analytics 4 Data API 클라이언트 (OAuth2 서비스 계정)"""

    def __init__(self):
        env = load_env()
        self.credentials_path = env.get('GA4_CREDENTIALS_PATH') or os.environ.get('GA4_CREDENTIALS_PATH')
        self.property_id = env.get('GA4_PROPERTY_ID') or os.environ.get('GA4_PROPERTY_ID')

        if not self.credentials_path:
            raise EnvironmentError(
                "GA4_CREDENTIALS_PATH가 설정되지 않았습니다.\n"
                "Google Cloud 서비스 계정 JSON 키 경로를 .env.local에 추가하세요:\n"
                "  GA4_CREDENTIALS_PATH=/path/to/service-account.json\n\n"
                "설정 가이드: https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries"
            )

        if not self.property_id:
            raise EnvironmentError(
                "GA4_PROPERTY_ID가 설정되지 않았습니다.\n"
                "GA4 속성 ID를 .env.local에 추가하세요:\n"
                "  GA4_PROPERTY_ID=properties/123456789\n\n"
                "GA4 속성 ID 확인: GA4 → 관리 → 속성 설정 → 속성 ID"
            )

    def get_organic_traffic(self, days=28):
        """
        오가닉 검색 트래픽 조회 (페이지별).

        Args:
            days: 조회 기간 (최근 N일)

        Returns:
            {
                "rows": [
                    {"page": "/blog/post-slug", "sessions": 120, "users": 95, "bounce_rate": 0.42}
                ]
            }
        """
        # TODO: google-analytics-data 설치 후 구현
        # pip install google-analytics-data
        raise NotImplementedError(
            "GA4 API 연동이 아직 활성화되지 않았습니다. 설정 방법은 모듈 docstring을 참조하세요."
        )

    def get_blog_performance(self, days=28):
        """
        블로그 전체 성과 지표 조회.

        Returns:
            {
                "total_sessions": 1500,
                "total_users": 1200,
                "avg_session_duration": 125.3,
                "pages": [{"path": "/blog/...", "sessions": 80, ...}]
            }
        """
        raise NotImplementedError("GA4 API 연동이 아직 활성화되지 않았습니다.")

    def get_conversion_events(self, days=28):
        """
        전환 이벤트 조회 (상담 예약 폼 제출, 뉴스레터 구독).

        Returns:
            {
                "contact_form_submit": 12,
                "newsletter_subscribe": 34,
                "by_page": [{"page": "/blog/...", "conversions": 3}]
            }
        """
        raise NotImplementedError("GA4 API 연동이 아직 활성화되지 않았습니다.")

    def get_top_landing_pages(self, days=28, limit=20):
        """
        세션 수 기준 상위 블로그 랜딩 페이지 조회.

        Args:
            days: 조회 기간 (최근 N일)
            limit: 반환할 최대 페이지 수

        Returns:
            [
                {"page": "/blog/post-slug", "sessions": 200, "users": 160, "bounce_rate": 0.38}
            ]
        """
        raise NotImplementedError("GA4 API 연동이 아직 활성화되지 않았습니다.")


def check_setup():
    """GA4 연동 상태 확인."""
    env = load_env()
    cred_path = env.get('GA4_CREDENTIALS_PATH') or os.environ.get('GA4_CREDENTIALS_PATH')
    property_id = env.get('GA4_PROPERTY_ID') or os.environ.get('GA4_PROPERTY_ID')

    print("=== Google Analytics 4 연동 상태 ===\n")

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
        print("❌ GA4_CREDENTIALS_PATH 미설정")

    if property_id:
        print(f"✅ GA4 속성 ID: {property_id}")
    else:
        print("❌ GA4_PROPERTY_ID 미설정 (예: properties/123456789)")

    print("\n📋 필요한 패키지:")
    try:
        import google.auth
        print("  ✅ google-auth 설치됨")
    except ImportError:
        print("  ❌ google-auth 미설치 → pip install google-auth")

    try:
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        print("  ✅ google-analytics-data 설치됨")
    except ImportError:
        print("  ❌ google-analytics-data 미설치 → pip install google-analytics-data")

    print("\n📌 설정 순서:")
    print("  1. Google Cloud Console → 프로젝트 생성")
    print("  2. Google Analytics Data API 활성화")
    print("  3. 서비스 계정 생성 → JSON 키 다운로드")
    print("  4. GA4 → 관리 → 속성 액세스 관리 → 서비스 계정 이메일 추가 (뷰어 권한)")
    print("  5. .env.local에 GA4_CREDENTIALS_PATH, GA4_PROPERTY_ID 추가")

    print("\n📌 전환 이벤트 설정 (GA4):")
    print("  - contact_form_submit: /contact 페이지 폼 제출")
    print("  - newsletter_subscribe: 뉴스레터 구독 완료")
    print("  → GA4 → 관리 → 이벤트 → 전환으로 표시")


if __name__ == '__main__':
    check_setup()
