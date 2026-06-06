import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./msw/server";

process.env.COSINE_API_KEY ||= "test-api-key";
process.env.COSINE_API_BASE_URL ||= "https://cosine.club/api/v1";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
