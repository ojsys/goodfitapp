/**
 * Events Service
 * Handles all event-related API calls
 */

import api, { ApiResponse, handleApiError } from './api';

/**
 * Event Types
 */
export type EventVibe = 'Chill' | 'Intense' | 'Social' | 'Educational';
export type EventPriceType = 'Free' | 'Paid';
export type RSVPStatus = 'going' | 'interested' | 'not_going';

export interface Event {
  id: number;
  title: string;
  description: string;
  image_url: string;
  host: number;
  host_name: string;
  vibe: EventVibe;
  price_type: EventPriceType;
  price_amount?: number;
  start_time: string;
  end_time?: string;
  location_name: string;
  location_address: string;
  latitude?: number;
  longitude?: number;
  max_attendees?: number;
  is_full: boolean;
  tags: string[];
  what_to_bring: string[];
  is_active: boolean;
  is_cancelled: boolean;
  attendee_count: number;
  is_past: boolean;
  formatted_date: string;
  formatted_time: string;
  user_rsvp_status?: RSVPStatus | null;
  attendee_avatars: string[];
  created_at: string;
  updated_at: string;
}

export interface EventRSVP {
  id: number;
  user: number;
  user_name: string;
  user_avatar: string;
  status: RSVPStatus;
  checked_in: boolean;
  created_at: string;
}

export interface EventFilters {
  time?: 'upcoming' | 'past';
  vibe?: EventVibe;
  price_type?: EventPriceType;
  search?: string;
  tags?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  image_url?: string;
  host_name: string;
  vibe: EventVibe;
  price_type: EventPriceType;
  price_amount?: number;
  start_time: string;
  end_time?: string;
  location_name: string;
  location_address: string;
  latitude?: number;
  longitude?: number;
  max_attendees?: number;
  tags?: string[];
  what_to_bring?: string[];
}

/**
 * Events Service
 */
export const eventsService = {
  /**
   * Get all events with optional filters
   */
  async getEvents(filters?: EventFilters): Promise<ApiResponse<Event[]>> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        if (filters.time) params.append('time', filters.time);
        if (filters.vibe) params.append('vibe', filters.vibe);
        if (filters.price_type) params.append('price_type', filters.price_type);
        if (filters.search) params.append('search', filters.search);
        if (filters.tags) params.append('tags', filters.tags);
      }

      const queryString = params.toString();
      const url = queryString ? `/events/?${queryString}` : '/events/';

      const response = await api.get(url);

      // Handle paginated response
      let events: Event[] = [];
      if (Array.isArray(response.data)) {
        events = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        events = response.data.results;
      }

      return {
        success: true,
        data: events,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get a single event by ID
   */
  async getEvent(eventId: number): Promise<ApiResponse<Event>> {
    try {
      const response = await api.get(`/events/${eventId}/`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new event
   */
  async createEvent(eventData: CreateEventData): Promise<ApiResponse<Event>> {
    try {
      const response = await api.post('/events/', eventData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update an event
   */
  async updateEvent(
    eventId: number,
    eventData: Partial<CreateEventData>
  ): Promise<ApiResponse<Event>> {
    try {
      const response = await api.patch(`/events/${eventId}/`, eventData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId: number): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/events/${eventId}/`);

      return {
        success: true,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * RSVP to an event
   */
  async rsvpToEvent(eventId: number, status: RSVPStatus): Promise<ApiResponse<EventRSVP>> {
    try {
      const response = await api.post(`/events/${eventId}/rsvp/`, { status });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cancel RSVP to an event
   */
  async cancelRSVP(eventId: number): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/events/${eventId}/cancel_rsvp/`);

      return {
        success: true,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get attendees for an event
   */
  async getEventAttendees(eventId: number): Promise<ApiResponse<EventRSVP[]>> {
    try {
      const response = await api.get(`/events/${eventId}/attendees/`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get events the current user has RSVP'd to
   */
  async getMyEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const response = await api.get('/events/my_events/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get events hosted by the current user
   */
  async getHostedEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const response = await api.get('/events/hosted/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default eventsService;
