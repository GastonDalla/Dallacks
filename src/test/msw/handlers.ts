import { http, HttpResponse } from "msw";
import * as fx from "../fixtures";

export const COSINE_BASE = "https://cosine.club/api/v1";

export const handlers = [
  http.get(`${COSINE_BASE}/search`, () => HttpResponse.json(fx.searchResponse)),
  http.post(`${COSINE_BASE}/search/bulk`, () => HttpResponse.json(fx.bulkResponse)),
  http.get(`${COSINE_BASE}/tracks/lookup`, () => HttpResponse.json(fx.lookupResponse)),
  http.get(`${COSINE_BASE}/tracks/:id/similar`, () => HttpResponse.json(fx.similarResponse)),
  http.get(`${COSINE_BASE}/tracks/:id`, () => HttpResponse.json(fx.trackResponse)),
  http.get(`${COSINE_BASE}/playlists/:id/tracks`, () => HttpResponse.json(fx.searchResponse)),
  http.post(`${COSINE_BASE}/playlists/:id/tracks`, () =>
    HttpResponse.json({ success: true, data: { message: "added", playlist_id: 1, track_id: "264028" }, meta: {} }),
  ),
  http.delete(`${COSINE_BASE}/playlists/:id/tracks/:trackId`, () => new HttpResponse(null, { status: 204 })),
  http.get(`${COSINE_BASE}/playlists/:id`, () => HttpResponse.json(fx.playlistDetailResponse)),
  http.put(`${COSINE_BASE}/playlists/:id`, () => HttpResponse.json(fx.playlistResponse)),
  http.delete(`${COSINE_BASE}/playlists/:id`, () => new HttpResponse(null, { status: 204 })),
  http.get(`${COSINE_BASE}/playlists`, () => HttpResponse.json(fx.playlistListResponse)),
  http.post(`${COSINE_BASE}/playlists`, () => HttpResponse.json(fx.playlistResponse, { status: 201 })),
];
