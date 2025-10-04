/**
 * Certifications Page
 */

import Link from 'next/link';

export default function CertificationsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">인증 및 표준</h1>
          <p className="text-xl opacity-90">국제 표준 기반의 신뢰할 수 있는 솔루션</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="p-8 bg-primary-50 border-l-4 border-primary-500 rounded-lg mb-12">
            <div className="flex items-start">
              <div className="text-5xl mr-6">🏆</div>
              <div>
                <h2 className="text-3xl font-bold mb-4">ISO-14083 국제표준 인증</h2>
                <p className="text-lg text-gray-700 mb-4">
                  GLEC은 한국 최초로 ISO-14083 국제표준 기반 탄소배출 측정 솔루션을 Smart Freight Centre에 제출했습니다.
                </p>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <strong>인증 기관:</strong> Smart Freight Centre (SFC)
                  </p>
                  <p className="text-gray-600">
                    <strong>표준:</strong> ISO 14083:2023 - Greenhouse gases — Quantification and reporting of greenhouse gas emissions arising from transport chain operations
                  </p>
                  <p className="text-gray-600">
                    <strong>제출일:</strong> 2024년
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-6">ISO-14083이란?</h2>
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-gray-700">
              ISO-14083은 2023년에 제정된 국제표준으로, 운송 및 물류 체인에서 발생하는 온실가스 배출량을 정량화하고 보고하는 방법을 규정합니다.
              이 표준은 다양한 운송 수단(도로, 철도, 해운, 항공)과 물류 활동에서 발생하는 탄소배출량을 일관되고 투명하게 측정할 수 있도록 합니다.
            </p>
          </div>

          <h2 className="text-3xl font-bold mb-6">왜 ISO-14083이 중요한가요?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">🌍 EU CBAM 대응</h3>
              <p className="text-gray-600">EU 탄소국경조정제도 필수 요구사항</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">📊 글로벌 표준</h3>
              <p className="text-gray-600">전 세계가 인정하는 측정 방법</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">🔍 투명성</h3>
              <p className="text-gray-600">일관된 측정으로 비교 가능</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">✅ 신뢰성</h3>
              <p className="text-gray-600">검증된 방법론 사용</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
            >
              ISO-14083 솔루션 문의
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
