/**
 * DTG Series5 Product Page - Temporarily redirects to main products page
 * TODO: Implement full product detail page
 */

import { redirect } from 'next/navigation';

export default function DTGPage() {
  redirect('/products#dtg');
}
