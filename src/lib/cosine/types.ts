import type { Meta } from "./schemas";

export type {
  Track,
  Meta,
  Pagination,
  Playlist,
  PlaylistDetail,
  SimilarData,
  BulkResult,
  BulkData,
  SearchQuery,
  SimilarFilters,
  BulkRequest,
  CreatePlaylistInput,
  UpdatePlaylistInput,
  AddTrackInput,
} from "./schemas";

export type ApiOk<T> = { ok: true; data: T; meta?: Meta };
export type ApiFail = {
  ok: false;
  error: { code: string; message: string; status: number };
};
export type ApiResult<T> = ApiOk<T> | ApiFail;
