COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: runtime-api
    env_file: ./apps/api/.env
    environment:
      PORT: "3001"
      NODE_ENV: "production"
      DATABASE_URL: "postgresql://postgres:postgres@db:5432/workright?schema=public"
      REDIS_URL: "redis://redis:6379"
      S3_ENDPOINT: "http://minio:9000"
      S3_ACCESS_KEY_ID: "minio"
      S3_SECRET_ACCESS_KEY: "minio123"
      S3_FORCE_PATH_STYLE: "true"
      S3_BUCKET: "workright-local"
      DEMO_MODE: "true"
      DEFAULT_LOCALE: "en-AU"
      ALLOWED_ORIGINS: "http://localhost:3000"
      AUTH_AUDIENCE: "workright-local"
      AUTH_SECRET: "iKvpXgCByUBLEfeMGsMv+H2oT7uI166SKgsUsEAyXysdVpM4NudWniM1wvnTypQ1Q7JS86T3BDKGLwwd1CIBeg=="
      AUTH_ISSUER: "http://localhost:3001/"
    depends_on:
      - db
      - redis
    ports:
      - "3001:3001"
    # Do NOT set `command:` here; let the image run /app/entrypoint.sh
