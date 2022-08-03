export interface News {
  id: string;
  date: Date;
  date_gmt: Date;
  author: string;
  categories: string[];
  comment_status: string;
  content: Content;
  excerpt: Excerpt;
  featured_media: string;
  format: string;
  guid: Guid;
  link: string;
  meta: any[];
  modified: Date;
  modified_gmt: Date;
  ping_status: string;
  post_meta_fields: any;
  slug: string;
  status: string;
  sticky: boolean;
  tags: any[];
  template: string;
  title: Title;
  type: string;
  featured_media_source?: any;
  featured_image_src?: string;
}

export interface Content {
  protected: boolean;
  rendered: string;
}

export interface Excerpt {
  protected: boolean;
  rendered: string;
}

export interface Guid {
  rendered: string;
}

export interface Title {
  rendered: string;
}

export interface ImageSource {
  id: string;
  source_url: string;
}

export interface ShortNews {
  url: string;
  title: string;
  updated: Date | string;
  body: string;
}

