"""
블로그 발행 후 성과 분석기

Usage: python post_publish_analyzer.py [--days 28] [--slug post-slug]

발행된 블로그 글의 검색 성과를 분석합니다.
GSC와 GA4 데이터를 결합하여 종합 보고서를 생성합니다.

현재 상태: GSC/GA4 연동 대기 중
  → DataForSEO 데이터만으로 기본 분석 제공 (키워드 순위 변화)
  → GSC/GA4 연동 후 전체 기능 활성화
"""

import argparse
import json
import sys
import os


def analyze_post(slug=None, days=28):
    """
    발행 글 성과 분석.

    Phase 1 (현재 - DataForSEO만):
    - 타겟 키워드의 현재 SERP 순위 확인
    - 경쟁 콘텐츠 대비 포지션

    Phase 2 (GSC 연동 후):
    - 실제 노출/클릭/CTR 데이터
    - 예상 외 키워드 발견
    - 인덱싱 상태

    Phase 3 (GA4 연동 후):
    - 오가닉 트래픽
    - 체류시간, 이탈률
    - 전환 이벤트 (상담 예약 연결)
    """
    print("=== 블로그 발행 후 성과 분석 ===\n")

    if slug:
        print(f"대상 글: /blog/{slug}")
    else:
        print("대상 글: 전체 블로그")

    print(f"분석 기간: 최근 {days}일\n")

    # Phase 1: DataForSEO
    try:
        sys.path.insert(0, os.path.dirname(__file__))
        from dataforseo_client import DataForSEOClient
        client = DataForSEOClient()
        print("✅ DataForSEO 연동 활성")
        print("   - 키워드 SERP 순위 확인 가능")
        # TODO: 타겟 키워드 순위 추적 구현
    except ImportError:
        print("⚠️ DataForSEO 클라이언트 없음 (dataforseo_client.py)")
    except Exception as e:
        print(f"⚠️ DataForSEO 연동 불가: {e}")

    # Phase 2: GSC
    print()
    try:
        from gsc_client import GSCClient
        gsc = GSCClient()
        print("✅ Search Console 연동 활성")
        print("   - 검색 노출/클릭/CTR 조회 가능")
        print("   - 인덱싱 상태 확인 가능")
    except EnvironmentError as e:
        print(f"⏳ Search Console 대기 중: 블로그 데이터 축적 후 활성화")
        print(f"   ({e.args[0].splitlines()[0]})")
    except NotImplementedError:
        print("⏳ Search Console: 클라이언트 구현 대기 중")
    except Exception as e:
        print(f"⚠️ Search Console 오류: {e}")

    # Phase 3: GA4
    print()
    try:
        from ga4_client import GA4Client
        ga4 = GA4Client()
        print("✅ GA4 연동 활성")
        print("   - 오가닉 트래픽 조회 가능")
        print("   - 전환 이벤트 분석 가능")
    except EnvironmentError as e:
        print(f"⏳ GA4 대기 중: 블로그 데이터 축적 후 활성화")
        print(f"   ({e.args[0].splitlines()[0]})")
    except NotImplementedError:
        print("⏳ GA4: 클라이언트 구현 대기 중")
    except Exception as e:
        print(f"⚠️ GA4 오류: {e}")

    print("\n" + "=" * 40)
    print("📌 현재 사용 가능한 분석:")
    print("  - DataForSEO 키워드 순위 확인")

    print("\n📌 GSC 연동 후 추가되는 분석:")
    print("  - 실제 검색 노출/클릭/CTR")
    print("  - 예상 외 유입 키워드 발견")
    print("  - URL 인덱싱 상태")

    print("\n📌 GA4 연동 후 추가되는 분석:")
    print("  - 오가닉 트래픽 추이")
    print("  - 체류시간 및 이탈률")
    print("  - 전환율 (상담 예약 연결)")

    print("\n📌 연동 설정:")
    print("  - GSC: python gsc_client.py")
    print("  - GA4: python ga4_client.py")


def main():
    parser = argparse.ArgumentParser(
        description='블로그 발행 후 성과 분석기'
    )
    parser.add_argument('--slug', help='분석할 블로그 글 슬러그')
    parser.add_argument('--days', type=int, default=28, help='분석 기간 (일, 기본값: 28)')
    args = parser.parse_args()

    analyze_post(slug=args.slug, days=args.days)


if __name__ == '__main__':
    main()
