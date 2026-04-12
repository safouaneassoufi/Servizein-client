export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  priceType: 'FIXED' | 'QUOTE';
  price: number | null;
  duration: number | null;
  imageUrl: string | null;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
}

export interface Provider {
  id: string;
  bio: string | null;
  experience: number;
  verified: boolean;
  available: boolean;
  city: string | null;
  zone: string | null;
  averageRating: number;
  reviewCount: number;
  completedJobs: number;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  services: Service[];
}
