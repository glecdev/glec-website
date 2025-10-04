/**
 * Privacy Policy Page
 */

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">개인정보 처리방침</h1>

        <div className="prose prose-lg">
          <p className="text-gray-600 mb-6">
            GLEC은 이용자의 개인정보를 중요시하며, 개인정보 보호법 등 관련 법령을 준수하고 있습니다.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. 수집하는 개인정보 항목</h2>
          <p className="text-gray-600 mb-4">
            GLEC은 서비스 제공을 위해 필요한 최소한의 개인정보를 수집합니다.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. 개인정보의 처리 목적</h2>
          <p className="text-gray-600 mb-4">
            수집한 개인정보는 서비스 제공, 문의 응대, 마케팅 등의 목적으로만 사용됩니다.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. 개인정보의 보유 및 이용기간</h2>
          <p className="text-gray-600 mb-4">
            개인정보는 수집 및 이용목적이 달성된 후에는 지체없이 파기합니다.
          </p>

          <p className="text-sm text-gray-500 mt-8">
            최종 업데이트: 2025년 10월 2일
          </p>
        </div>
      </div>
    </div>
  );
}
