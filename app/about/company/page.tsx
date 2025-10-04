/**
 * Company About Page
 */

import Link from 'next/link';

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl font-bold mb-6">회사 소개</h1>
          <p className="text-xl opacity-90">
            ISO-14083 국제표준 기반 물류 탄소배출 측정 솔루션 선도 기업
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">우리의 미션</h2>
          <p className="text-lg text-gray-700 mb-12">
            GLEC은 물류 산업의 탄소중립을 실현하기 위해 ISO-14083 국제표준 기반의 정확한 탄소배출 측정 솔루션을 제공합니다.
          </p>

          <h2 className="text-3xl font-bold mb-6">파트너십</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">🚚 DHL GoGreen</h3>
              <p className="text-gray-600">글로벌 물류 탄소중립 파트너십 (2024)</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">🌍 Smart Freight Centre</h3>
              <p className="text-gray-600">ISO-14083 국제표준 협력 (2024)</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-6">인증</h2>
          <div className="p-6 bg-primary-50 border-l-4 border-primary-500 rounded mb-12">
            <h3 className="text-xl font-bold mb-2">🏆 ISO-14083 국제표준</h3>
            <p className="text-gray-700">한국 최초 ISO-14083 표준 기반 솔루션 제출</p>
          </div>

          <div className="text-center">
            <Link
              href="/about/team"
              className="inline-block px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition mr-4"
            >
              팀 소개 보기
            </Link>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition"
            >
              문의하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
