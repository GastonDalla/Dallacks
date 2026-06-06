import { z } from "zod";

export const trackSchema = z.object({
  id: z.string(),
  name: z.string(),
  artist: z.string(),
  track: z.string(),
  score: z.number().optional(),
  source: z.string().optional(),
  external_link: z.string().optional(),
  video_id: z.string().optional(),
  video_uri: z.string().optional(),
});
export type Track = z.infer<typeof trackSchema>;

export const paginationSchema = z.object({
  current_page: z.number().optional(),
  next_page: z.number().optional(),
  prev_page: z.number().optional(),
  total_pages: z.number().optional(),
});
export type Pagination = z.infer<typeof paginationSchema>;

export const metaSchema = z.object({
  count: z.number().optional(),
  has_more: z.boolean().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  total: z.number().optional(),
  query: z.string().optional(),
  source: z.string().optional(),
  request_id: z.string().optional(),
  timestamp: z.number().optional(),
  pagination: paginationSchema.optional(),
});
export type Meta = z.infer<typeof metaSchema>;

export const playlistSchema = z.object({
  id: z.number(),
  public_id: z.string(),
  name: z.string(),
  slug: z.string(),
  is_public: z.boolean(),
  track_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Playlist = z.infer<typeof playlistSchema>;

export const playlistDetailSchema = playlistSchema.extend({
  tracks: z.array(trackSchema).optional(),
});
export type PlaylistDetail = z.infer<typeof playlistDetailSchema>;

export const searchResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(trackSchema),
  meta: metaSchema,
});

export const trackResponseSchema = z.object({
  success: z.boolean(),
  data: trackSchema,
  meta: metaSchema,
});

export const similarDataSchema = z.object({
  source_track: trackSchema,
  similar_tracks: z.array(trackSchema),
});
export type SimilarData = z.infer<typeof similarDataSchema>;

export const similarResponseSchema = z.object({
  success: z.boolean(),
  data: similarDataSchema,
  meta: metaSchema,
});

export const lookupResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(trackSchema),
  meta: metaSchema,
});

export const bulkResultSchema = z.object({
  query: z.string(),
  track: trackSchema,
  similar_tracks: z.array(trackSchema),
});
export type BulkResult = z.infer<typeof bulkResultSchema>;

export const bulkDataSchema = z.object({
  results: z.array(bulkResultSchema),
  unmatched: z.array(z.string()),
});
export type BulkData = z.infer<typeof bulkDataSchema>;

export const bulkResponseSchema = z.object({
  success: z.boolean(),
  data: bulkDataSchema,
  meta: metaSchema,
});

export const playlistListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(playlistSchema),
  meta: metaSchema,
});

export const playlistResponseSchema = z.object({
  success: z.boolean(),
  data: playlistSchema,
  meta: metaSchema,
});

export const playlistDetailResponseSchema = z.object({
  success: z.boolean(),
  data: playlistDetailSchema,
  meta: metaSchema,
});

export const addTrackResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    message: z.string().optional(),
    playlist_id: z.number().optional(),
    track_id: z.string().optional(),
  }),
  meta: metaSchema,
});

export const errorResponseSchema = z.object({
  success: z.boolean().optional(),
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
  request_id: z.string().optional(),
  timestamp: z.number().optional(),
});
export type ApiErrorBody = z.infer<typeof errorResponseSchema>;

const yearRange = (key: string) =>
  z.coerce.number().int().min(1900).max(2030, `${key} out of range`);

export const searchQuerySchema = z.object({
  q: z.string().min(2, "query must be at least 2 characters").max(200),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const lookupQuerySchema = z.object({
  url: z.string().min(1, "url is required").max(2048),
});

export const similarFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  start_year: yearRange("start_year").optional(),
  end_year: yearRange("end_year").optional(),
  min_have: z.coerce.number().int().min(0).optional(),
  max_have: z.coerce.number().int().min(0).optional(),
  min_want: z.coerce.number().int().min(0).optional(),
  max_want: z.coerce.number().int().min(0).optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
});
export type SimilarFilters = z.infer<typeof similarFiltersSchema>;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const bulkRequestSchema = z.object({
  tracks: z.array(z.string().min(1)).min(1, "at least one track").max(50, "max 50 tracks"),
  similar_limit: z.number().int().min(1).max(100).optional(),
  start_year: z.number().int().min(1900).max(2030).optional(),
  end_year: z.number().int().min(1900).max(2030).optional(),
  min_have: z.number().int().min(0).optional(),
  max_have: z.number().int().min(0).optional(),
  min_want: z.number().int().min(0).optional(),
  max_want: z.number().int().min(0).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
});
export type BulkRequest = z.infer<typeof bulkRequestSchema>;

export const createPlaylistSchema = z.object({
  name: z.string().min(1, "name is required").max(200),
  is_public: z.boolean().optional(),
});
export type CreatePlaylistInput = z.infer<typeof createPlaylistSchema>;

export const updatePlaylistSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    is_public: z.boolean().optional(),
  })
  .refine((v) => v.name !== undefined || v.is_public !== undefined, {
    message: "provide at least one field to update",
  });
export type UpdatePlaylistInput = z.infer<typeof updatePlaylistSchema>;

export const addTrackSchema = z.object({
  track_id: z.string().min(1, "track_id is required"),
});
export type AddTrackInput = z.infer<typeof addTrackSchema>;
