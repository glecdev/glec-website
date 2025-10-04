/**
 * Terms of Service Page
 */

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">이용약관</h1>

        <div className="prose prose-lg">
          <p className="text-gray-600 mb-6">
            본 약관은 GLEC이 제공하는 서비스의 이용조건 및 절차에 관한 사항을 규정합니다.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">제1조 (목적)</h2>
          <p className="text-gray-600 mb-4">
            본 약관은 GLEC이 제공하는 모든 서비스의 이용조건 및 절차에 관한 기본적인 사항을 규정함을 목적으로 합니다.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">제2조 (용어의 정의)</h2>
          <p className="text-gray-600 mb-4">
            본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">제3조 (약관의 효력 및 변경)</h2>
          <p className="text-gray-600 mb-4">
            본 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력이 발생합니다.
          </p>

          <p className="text-sm text-gray-500 mt-8">
            최종 업데이트: 2025년 10월 2일
          </p>
        </div>
      </div>
    </div>
  );
}
