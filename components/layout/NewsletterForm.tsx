/**
 * Newsletter Form Component
 *
 * Client Component for newsletter subscription
 * Separated from Footer to maintain Server Component benefits
 */

'use client';

import React, { useState } from 'react';
import { Input, Button } from '@/components/ui';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // TODO: API 연동 후 실제 구현
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      // if (!response.ok) throw new Error('구독 실패');

      // Temporary success simulation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStatus('success');
      setMessage('구독이 완료되었습니다!');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('구독에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder="이메일 주소"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={status === 'loading'}
        className="bg-navy-800 border-navy-700 text-white placeholder:text-gray-500"
      />
      <Button
        variant="primary"
        fullWidth
        size="sm"
        type="submit"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? '처리 중...' : '구독하기'}
      </Button>
      {message && (
        <p
          className={`text-sm ${
            status === 'success' ? 'text-green-400' : 'text-error-500'
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
