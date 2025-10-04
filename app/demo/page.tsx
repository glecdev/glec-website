/**
 * Demo Page - Redirect to demo-request
 */

import { redirect } from 'next/navigation';

export default function DemoPage() {
  redirect('/demo-request');
}
