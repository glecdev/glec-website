/**
 * Notices List Page - Redirect to /news
 *
 * Purpose: /notices is an alias for /news to maintain backward compatibility
 */

import { redirect } from 'next/navigation';

export default function NoticesPage() {
  redirect('/news');
}
