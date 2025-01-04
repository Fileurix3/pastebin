# Pastebin

backend pastebin app

## install

- Clone the repository

  ```bash
  git clone https://github.com/Fileurix3/pastebin.git
  ```

- Go to the folder with this application

  ```bash
  cd pastebin
  ```

- Add an .env file with these parameters

  ```env
  COOKIE_SECRET="pastebin"
  JWT_SECRET="pastebin"

  MONGO_URL="mongodb://mongoPastebin:27017/pastebin"

  REDIS_HOST="redisPastebin"
  REDIS_PORT="6379"

  MINIO_END_POINT="redisPastebin"
  MINIO_PORT="9000"
  MINIO_USE_SSL="false"
  MINIO_ACCESS_KEY="minioAccessKey"
  MINIO_SECRET_KEY="minioSecretKey"
  ```

- Run using docker compose
  ```bash
  docker compose up
  ```

## Dependencies

- **[bcrypt](https://www.npmjs.com/package/bcrypt)**  
  for hashing passwords securely

- **[cookie-parser](https://www.npmjs.com/package/cookie-parser)**  
  to handle cookies in Express

- **[dotenv](https://www.npmjs.com/package/dotenv)**  
  to manage environment variables from a `.env` file

- **[email-validator](https://www.npmjs.com/package/email-validator)**  
  A simple module to validate an e-mail address

- **[express](https://www.npmjs.com/package/express)**  
  framework for building APIs and web applications

- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)**  
  for creating and verifying JSON Web Tokens (JWT) for secure user authentication

- **[mongoose](https://www.npmjs.com/package/mongoose)**  
  to work with mongodb

- **[redis](https://www.npmjs.com/package/redis)**  
  for caching and managing session data

- **[minio](https://www.npmjs.com/package/minio)**  
  MinIO JavaScript Library for Amazon S3 Compatible Cloud Storage

## Dev Dependencies

- **[@types/bcrypt](https://www.npmjs.com/package/@types/bcrypt)**  
  Type definitions for bcrypt

- **[@types/cookie-parser](https://www.npmjs.com/package/@types/cookie-parser)**  
  Type definitions for cookie-parser

- **[@types/express](https://www.npmjs.com/package/@types/express)**  
  Type definitions for Express

- **[@types/jsonwebtoken](https://www.npmjs.com/package/@types/jsonwebtoken)**  
  Type definitions for jsonwebtoken

- **[@types/node](https://www.npmjs.com/package/@types/node)**  
  Type definitions for Node.js

- **[chai](https://www.npmjs.com/package/chai)**  
  assertion library for testing

- **[mocha](https://www.npmjs.com/package/mocha)**  
  JavaScript test framework for Node.js

- **[nodemon](https://www.npmjs.com/package/nodemon)**  
  utility that automatically restarts the Node.js application when file changes are detected

- **[supertest](https://www.npmjs.com/package/supertest)**  
  library for testing HTTP servers

- **[typescript](https://www.npmjs.com/package/typescript)**  
  TypeScript compiler to add static types to JavaScript
