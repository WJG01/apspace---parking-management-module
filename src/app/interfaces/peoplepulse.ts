export interface PpPostwMeta {
  meta: PpMeta;
  posts: PpPost[];
}

export interface PpPost {
  post_id: number;
  post_content: string;
  post_category: PpCategory;
  datetime: string;
  user_id: PpStaff;
  // TODO: change to proper type definition later
  tags: any;
}

export interface PpPostTag {
  post_id: number;
  staff_id: string;
  tag_id: string;
}

export interface PpMeta {
  has_next: boolean;
  next_page: number;
  page: number;
  pages: number;
}

export interface PpFunctionalArea {
  functional_area_id: string;
  functional_area: number;
}

export interface PpCategory {
  id: number;
  category: string;
  direct_supervisor: boolean;
  status: boolean;
}

export interface PpStaff {
  id: string;
  name: string;
  job_title: string;
  profile_picture_uri: string;
  status: boolean;
  user_acl: boolean;
  admin_access: boolean;
  functional_area_id: { functional_area: string; functional_area_id: number };
}

// for categories & functional areas
export interface PpFilterOptionsSelectable {
  name: string;
  selected: boolean;
}

export interface PpFilterOptions {
  sortBy: string; // Name | Date
  isSortedAsc: boolean;
  categories: PpFilterOptionsSelectable[];
  funcAreas: PpFilterOptionsSelectable[];
}
