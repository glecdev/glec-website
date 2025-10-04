/**
 * Partners Page
 */

import Link from 'next/link';

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">파트너</h1>
          <p className="text-xl opacity-90">글로벌 리더들과 함께 탄소중립을 만들어갑니다</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">글로벌 파트너십</h2>

          <div className="space-y-6 mb-12">
            <div className="p-8 bg-gray-50 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">🚚 DHL GoGreen</h3>
              <p className="text-gray-700 mb-4">
                세계 최대 물류 기업 DHL과의 탄소중립 파트너십
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>글로벌 물류 네트워크 통합</li>
                <li>탄소배출 데이터 표준화</li>
                <li>친환경 물류 솔루션 공동 개발</li>
              </ul>
            </div>

            <div className="p-8 bg-gray-50 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">🌍 Smart Freight Centre</h3>
              <p className="text-gray-700 mb-4">
                ISO-14083 국제표준 제정 기관과의 협력
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>ISO-14083 표준 준수 인증</li>
                <li>국제 표준 기반 데이터 검증</li>
                <li>글로벌 물류 탄소배출 측정 협력</li>
              </ul>
            </div>
          </div>

          <div className="text-center p-8 bg-primary-50 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">파트너십 문의</h3>
            <p className="text-gray-700 mb-6">
              GLEC과 함께 물류 탄소중립을 실현하고 싶으신가요?
            </p>
            <Link
              href="/partnership"
              className="inline-block px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
            >
              파트너십 신청
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
