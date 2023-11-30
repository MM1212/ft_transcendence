# ft_transcendence

## Setup

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js >=18.0](https://nodejs.org/en/download/) or [NVM](https://github.com/nvm-sh/nvm)
  - For NVM, run `nvm install 18.0` and `nvm use 18.0` in the project root directory
- [Intra Account and Application](https://profile.intra.42.fr/oauth/applications/new)
  - Give the Application a name
  - Give the Application a redirect URI
    - The URI should be `http://localhost:8000/auth/42/callback`

### Installation

- Clone the repository
- Copy the `envs/.tokens.env.example` file to `envs/.tokens.env`:
  - Copy the UID and SECRET to the `envs/.tokens.env` file and fill the `BACKEND_42_CLIENT_ID` and `BACKEND_42_CLIENT_SECRET` variables, respectively.
- Run `make env` to create the appropriate `.env` file in all the required directories
  - The command requires an `mode` argument, which will correspond to the `.env.<mode>`, by default it is `development`.
- Run `make setup` to download and setup:
  - PNPM
  - NestJS CLI
  - Download client dependencies
  - Download server dependencies
  - Setup prisma types & database schema

## Running

*most of these commands need to be in seperate terminals*
- `make client_dev` to run the client in development mode
- `make server_dev` to run the server in development mode
- `make db_studio` to see the database in the browser

## Development

### Environment Variables

- Update the `envs/.env.<mode>` file to add/update/remove environment variables
- Run `make env` to update the `.env` files in all the required directories
- Edit the `typings/env.d.ts` file to add/update/remove environment variables types
- Restart the server/client to apply the changes

### Database

- Edit the `server/prisma/schema.prisma` file to update the database schema
- Run `make db_generate` to generate the database schema
- Run `make db_migrate` to apply the changes to the database
- Run `make db_studio` to see the database in the browser