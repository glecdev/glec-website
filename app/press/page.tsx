/**
 * Press Releases Page - Redirects to Knowledge Press
 */

import { redirect } from 'next/navigation';

export default function PressPage() {
  redirect('/knowledge/press');
}
