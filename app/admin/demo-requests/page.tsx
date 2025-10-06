/**
 * Admin Page: Demo Requests Management
 */

import { Metadata } from 'next';
import DemoRequestsClient from './DemoRequestsClient';

export const metadata: Metadata = {
  title: 'Demo Requests - Admin | GLEC',
  description: 'Manage demo request submissions',
};

export default function AdminDemoRequestsPage() {
  return <DemoRequestsClient />;
}
