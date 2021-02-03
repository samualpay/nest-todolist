# nest-todolist

## install nestjs cli

```bash
$ sudo npm i -g @nestjs/cli
```

## create nestjs project

```bash
$ nest new nest-todolist
```

## add todolist module controller service

```bash
$ nest g module todolist
$ nest g controller todolist
$ nest g service todolist
```

## add user module controller service

```bash
$ nest g module user
$ nest g controller user
$ nest g service user

```

## add class validator and class-transformer for validation pipe

```
$ npm i --save class-validator class-transformer
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
