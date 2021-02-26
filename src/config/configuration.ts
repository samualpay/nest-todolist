export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || 'root',
    database: process.env.DATABASE_DB || 'todolist',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
  },
  log: {
    level: process.env.LOG_LEVEL || 'debug',
    pretty: process.env.LOG_PRETTY || 'true',
  },
  swagger: {
    visible: process.env.SWAGGER_VISIBLE || 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '31qaz2wsx',
    expires: process.env.JWT_EXPIRES || '60',
  },
});
