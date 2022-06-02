export interface PpPostwMeta {
  meta: PpMeta;
  posts: PpPost[];
}

export interface PpPost {
  post_id: number;
  user_id: string;
  post_content: string;
  post_category: string;
  datetime: string;
  tags: PpPostTag[];
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
  user_id: number;
  functionalarea_name: string;
  id_ad: number;
}

export interface PpCategory {
  id: number;
  category: string;
  direct_supervisor: boolean;
  status: boolean;
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
