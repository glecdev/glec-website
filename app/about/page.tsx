/**
 * About Main Page - Redirects to Company page
 */

import { redirect } from 'next/navigation';

export default function AboutPage() {
  redirect('/about/company');
}
