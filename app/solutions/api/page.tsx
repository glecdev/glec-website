/**
 * Carbon API Solution Page
 */

import Link from 'next/link';

export default function APIPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">GLEC Carbon API</h1>
          <p className="text-xl opacity-90">48개 API로 모든 물류 탄소배출 데이터에 접근하세요</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">RESTful API</h3>
              <p className="text-gray-600">표준 REST API로 쉽게 통합</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">실시간 데이터</h3>
              <p className="text-gray-600">실시간 탄소배출량 조회</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">48개 엔드포인트</h3>
              <p className="text-gray-600">완전한 데이터 액세스</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">ISO-14083 준수</h3>
              <p className="text-gray-600">국제 표준 기반 데이터</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
            >
              API 문의하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
