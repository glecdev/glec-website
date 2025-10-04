/**
 * Knowledge Hub Page
 *
 * Based on: GLEC-Page-Structure-Standards.md
 * Purpose: 지식 허브 메인 페이지 - 라이브러리, 프레스, 영상, 블로그, 공지사항
 */

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GLEC 지식센터 - ISO-14083 물류 탄소배출 측정 자료',
  description: '물류 탄소배출 측정을 위한 라이브러리, 프레스 릴리스, 영상, 블로그, 공지사항을 제공합니다.',
};

const knowledgeCategories = [
  {
    title: '라이브러리',
    description: '백서, 가이드, 보고서 등 전문 자료',
    icon: '📚',
    href: '/knowledge/library',
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: '프레스',
    description: '언론 보도 및 프레스 릴리스',
    icon: '📰',
    href: '/knowledge/press',
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: '영상',
    description: '제품 소개 및 튜토리얼 영상',
    icon: '🎥',
    href: '/knowledge/videos',
    color: 'from-red-500 to-red-600',
  },
  {
    title: '블로그',
    description: '업계 인사이트 및 트렌드 분석',
    icon: '✍️',
    href: '/knowledge/blog',
    color: 'from-green-500 to-green-600',
  },
  {
    title: '공지사항',
    description: '제품 업데이트 및 공지사항',
    icon: '📢',
    href: '/news',
    color: 'from-orange-500 to-orange-600',
  },
];

export default function KnowledgePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">GLEC 지식센터</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            물류 탄소배출 측정을 위한 전문 지식과 최신 정보를 제공합니다
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {knowledgeCategories.map((category, index) => (
              <Link
                key={category.href}
                href={category.href}
                className="group block bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl mb-6`}>
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-primary-500 transition-colors">
                  {category.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                <div className="flex items-center text-primary-500 font-semibold">
                  자료 보기
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">50+</div>
              <div className="text-gray-600">라이브러리 자료</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">30+</div>
              <div className="text-gray-600">프레스 릴리스</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">20+</div>
              <div className="text-gray-600">영상 콘텐츠</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">100+</div>
              <div className="text-gray-600">블로그 포스트</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            더 많은 정보가 필요하신가요?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            GLEC 전문가가 귀사의 탄소배출 측정을 도와드립니다
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-primary-500 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            문의하기
          </Link>
        </div>
      </section>
    </div>
  );
}
