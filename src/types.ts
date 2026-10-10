export interface SlideItem {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  tag: string;
  highlights: { label: string; val: string }[];
  accentColor: string;
  graphicType: 'production' | 'costs' | 'logistics' | 'aloe';
}

export interface AccessRole {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge: string;
  color: string;
}

export interface UserSession {
  email: string;
  name: string;
  role: string;
}
