/**
 * CSV Export Utility
 *
 * Converts data to CSV format and triggers download
 * Used in: Admin pages for exporting data
 */

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columnMapping?: Record<keyof T, string>
): void {
  if (data.length === 0) {
    alert('내보낼 데이터가 없습니다.');
    return;
  }

  // Get columns (use mapping if provided, otherwise use keys)
  const columns = columnMapping
    ? Object.keys(columnMapping)
    : Object.keys(data[0]);

  // Create CSV header
  const headers = columns.map((col) =>
    columnMapping ? columnMapping[col as keyof T] : col
  );

  // Create CSV rows
  const rows = data.map((item) =>
    columns.map((col) => {
      const value = item[col];

      // Handle different types
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma/newline
        const escaped = value.replace(/"/g, '""');
        return /[,\n"]/.test(escaped) ? `"${escaped}"` : escaped;
      }
      if (value instanceof Date) {
        return value.toISOString();
      }

      return String(value);
    })
  );

  // Combine headers and rows
  const csv = [headers, ...rows]
    .map((row) => row.join(','))
    .join('\n');

  // Add BOM for Excel UTF-8 support
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csv;

  // Create download link
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Partnership-specific CSV export
 */
export function exportPartnershipsToCSV(
  partnerships: Array<{
    companyName: string;
    contactName: string;
    email: string;
    phone?: string;
    website?: string;
    partnershipType: string;
    status: string;
    proposal: string;
    adminNotes: string | null;
    createdAt: string;
    updatedAt: string;
  }>
): void {
  const columnMapping = {
    companyName: '회사명',
    contactName: '담당자명',
    email: '이메일',
    phone: '전화번호',
    website: '웹사이트',
    partnershipType: '유형',
    status: '상태',
    proposal: '제안 내용',
    adminNotes: '관리자 메모',
    createdAt: '신청일',
    updatedAt: '최종 수정일',
  };

  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `partnerships_${timestamp}`;

  exportToCSV(partnerships, filename, columnMapping);
}
