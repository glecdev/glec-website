/**
 * GLEC Cloud Solution Page
 */

import Link from 'next/link';

export default function CloudPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">GLEC Cloud</h1>
          <p className="text-xl opacity-90">클라우드 기반 탄소배출 관리 플랫폼</p>
          <p className="text-lg mt-4">월 12만원</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">주요 기능</h2>
          <div className="space-y-4">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">📊 실시간 대시보드</h3>
              <p className="text-gray-600">모든 차량의 탄소배출량을 한눈에</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">📈 리포트 생성</h3>
              <p className="text-gray-600">EU CBAM 대응 리포트 자동 생성</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">🔔 알림 설정</h3>
              <p className="text-gray-600">목표치 초과 시 자동 알림</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">👥 다중 사용자</h3>
              <p className="text-gray-600">역할 기반 접근 제어</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
            >
              Cloud 문의하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
