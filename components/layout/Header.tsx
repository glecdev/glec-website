/**
 * Header Component
 *
 * Based on: GLEC-Page-Structure-Standards-v2.md
 * Features: Desktop/Mobile navigation, Logo, CTA button
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  submenu?: {
    label: string;
    href: string;
    description?: string;
  }[];
}

const navigation: NavItem[] = [
  {
    label: '홈',
    href: '/',
  },
  {
    label: '솔루션',
    href: '/solutions',
    submenu: [
      {
        label: 'GLEC DTG',
        href: '/solutions/dtg',
        description: '차세대 운행기록장치',
      },
      {
        label: 'GLEC API Console',
        href: '/solutions/api',
        description: 'ISO-14083 기반 48개 API',
      },
      {
        label: 'GLEC Cloud',
        href: '/solutions/cloud',
        description: '화주사용 국제표준 대시보드',
      },
      {
        label: 'GLEC AI DTG',
        href: '/solutions/ai-dtg',
        description: 'AI 기반 차세대 DTG',
      },
    ],
  },
  {
    label: '지식',
    href: '/knowledge',
    submenu: [
      { label: '라이브러리', href: '/knowledge/library' },
      { label: '프레스', href: '/knowledge/press' },
      { label: '영상', href: '/knowledge/videos' },
      { label: '블로그', href: '/knowledge/blog' },
      { label: '공지사항', href: '/knowledge/notices' },
    ],
  },
  {
    label: '이벤트',
    href: '/events',
  },
  {
    label: '협업',
    href: '/partnership',
  },
  {
    label: '회사소개',
    href: '/about',
    submenu: [
      { label: '회사 개요', href: '/about/company' },
      { label: '팀 소개', href: '/about/team' },
      { label: '파트너십', href: '/about/partners' },
      { label: '인증 및 수상', href: '/about/certifications' },
    ],
  },
  {
    label: '연락처',
    href: '/contact',
  },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold gradient-text">GLEC</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigation.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link href="/demo-request">
              <Button variant="primary" size="sm">
                데모 요청
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">메뉴 열기</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4">
            <div className="space-y-1">
              {navigation.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.submenu && (
                    <div className="pl-6 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 px-3">
              <Link href="/demo-request">
                <Button variant="primary" fullWidth>
                  데모 요청
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function NavItem({ item }: { item: NavItem }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!item.submenu) {
    return (
      <Link
        href={item.href}
        className="text-sm font-medium text-gray-700 hover:text-primary-500 transition-colors"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-500 transition-colors"
      >
        {item.label}
        <svg
          className={cn('ml-1 h-4 w-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 animate-slide-down">
          <div className="py-2">
            {item.submenu.map((subItem) => (
              <Link
                key={subItem.href}
                href={subItem.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="font-medium">{subItem.label}</div>
                {subItem.description && (
                  <div className="text-xs text-gray-500 mt-0.5">{subItem.description}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
