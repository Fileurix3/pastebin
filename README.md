# Pastebin

**Pastebin** is a training project where I hone my programming skills.

## Main Stack

The core technologies used in this project are:

- [**Express.js**](https://expressjs.com/): To create an API for the application.
- [**MinIO**](https://min.io/): To store the content part of the post in blob storage.
- [**PostgreSQL**](https://www.postgresql.org/): To store other post data, such as `id`, `title`, `creator`, `content metadata`, `createdAt`, etc.
- [**Redis**](https://redis.io/): To cache frequently requested posts.
- [**Docker**](https://www.docker.com/): To containerize and build the entire project using **docker-compose**.

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

## Dependencies

The project uses the following dependencies:

### Dependencies

- **[bcrypt](https://www.npmjs.com/package/bcrypt)**: For securely hashing passwords.
- **[cookie-parser](https://www.npmjs.com/package/cookie-parser)**: To handle cookies in Express.
- **[dotenv](https://www.npmjs.com/package/dotenv)**: To manage environment variables from a `.env` file.
- **[email-validator](https://www.npmjs.com/package/email-validator)**: A simple module to validate email addresses.
- **[express](https://www.npmjs.com/package/express)**: A framework for building APIs and web applications.
- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)**: For creating and verifying JSON Web Tokens (JWT) for secure user authentication.
- **[@sequelize/core](https://www.npmjs.com/package/@sequelize/core)**: ORM for SQL, used to interact with PostgreSQL.
- **[@sequelize/postgres](https://www.npmjs.com/package/@sequelize/postgres)**: PostgreSQL dialect for Sequelize.
- **[redis](https://www.npmjs.com/package/redis)**: For caching and managing session data.
- **[minio](https://www.npmjs.com/package/minio)**: MinIO JavaScript Library for Amazon S3 compatible cloud storage.

### DevDependencies

- **[@types/bcrypt](https://www.npmjs.com/package/@types/bcrypt)**: Type definitions for bcrypt.
- **[@types/cookie-parser](https://www.npmjs.com/package/@types/cookie-parser)**: Type definitions for cookie-parser.
- **[@types/express](https://www.npmjs.com/package/@types/express)**: Type definitions for Express.
- **[@types/jsonwebtoken](https://www.npmjs.com/package/@types/jsonwebtoken)**: Type definitions for jsonwebtoken.
- **[@types/node](https://www.npmjs.com/package/@types/node)**: Type definitions for Node.js.
- **[chai](https://www.npmjs.com/package/chai)**: An assertion library for testing.
- **[mocha](https://www.npmjs.com/package/mocha)**: A JavaScript test framework for Node.js.
- **[nodemon](https://www.npmjs.com/package/nodemon)**: A utility that automatically restarts the Node.js application when file changes are detected.
- **[supertest](https://www.npmjs.com/package/supertest)**: A library for testing HTTP servers.
- **[typescript](https://www.npmjs.com/package/typescript)**: A TypeScript compiler to add static types to JavaScript.

---
