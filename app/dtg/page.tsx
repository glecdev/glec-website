/**
 * DTG Product Page
 *
 * GLEC DTG Series5 상세 페이지
 */

import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GLEC DTG Series5 - 세계 최초 스마트폰 CPU 탑재 차량용 탄소배출 측정 장치',
  description:
    '80만원의 일회성 비용으로 ISO-14083 표준 기반 실시간 탄소배출량 측정. GPS, 속도, 연료 소비량 자동 수집.',
};

export default function DTGPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              GLEC DTG Series5
            </h1>
            <p className="text-2xl lg:text-3xl mb-4">
              세계 최초 스마트폰 CPU 탑재
            </p>
            <p className="text-xl text-blue-100 mb-12">
              차량용 탄소배출 측정 장치 (Digital Tachograph)
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-500 bg-white rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                무료 상담 신청
              </Link>

              <Link
                href="/demo"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white hover:text-primary-500 active:bg-gray-50 transition-all duration-200"
              >
                제품 데모 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Price Section */}
      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
              <p className="text-gray-600 mb-2">일회성 구매 비용</p>
              <p className="text-6xl font-bold text-primary-500 mb-4">80만원</p>
              <p className="text-gray-600">
                별도의 월 구독료 없음 | 영구 사용 가능
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              핵심 기능
            </h2>
            <p className="text-xl text-gray-600">
              ISO-14083 국제표준 기반 실시간 탄소배출량 측정
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-primary-500 text-3xl">{feature.icon}</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              기술 사양
            </h2>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                {specifications.map((spec, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900 w-1/3">
                      {spec.label}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Installation */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                간편한 설치
              </h2>
              <p className="text-xl text-gray-600">
                OBD-II 포트에 플러그인하면 즉시 사용 가능
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {installationSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 bg-primary-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 mx-auto">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-primary-50 p-8 rounded-lg">
              <p className="text-center text-gray-700">
                <span className="font-semibold">설치 시간:</span> 차량 1대당 약 5분 |{' '}
                <span className="font-semibold">전국 서비스:</span> 방문 설치 지원
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              1개월 무료 체험
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              GLEC DTG 5대를 무료로 제공하여 실제 운영 환경에서 테스트하세요
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-500 bg-white rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                무료 체험 신청
              </Link>

              <a
                href="tel:010-4481-5189"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white hover:text-primary-500 active:bg-gray-50 transition-all duration-200"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                전화 상담: 010-4481-5189
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    icon: '🧠',
    title: '스마트폰 CPU',
    description:
      '세계 최초로 스마트폰 CPU를 탑재하여 강력한 연산 능력과 안정성을 제공합니다.',
  },
  {
    icon: '📊',
    title: 'ISO-14083 엔진 내장',
    description:
      '국제표준 ISO-14083 엔진이 내장되어 실시간으로 정확한 탄소배출량을 계산합니다.',
  },
  {
    icon: '📡',
    title: '실시간 데이터 전송',
    description:
      'GPS, 속도, 연료 소비량 등의 데이터를 5분마다 자동으로 서버에 전송합니다.',
  },
  {
    icon: '💾',
    title: '72시간 오프라인 저장',
    description:
      '네트워크 연결이 끊겨도 최대 72시간 분량의 데이터를 내부 메모리에 저장합니다.',
  },
  {
    icon: '🔌',
    title: '플러그 앤 플레이',
    description:
      'OBD-II 포트에 연결하면 즉시 사용 가능. 별도의 배선 작업이 필요 없습니다.',
  },
  {
    icon: '🔋',
    title: '저전력 설계',
    description:
      '차량 배터리에 부담을 주지 않는 저전력 설계로 24시간 안전하게 작동합니다.',
  },
];

const specifications = [
  { label: 'CPU', value: '스마트폰급 ARM Cortex-A53 (Quad-core)' },
  { label: 'RAM', value: '2GB LPDDR4' },
  { label: '저장 공간', value: '16GB eMMC (72시간 데이터 저장)' },
  { label: 'GPS', value: 'Multi-GNSS (GPS, GLONASS, Galileo, BeiDou)' },
  { label: '통신', value: '4G LTE Cat.4 / Wi-Fi 802.11ac' },
  { label: 'OBD-II 프로토콜', value: 'ISO 15765, ISO 14230, ISO 9141, J1850' },
  { label: '데이터 수집 주기', value: '1초 (서버 전송: 5분마다)' },
  { label: '전원', value: '차량 배터리 (12V/24V 자동 감지)' },
  { label: '소비 전력', value: '평균 2.5W (대기 시 0.5W)' },
  { label: '동작 온도', value: '-20°C ~ 70°C' },
  { label: '크기', value: '85mm × 55mm × 25mm' },
  { label: '무게', value: '120g' },
  { label: '인증', value: 'ISO-14083, CE, FCC, KC' },
  { label: '보증 기간', value: '3년' },
];

const installationSteps = [
  {
    title: 'OBD-II 포트 위치 확인',
    description: '운전석 하단에 위치한 OBD-II 포트를 찾습니다',
  },
  {
    title: 'DTG 장치 연결',
    description: '포트에 GLEC DTG를 플러그인합니다',
  },
  {
    title: '자동 활성화',
    description: '차량 시동 시 자동으로 작동 시작',
  },
];
