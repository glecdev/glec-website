/**
 * Event Type Definitions
 *
 * Based on: GLEC-Functional-Requirements-Specification.md
 * Purpose: Type-safe event data structures
 */

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
  location: string;
  locationDetails?: string; // Optional: Address, venue info
  status: EventStatus;
  imageUrl?: string; // Optional: Event banner image
  registrationUrl?: string; // Optional: External registration link
  maxAttendees?: number;
  currentAttendees?: number;
  tags?: string[]; // e.g., ["Conference", "Workshop", "Webinar"]
  createdAt: string;
  updatedAt: string;
}

export interface EventsApiResponse {
  success: boolean;
  data: Event[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface EventsApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
