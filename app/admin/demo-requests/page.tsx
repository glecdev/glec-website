/**
 * Admin Page: Demo Requests Management
 *
 * Purpose: View and manage demo request submissions
 * Features:
 * - List all demo requests
 * - Filter by status
 * - Sort by date
 * - View details
 * - Update status
 * - Assign to user
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo Requests - Admin | GLEC',
  description: 'Manage demo request submissions',
};

export default function AdminDemoRequestsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Demo Requests</h1>
        <p className="text-base text-gray-600 mt-2">
          View and manage demo request submissions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          <option value="">All Status</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          <option value="">All Products</option>
          <option value="DTG">DTG Series5</option>
          <option value="API">Carbon API</option>
          <option value="CLOUD">GLEC Cloud</option>
          <option value="ALL">All Products</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Preferred Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* This will be populated with dynamic data from API */}
            <tr>
              <td className="px-6 py-4" colSpan={7}>
                <div className="text-center text-gray-500 py-8">
                  <p className="text-base">
                    Connect to API endpoint to load demo requests
                  </p>
                  <p className="text-sm mt-2">
                    Endpoint: GET /api/admin/demo-requests
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination (placeholder) */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to{' '}
          <span className="font-medium">20</span> of{' '}
          <span className="font-medium">0</span> results
        </p>

        <div className="flex gap-2">
          <button
            disabled
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
