import type { Database } from '@/lib/supabase/types';

type Tables = Database['public']['Tables'];

export type CategoryRow = Tables['categories']['Row'];
export type Category = CategoryRow;

export type TagRow = Tables['tags']['Row'];
export type Tag = TagRow;

export type AuthorRow = Tables['authors']['Row'];
export type Author = AuthorRow;

export type CounselingProgramRow = Tables['counseling_programs']['Row'];
export type CounselingProgram = CounselingProgramRow;

export interface Reference {
  name: string;
  url: string;
  type: 'academic' | 'government' | 'industry';
  description?: string;
}

type PostRow = Tables['posts']['Row'];

/**
 * Post — DB row + 자주 동행하는 relations.
 * Supabase select('*, category:categories(*), author:authors(*)') 결과 형상.
 */
export type Post = Omit<PostRow, 'schema_markup' | 'references'> & {
  schema_markup: Record<string, unknown> | null;
  references: Reference[] | null;
  category?: Category | null;
  author?: Author | null;
  tags?: Tag[];
};
