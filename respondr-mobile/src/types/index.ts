export type BackendUser = {
  id: string;
  firebase_uid: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  role: 'resident' | 'official' | 'admin';
  is_active: boolean;
};

export type IncidentCategory = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  display_order: number;
  subcategories?: IncidentCategory[];
};

export type AlertItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
};

export type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export type IncidentSummary = {
  id: string;
  reported_by: string;
  title: string;
  description: string;
  incident_type: string;
  category_id: string | null;
  category_name: string | null;
  parent_category_name: string | null;
  latitude: number;
  longitude: number;
  status: string;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type IncidentAttachment = {
  id: string;
  incident_id: string;
  storage_path: string;
  file_url: string | null;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  uploaded_at: string;
};

export type IncidentResponse = {
  id: string;
  incident_id: string;
  responded_by: string;
  message: string;
  created_at: string;
  responded_by_first_name: string;
  responded_by_last_name: string;
};

export type IncidentDetail = IncidentSummary & {
  reported_by_first_name?: string;
  reported_by_last_name?: string;
  attachments: IncidentAttachment[];
  responses: IncidentResponse[];
};
