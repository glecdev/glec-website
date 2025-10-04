/**
 * Products Main Page
 */

import Link from 'next/link';

export const metadata = {
  title: 'Products | GLEC ISO-14083 Carbon Solutions',
  description: 'DTG Series5, Carbon API, GLEC Cloud - ISO-14083 국제표준 기반 물류 탄소배출 측정 솔루션',
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <section className="py-20 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            GLEC Products
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8">
            ISO-14083 국제표준 기반 물류 탄소배출 측정 솔루션
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold mb-2">DTG Series5</h3>
              <p className="text-gray-600 mb-4">하드웨어 탄소측정기</p>
              <div className="text-3xl font-bold mb-4">₩800,000</div>
              <p className="text-gray-700 mb-6">ISO-14083 표준 기반 실시간 물류 탄소배출 측정 하드웨어</p>
              <Link href="/contact" className="block text-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition">
                문의하기
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-6xl mb-4">💻</div>
              <h3 className="text-2xl font-bold mb-2">Carbon API</h3>
              <p className="text-gray-600 mb-4">개발자를 위한 API</p>
              <div className="text-3xl font-bold mb-4">48 APIs</div>
              <p className="text-gray-700 mb-6">RESTful API로 탄소배출 계산 기능을 시스템에 통합</p>
              <Link href="/contact" className="block text-center px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition">
                문의하기
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-6xl mb-4">☁️</div>
              <h3 className="text-2xl font-bold mb-2">GLEC Cloud</h3>
              <p className="text-gray-600 mb-4">SaaS 클라우드 플랫폼</p>
              <div className="text-3xl font-bold mb-4">₩120,000/월</div>
              <p className="text-gray-700 mb-6">대시보드, 리포팅, 분석 기능을 포함한 올인원 SaaS 플랫폼</p>
              <Link href="/contact" className="block text-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition">
                문의하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
