import type { Track, Playlist } from "@/lib/cosine/schemas";

export const sourceTrack: Track = {
  id: "185450",
  name: "Joy Orbison - Hyph Mngo",
  artist: "Joy Orbison",
  track: "Hyph Mngo",
  source: "Discogs",
  external_link: "https://discogs.com/release/1921107",
  video_id: "FkUd5C8ApdI",
  video_uri: "https://www.youtube.com/watch?v=FkUd5C8ApdI",
};

export const similarTracks: Track[] = [
  {
    id: "264028",
    name: "Julio Bashmore - Battle For Middle You",
    artist: "Julio Bashmore",
    track: "Battle For Middle You",
    score: 0.87,
    source: "Discogs",
    external_link: "https://discogs.com/release/2685751",
    video_id: "kZOA4dysxDc",
    video_uri: "https://www.youtube.com/watch?v=kZOA4dysxDc",
  },
  {
    id: "5484799",
    name: "Blawan - Why They Hide Their Bodies Under My Garage",
    artist: "Blawan",
    track: "Why They Hide Their Bodies Under My Garage",
    score: 0.82,
    source: "Discogs",
    external_link: "https://discogs.com/release/3825372",
    video_id: "KL_Bbyi3ub8",
    video_uri: "https://www.youtube.com/watch?v=KL_Bbyi3ub8",
  },
];

export const searchResults: Track[] = [
  { id: "185450", name: "Joy Orbison - Hyph Mngo", artist: "Joy Orbison", track: "Hyph Mngo" },
  {
    id: "1446379",
    name: "Joy Orbison - Hyph Mngo (Andreas Saag's House Perspective)",
    artist: "Joy Orbison",
    track: "Hyph Mngo (Andreas Saag's House Perspective)",
  },
];

export const playlist: Playlist = {
  id: 1,
  public_id: "abc123",
  name: "cheeky bangers",
  slug: "cheeky-bangers",
  is_public: true,
  track_count: 3,
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-02-01T14:20:00Z",
};

export const baseMeta = {
  count: 2,
  total: 2,
  limit: 20,
  offset: 0,
  has_more: false,
  request_id: "req_test",
  timestamp: 1702123456,
};

export const searchResponse = { success: true, data: searchResults, meta: { ...baseMeta, query: "hyph mngo" } };
export const similarResponse = {
  success: true,
  data: { source_track: sourceTrack, similar_tracks: similarTracks },
  meta: baseMeta,
};
export const trackResponse = { success: true, data: sourceTrack, meta: { request_id: "req_test", timestamp: 1702123456 } };
export const lookupResponse = { success: true, data: [sourceTrack], meta: { ...baseMeta, count: 1, total: 1, source: "discogs" } };
export const bulkResponse = {
  success: true,
  data: {
    results: [{ query: "Joy Orbison - Hyph Mngo", track: sourceTrack, similar_tracks: similarTracks }],
    unmatched: [],
  },
  meta: baseMeta,
};
export const playlistListResponse = { success: true, data: [playlist], meta: { ...baseMeta, count: 1, total: 1 } };
export const playlistResponse = { success: true, data: playlist, meta: { request_id: "req_test", timestamp: 1702123456 } };
export const playlistDetailResponse = {
  success: true,
  data: { ...playlist, tracks: similarTracks },
  meta: { request_id: "req_test", timestamp: 1702123456 },
};

export const errorBody = (error: string, code: string, message: string) => ({
  success: false,
  error,
  code,
  message,
  request_id: "req_err",
  timestamp: 1702123456,
});
