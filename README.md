# Pastebin

**Pastebin** is a training project where I hone my programming skills.

## Main Stack

The core technologies used in this project are:

- [**Express.js**](https://expressjs.com/): To create an API for the application.
- [**MinIO**](https://min.io/): To store the content part of the post in blob storage.
- [**PostgreSQL**](https://www.postgresql.org/): To store other post data, such as `id`, `title`, `creator`, `content metadata`, `createdAt`, etc.
- [**Redis**](https://redis.io/): To cache frequently requested posts.
- [**Docker**](https://www.docker.com/): To containerize and build the entire project using **docker-compose**.
- [**jest**](https://jestjs.io/) + [**supertest**](https://github.com/ladjs/supertest#readme): To test this project.
- [**Swagger**](https://swagger.io/): For the documentation api.

---

## Installation

Follow these steps to set up and run the project:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Fileurix3/pastebin.git
   ```

2. **Navigate to the Project Folder**

   ```bash
   cd pastebin
   ```

3. **Add a `.env` File**

   Create a `.env` file in the root directory with the following parameters:

   ```env
   COOKIE_SECRET="pastebin"
   JWT_SECRET="pastebin"

   DB_NAME="pastebin"
   DB_USER="postgres"
   DB_PASSWORD="password"
   DB_HOST="postgresPastebin"
   DB_PORT="5432"

   REDIS_HOST="redisPastebin"
   REDIS_PORT="6379"

   MINIO_END_POINT="minioPastebin"
   MINIO_PORT="9000"
   MINIO_USE_SSL="false"
   MINIO_ACCESS_KEY="minioAccessKey"
   MINIO_SECRET_KEY="minioSecretKey"
   ```

4. **Run the Project Using Docker Compose**

   ```bash
   docker compose up
   ```

---
