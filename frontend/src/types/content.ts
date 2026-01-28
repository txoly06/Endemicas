export interface EducationalContent {
    id: number;
    title: string;
    slug: string;
    type: 'guide' | 'video' | 'article';
    excerpt: string;
    content: string; // HTML or Markdown
    is_published: boolean;
    created_at: string;
}
