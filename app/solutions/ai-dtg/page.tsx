/**
 * AI DTG Solution Page
 */

import Link from 'next/link';

export default function AIDTGPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-4">
            🚀 차세대 기술
          </div>
          <h1 className="text-5xl font-bold mb-6">AI-powered DTG</h1>
          <p className="text-xl opacity-90">인공지능 기반 탄소배출 예측 및 최적화</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">AI 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">🤖 예측 분석</h3>
              <p className="text-gray-600">머신러닝으로 미래 배출량 예측</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">🎯 경로 최적화</h3>
              <p className="text-gray-600">최소 배출 경로 추천</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">💡 운행 패턴 분석</h3>
              <p className="text-gray-600">운전자별 효율성 분석</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">🔮 이상 탐지</h3>
              <p className="text-gray-600">비정상 배출 자동 감지</p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-primary-50 border-l-4 border-primary-500 rounded">
            <p className="text-gray-700">
              <strong>Coming Soon:</strong> AI DTG는 현재 개발 중입니다. 출시 알림을 받으시려면 문의해주세요.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
            >
              출시 알림 신청
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
