/**
 * Demo Request Page
 * Purpose: Request demo form (simplified version)
 */

'use client';

import Link from 'next/link';

export default function DemoRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">무료 데모 신청</h1>
          <p className="text-xl opacity-90">GLEC 솔루션을 직접 체험해보세요</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <p className="text-lg text-gray-700 mb-8">
            데모 신청을 원하시면 아래 연락처로 문의해주세요.
          </p>

          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-4">연락처</h2>
            <p className="text-gray-600 mb-2">이메일: demo@glec.io</p>
            <p className="text-gray-600 mb-6">전화: 02-1234-5678</p>

            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
            >
              문의하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
