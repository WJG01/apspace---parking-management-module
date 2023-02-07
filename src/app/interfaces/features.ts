export interface Features {
  id: number;
  title: string;
  summary: string;
  imgUrl: string;
  slides: Slide[];
}

export interface Slide {
  slideID: number;
  imgUrl: string;
  title: string;
  description: string;
  hasButton?: boolean;
  buttonTitle: string;
  buttonRoute: string;
}
