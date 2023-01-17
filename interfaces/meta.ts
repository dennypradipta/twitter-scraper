export interface Meta {
  meta: {
    title?: string;
    url?: string;
  };
  og: {
    site_name?: string;
    type?: string;
    url?: string;
    title?: string;
    description?: string;
  };
  images?: DataImage[];
}

interface DataImage {
  src: string;
}
