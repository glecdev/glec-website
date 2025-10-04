/**
 * Team About Page
 */

import Link from 'next/link';

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">우리 팀</h1>
          <p className="text-xl opacity-90">글로벌 물류 탄소중립을 만들어가는 전문가들</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">팀 문화</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">목표 지향</h3>
              <p className="text-gray-600">명확한 목표와 달성</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2">협업</h3>
              <p className="text-gray-600">팀워크로 성장</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2">혁신</h3>
              <p className="text-gray-600">새로운 기술 도입</p>
            </div>
          </div>

          <div className="p-6 bg-primary-50 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">함께 일하고 싶으신가요?</h3>
            <p className="text-gray-700 mb-6">
              GLEC은 물류 산업의 탄소중립을 실현할 열정적인 팀원을 찾고 있습니다.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
            >
              채용 문의
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
