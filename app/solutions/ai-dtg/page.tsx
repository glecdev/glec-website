/**
 * AI DTG Solution Page - World-class Design
 */

'use client';

import Link from 'next/link';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { useState } from 'react';

export default function AIDTGPage() {
  const { displayedText: headerText } = useTypingAnimation(
    'AI로 예측하는\n차세대 탄소관리',
    50
  );

  const [activeTab, setActiveTab] = useState<'features' | 'technology' | 'beta'>('features');

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
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              🚀 Coming Soon • Beta Program • AI-Powered
            </div>

            {/* Title with Typing Animation */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight whitespace-pre-line">
              {headerText}
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed">
              머신러닝 기반 배출량 예측과 최적 경로 추천으로 탄소배출을 최소화하세요
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact"
                className="group px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-2"
              >
                Beta 신청하기
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI 기술 보기
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                95% 예측 정확도
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                15% 배출 감축
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                실시간 분석
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
              onClick={() => setActiveTab('features')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'features'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              주요 기능
            </button>
            <button
              onClick={() => setActiveTab('technology')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'technology'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              AI 기술
            </button>
            <button
              onClick={() => setActiveTab('beta')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'beta'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Beta Program
            </button>
          </div>
        </div>
      </section>

      {/* Features Tab */}
      {activeTab === 'features' && (
        <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                AI가 탄소배출을<br />자동으로 관리합니다
              </h2>
              <p className="text-xl text-gray-600">
                머신러닝과 강화학습으로 운송 효율을 극대화하세요
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">배출량 예측 AI</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  LSTM 모델로 향후 3개월 배출량 예측. 정확도 95% 이상. 계절성, 트렌드, 외부 변수를 모두 고려한 정밀 예측.
                </p>
                <div className="flex items-center text-primary-600 font-semibold text-sm">
                  <span className="bg-primary-50 px-2 py-1 rounded">LSTM Neural Network</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">경로 최적화</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  강화학습으로 최소 배출 경로 실시간 계산. 평균 15% 배출 감축. 교통 상황, 날씨, 차량 상태를 반영한 동적 최적화.
                </p>
                <div className="flex items-center text-green-600 font-semibold text-sm">
                  <span className="bg-green-50 px-2 py-1 rounded">Reinforcement Learning</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">이상 패턴 감지</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  비정상적인 배출 증가를 자동 감지하고 알림. 오탐률 2% 미만. Anomaly Detection으로 연료 누출, 엔진 고장 조기 발견.
                </p>
                <div className="flex items-center text-purple-600 font-semibold text-sm">
                  <span className="bg-purple-50 px-2 py-1 rounded">Anomaly Detection</span>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">운전자 프로파일링</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  운전자별 운행 패턴 분석 및 개선 제안. Eco-driving 교육 자료 제공. 급가속, 급제동 등 비효율 운전 습관 교정.
                </p>
                <div className="flex items-center text-orange-600 font-semibold text-sm">
                  <span className="bg-orange-50 px-2 py-1 rounded">Driver Behavior Analysis</span>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">차량 상태 모니터링</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  차량 센서 데이터로 엔진 효율 분석. 정비 시기 예측. OBD-II 연동으로 실시간 연료 소비, RPM, 온도 모니터링.
                </p>
                <div className="flex items-center text-blue-600 font-semibold text-sm">
                  <span className="bg-blue-50 px-2 py-1 rounded">Predictive Maintenance</span>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">자동 보고서 생성</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  AI가 주간/월간 인사이트 리포트 자동 작성. 경영진용 대시보드 제공. 자연어 생성(NLG)으로 가독성 높은 분석 리포트.
                </p>
                <div className="flex items-center text-red-600 font-semibold text-sm">
                  <span className="bg-red-50 px-2 py-1 rounded">Natural Language Generation</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Technology Tab */}
      {activeTab === 'technology' && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                최첨단 AI 기술 스택
              </h2>
              <p className="text-xl text-gray-600">
                검증된 머신러닝 모델과 빅데이터 분석 기술
              </p>
            </div>

            {/* Technology Categories */}
            <div className="space-y-6">
              {/* Category 1: Machine Learning */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 border-b border-primary-200">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">ML</span>
                    Machine Learning Models
                  </h3>
                  <p className="text-gray-600 mt-2">시계열 예측 및 패턴 인식</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">LSTM (Long Short-Term Memory)</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        시계열 데이터 분석에 최적화된 딥러닝 모델. 과거 3년 운송 데이터를 학습하여 향후 3개월 배출량 예측. Dropout 0.2, 3-layer 구조로 과적합 방지.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded">TensorFlow</span>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded">Keras</span>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded">Accuracy: 95%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">Random Forest Regressor</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        차량별, 경로별 배출 패턴 분류. 50개 결정 트리 앙상블로 변수 중요도 분석. Feature Importance로 배출에 가장 큰 영향을 주는 요인 식별.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">scikit-learn</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">n_estimators: 50</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">R² Score: 0.92</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category 2: Reinforcement Learning */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 border-b border-green-200">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">RL</span>
                    Reinforcement Learning
                  </h3>
                  <p className="text-gray-600 mt-2">동적 경로 최적화 및 의사결정</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">Q-Learning (Deep Q-Network)</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        교통 상황, 날씨, 차량 상태를 고려한 최적 경로 선택. Reward Function: -배출량 -시간 -비용. Epsilon-greedy 전략으로 탐험과 활용 균형.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">PyTorch</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Experience Replay</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Emission Reduction: 15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category 3: Anomaly Detection */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 border-b border-purple-200">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">AD</span>
                    Anomaly Detection
                  </h3>
                  <p className="text-gray-600 mt-2">이상 패턴 실시간 감지</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">Isolation Forest</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        정상 배출 범위를 벗어나는 데이터 자동 감지. Contamination 0.05로 상위 5% 이상치 탐지. 연료 누출, 엔진 고장 조기 발견으로 정비 비용 30% 절감.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">scikit-learn</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">False Positive Rate: 2%</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">Real-time Alert</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">Autoencoder</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        정상 패턴을 학습하여 비정상 패턴 감지. Reconstruction Error Threshold로 이상 판단. 차량별 베이스라인 자동 설정.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">TensorFlow</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">Encoder-Decoder</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">Unsupervised Learning</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category 4: NLP */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 border-b border-orange-200">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">NLG</span>
                    Natural Language Generation
                  </h3>
                  <p className="text-gray-600 mt-2">AI 리포트 자동 작성</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">GPT-based Report Generator</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        데이터 인사이트를 자연어로 변환. 주간/월간 리포트 자동 생성. 경영진용 요약, 운영진용 상세 리포트 동시 제공. 템플릿 커스터마이징 지원.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">OpenAI API</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">Few-shot Learning</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">Multi-format Export</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technology Stack Summary */}
            <div className="mt-12 p-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl text-white">
              <h3 className="text-2xl font-bold mb-4 text-center">Full Technology Stack</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">4</div>
                  <div className="text-white/80 text-sm">ML Models</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">95%</div>
                  <div className="text-white/80 text-sm">Prediction Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">15%</div>
                  <div className="text-white/80 text-sm">Emission Reduction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">2%</div>
                  <div className="text-white/80 text-sm">False Positive Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Beta Program Tab */}
      {activeTab === 'beta' && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Beta Program 신청
              </h2>
              <p className="text-xl text-gray-600">
                AI DTG 출시 전 베타 테스터로 참여하고 특별 혜택을 받으세요
              </p>
            </div>

            {/* Beta Program Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-primary-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Early Access</h3>
                    <p className="text-gray-600">
                      정식 출시 전 AI DTG 솔루션을 먼저 사용하고, 제품 개발에 직접 피드백을 제공할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">50% 할인 혜택</h3>
                    <p className="text-gray-600">
                      정식 출시 후 1년간 모든 AI DTG 요금제를 50% 할인된 가격으로 이용하실 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">맞춤 AI 모델</h3>
                    <p className="text-gray-600">
                      귀사의 운송 데이터로 AI 모델을 파인튜닝하여 더 정확한 예측과 최적화를 제공합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-orange-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">전담 지원팀</h3>
                    <p className="text-gray-600">
                      베타 기간 동안 AI 전문가와 데이터 사이언티스트가 1:1로 기술 지원을 제공합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Beta Timeline */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white mb-16">
              <h3 className="text-2xl font-bold mb-8 text-center">Beta Program Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h4 className="font-bold mb-2">신청 및 선정</h4>
                  <p className="text-white/80 text-sm">2025년 11월<br />선착순 30개사</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h4 className="font-bold mb-2">온보딩</h4>
                  <p className="text-white/80 text-sm">2025년 12월<br />데이터 연동 및 교육</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h4 className="font-bold mb-2">베타 테스트</h4>
                  <p className="text-white/80 text-sm">2026년 1월~3월<br />3개월 무료 사용</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">4</span>
                  </div>
                  <h4 className="font-bold mb-2">정식 출시</h4>
                  <p className="text-white/80 text-sm">2026년 4월<br />50% 할인 적용</p>
                </div>
              </div>
            </div>

            {/* Application Form CTA */}
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                지금 Beta 신청하세요
              </h3>
              <p className="text-gray-600 mb-8 text-center">
                선착순 30개사에 한해 Beta Program에 참여하실 수 있습니다.<br />
                양식 제출 후 2영업일 내 연락드리겠습니다.
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">회사명, 담당자명, 이메일, 전화번호</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">보유 차량 대수 및 종류</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">월 평균 운송 건수 및 거리</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">AI DTG로 해결하고 싶은 문제점</span>
                </div>
              </div>

              <Link
                href="/contact"
                className="block w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-xl hover:shadow-2xl text-center"
              >
                Beta Program 신청하기
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            AI가 여는 탄소관리의 미래
          </h2>
          <p className="text-xl text-white/90 mb-12">
            지금 Beta Program에 참여하고 탄소관리의 혁신을 경험하세요
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Beta 신청하기
            </Link>
            <Link
              href="/solutions"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
            >
              다른 솔루션 보기
            </Link>
          </div>

          {/* AI Model Architecture Preview */}
          <div className="mt-16 text-left bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400 font-mono">AI Model Architecture</span>
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded">Accuracy: 95%</span>
            </div>
            <pre className="text-sm text-green-400 font-mono overflow-x-auto">
              <code>{`# LSTM Model for Emission Prediction
model = Sequential([
    LSTM(128, return_sequences=True, input_shape=(90, 12)),
    Dropout(0.2),
    LSTM(64, return_sequences=True),
    Dropout(0.2),
    LSTM(32),
    Dense(16, activation='relu'),
    Dense(1)
])

# Training on 3-year historical data
model.compile(optimizer='adam', loss='mse', metrics=['mae'])
model.fit(X_train, y_train, epochs=100, batch_size=32)

# Prediction Accuracy: 95%
# Average Emission Reduction: 15%
# False Positive Rate: 2%`}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
