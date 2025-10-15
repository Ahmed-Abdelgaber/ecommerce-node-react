process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "file:./dev.db";
process.env.JWT_SECRET ??=
  "test-secret-should-be-at-least-32-chars-long!";
process.env.ACCESS_TOKEN_TTL ??= "15m";
process.env.REFRESH_TOKEN_TTL ??= "7d";
