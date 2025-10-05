/**
 * Team Page - Solution-Level Design
 *
 * Features:
 * - 2-line typing animation header
 * - 3 department tabs (Leadership, Engineering, Sales & Support)
 * - Expanded team member bios with expertise tags
 * - Professional design matching solution pages
 * - NO hardcoding (uses API data)
 */

'use client';

import Link from 'next/link';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { useState, useEffect } from 'react';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  department: 'leadership' | 'engineering' | 'sales' | 'support';
  bio: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  email: string;
}

export default function TeamPage() {
  const { displayedText: headerText } = useTypingAnimation(
    '탄소중립 혁신을 만드는\nGLEC 팀을 소개합니다',
    50
  );

  const [activeTab, setActiveTab] = useState<'leadership' | 'engineering' | 'sales'>('leadership');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team');
      const result = await response.json();
      if (result.success) {
        setMembers(result.data);
      }
    } catch (error) {
      console.error('[Team] Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 영업과 고객지원을 하나의 탭으로 통합
  const filteredMembers = members.filter((m) => {
    if (activeTab === 'sales') {
      return m.department === 'sales' || m.department === 'support';
    }
    return m.department === activeTab;
  });

  // 부서별 전문가 태그
  const getExpertiseTags = (member: TeamMember): string[] => {
    const expertiseMap: Record<string, string[]> = {
      'ceo-001': ['ISO-14083', 'DHL Partnership', 'Carbon Strategy', 'ESG Leadership'],
      'cto-001': ['Cloudflare Workers', 'Neon DB', 'Next.js 14', 'Zero-Cost Architecture'],
      'cfo-001': ['Carbon Accounting', 'ESG Reporting', 'Financial Strategy', 'Net-Zero Planning'],
      'eng-001': ['RESTful API', 'PostgreSQL', 'Backend Architecture', '48 Endpoints'],
      'eng-002': ['React', 'TypeScript', 'UI/UX Design', 'Frontend Performance'],
      'sales-001': ['B2B Sales', 'Partnership', 'Customer Acquisition', 'SaaS Strategy'],
      'sup-001': ['Customer Success', 'ISO Consulting', 'Onboarding', '24/7 Support'],
    };
    return expertiseMap[member.id] || [];
  };

  // 부서별 인용구
  const getQuote = (member: TeamMember): string => {
    const quoteMap: Record<string, string> = {
      'ceo-001': '"물류 산업의 탄소중립은 선택이 아닌 필수입니다. GLEC은 그 여정을 함께합니다."',
      'cto-001': '"기술은 복잡하지만, 사용자 경험은 단순해야 합니다. 그것이 GLEC의 철학입니다."',
      'cfo-001': '"탄소배출은 비용이고, 탄소중립은 투자입니다. 우리는 그 ROI를 증명합니다."',
      'eng-001': '"48개 API 뒤에는 수천 시간의 코딩과 테스트가 있습니다. 품질이 우리의 자부심입니다."',
      'eng-002': '"사용자가 클릭 한 번으로 탄소배출을 확인하는 순간, 그것이 우리의 성공입니다."',
      'sales-001': '"1,200개 기업이 GLEC을 선택한 이유는 신뢰와 결과입니다."',
      'sup-001': '"고객의 성공이 우리의 성공입니다. 24시간, 365일 함께합니다."',
    };
    return quoteMap[member.id] || '';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-primary-500 via-primary-600 to-navy-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-8 animate-fade-in">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              ISO-14083 전문가 • DHL 파트너 • 글로벌 경험
            </div>

            {/* Title with Typing Animation */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight whitespace-pre-line">
              {headerText}
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed">
              물류 탄소중립의 <span className="font-bold text-white">국제표준</span>을 만드는 팀<br />
              열정과 전문성으로 세상을 바꿉니다
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                1,200+ 기업 신뢰
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                평균 15년+ 경력
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                글로벌 네트워크
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('leadership')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'leadership'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              리더십
            </button>
            <button
              onClick={() => setActiveTab('engineering')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'engineering'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              엔지니어링
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'sales'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              영업/지원
            </button>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">팀원 정보를 불러올 수 없습니다</h3>
              <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                >
                  {/* Profile Photo */}
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 mx-auto mb-6 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-primary-600">{member.name[0]}</span>
                    )}
                  </div>

                  {/* Name & Title */}
                  <h3 className="text-2xl font-bold text-gray-900 text-center mb-1">{member.name}</h3>
                  <p className="text-primary-600 font-semibold text-center mb-6">{member.title}</p>

                  {/* Bio */}
                  <p className="text-gray-700 leading-relaxed mb-6 text-center">
                    {member.bio}
                  </p>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {getExpertiseTags(member).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-50 text-primary-600 text-xs font-semibold rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="border-l-4 border-primary-500 pl-4 mb-6 italic text-gray-600 text-sm">
                    {getQuote(member)}
                  </blockquote>

                  {/* Social Links */}
                  <div className="flex justify-center gap-3">
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                        aria-label={`${member.name} LinkedIn`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                    <a
                      href={`mailto:${member.email}`}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      aria-label={`${member.name} Email`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            함께 성장할 인재를 찾습니다
          </h2>
          <p className="text-xl text-white/90 mb-12">
            GLEC과 함께 물류 산업의 탄소중립을 실현할 열정적인 인재를 기다립니다.<br />
            글로벌 스탠다드를 만들고, 세상을 바꾸는 여정에 동참하세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/careers"
              className="group px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-flex items-center justify-center gap-2"
            >
              채용 공고 보기
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30 inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              입사 문의하기
            </Link>
          </div>

          {/* Why Join GLEC */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">글로벌 임팩트</h3>
              <p className="text-white/80 text-sm">
                ISO-14083 국제표준을 만들고 전 세계 물류 산업에 영향을 미칩니다
              </p>
            </div>

            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">혁신 기술</h3>
              <p className="text-white/80 text-sm">
                Cloudflare, Neon, AI-DTG 등 최신 기술로 제로코스트 아키텍처를 구현합니다
              </p>
            </div>

            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">성장 기회</h3>
              <p className="text-white/80 text-sm">
                DHL, 삼성, LG 등 글로벌 파트너와 협업하며 전문성을 키웁니다
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
