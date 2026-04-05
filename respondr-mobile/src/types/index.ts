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
