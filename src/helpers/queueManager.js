import Queue from "bull";

export const emailCola = new Queue("email", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB,
  },
});

export const filesCola = new Queue("files_", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB,
  },
});

export const fileCola = new Queue("file", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB,
  },
});

export const fileUpdateCola = new Queue("fileUpdate", {
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      db: process.env.REDIS_DB,
    },
  });

export const fileCv = new Queue("fileCv", {
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      db: process.env.REDIS_DB,
    },
  });
