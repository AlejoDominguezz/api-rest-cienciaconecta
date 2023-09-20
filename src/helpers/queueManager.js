import Queue from "bull";

export const emailCola = new Queue("email", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB,
  },
});
