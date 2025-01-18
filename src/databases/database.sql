CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY UNIQUE,
  name VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar_url TEXT DEFAULT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY UNIQUE,
  creator_id uuid NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

CREATE TABLE users_likes (
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  PRIMARY KEY (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id)
);