/**
 * Footer Component
 *
 * Based on: GLEC-Page-Structure-Standards-v2.md
 * Sections: Company info, Quick links, Contact, Newsletter, Legal
 */

import React from 'react';
import Link from 'next/link';
import { NewsletterForm } from './NewsletterForm';

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold gradient-text">GLEC</h3>
            <p className="text-sm text-gray-400">
              ISO-14083 국제표준 기반<br />
              물류 탄소배출 측정 솔루션
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-white">대표이사:</span> 강덕호
              </p>
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-white">사업자등록번호:</span> 123-45-67890
              </p>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">
              솔루션
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/solutions/dtg" className="text-sm text-gray-400 hover:text-white transition-colors">
                  GLEC DTG
                </Link>
              </li>
              <li>
                <Link href="/solutions/api" className="text-sm text-gray-400 hover:text-white transition-colors">
                  GLEC API Console
                </Link>
              </li>
              <li>
                <Link href="/solutions/cloud" className="text-sm text-gray-400 hover:text-white transition-colors">
                  GLEC Cloud
                </Link>
              </li>
              <li>
                <Link href="/solutions/ai-dtg" className="text-sm text-gray-400 hover:text-white transition-colors">
                  GLEC AI DTG
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">
              회사
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about/company" className="text-sm text-gray-400 hover:text-white transition-colors">
                  회사 개요
                </Link>
              </li>
              <li>
                <Link href="/about/team" className="text-sm text-gray-400 hover:text-white transition-colors">
                  팀 소개
                </Link>
              </li>
              <li>
                <Link href="/about/partners" className="text-sm text-gray-400 hover:text-white transition-colors">
                  파트너십
                </Link>
              </li>
              <li>
                <Link href="/about/certifications" className="text-sm text-gray-400 hover:text-white transition-colors">
                  인증 및 수상
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  연락처
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">
              뉴스레터
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              최신 소식과 업데이트를 받아보세요
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-navy-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} GLEC Inc. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/legal/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/legal/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
