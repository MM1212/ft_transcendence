# FT_TRANSCENDENCE - DOJO PONG

Inserir aqui uma imagem

## Table of Contents

- [Description](#description)
- [Technologies Used](#technologies-used)
- [To Run](#to-run)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Extras](#extras)
- [Features](#features)
  - [Lobby](#lobby)
  - [Pong](#pong)
  - [Chat](#chat)
  - [Profile](#profile)
  - [Ranking System](#ranking-system)
  - [Match History](#match-history)
  - [Customization and Shop](#customization-and-shop)
- [Done By](#done-by)

## Description

Welcome to the repository of our last 42 common core project!
The aim of this project was to create a social network to be used by 42 students. We wanted to give it a little twist and make it fun for everyone to interact with each other, so we decided to give birth to our lovely, Dojo Pong!
In Dojo Pong, the students of 42 can join a lobby in penguin form and be there with their friends! They can buy items, play pong, talk to each other on the chat, create chat groups, have a ranking for some competitiveness and much more!
Check it out and have fun!

## Technologies Used

### Server

- [TypeScript](https://www.typescriptlang.org/): TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.
- [Nest.JS](https://nestjs.com/): A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- [Server Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events): Server-sent events (SSE) is a technology where a browser receives automatic updates from a server via an HTTP connection. Used for real-time data propagation without the *need for speed* or websockets.
- [Websockets with Socket.IO](https://socket.io/): Socket.IO enables real-time, bidirectional and event-based communication. Used for the main lobby and pong game.

### Database

- [PostgreSQL](https://www.postgresql.org/): PostgreSQL is a powerful, open source object-relational database system.
- [Prisma](https://www.prisma.io/): Prisma is a next-generation ORM that can be used to interact with a database and write OOP-like queries.

### Client

- [TypeScript](https://www.typescriptlang.org/): TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.
- [React](https://reactjs.org/): A JavaScript library for building user interfaces.
- [MUI Joy](https://mui.com/joy-ui/getting-started/): A set of components for building a UI with Material-UI. Used as the base for the whole client application (with some custom components imported from MUI Material).
- [Recoil](https://recoiljs.org/): Recoil is an experimental state management library for React apps. It provides several capabilities that are difficult to achieve with React alone, while being compatible with the newest features of React. Used as our main state storage for the whole client.
- [MDI](https://materialdesignicons.com/): Material Design Icons' growing icon collection allows designers and developers targeting various platforms to download icons in the format, color and size they need for any project.
- [PixiJS](https://www.pixijs.com/): The HTML5 Creation Engine. Create beautiful digital content with the fastest, most flexible 2D WebGL renderer. Used to draw the main lobby, customization tab and the pong game.

## To Run

### Prerequisites

- [42 Client Application](https://intra.42.fr)
- [Make](https://www.gnu.org/software/make/)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

- Clone the repository
- In `envs` folder:
  - Duplicate `.tokens.env.example`, rename to `.tokens.env` and fill in the environment variables:
    - 42_CLIENT_ID: Your 42 application's client id
    - 42_SECRET: Your 42 application's secret
    - SENTRY_DSN: Your Sentry DSN (optional)
- Run `make env` to create the environment files for the compose to get the environment variables.
- Run `make client_download_assets` to download the assets for the lobby. This will take a while. We didn't include the assets in the repository due to (obvious) legal reasons.
- Run `docker compose up --build` to build and start the application.
- Access the application at `http://localhost:3000`.

### Extras

- Edit `envs/.env.production` to change the server's port and the listening interfaces.

## Features

### Lobby

In the lobby you can show off your style! Put on your best outfit and make everyone jealous with your swag.

### Pong

The pong game can be played in the old classical way, OR you can play it differently! You can play it with Special Powers!
The special powers are:

- Fire -> which shoots a fireball, that when it hits the ball, pushes the ball back to your paddle and gives you a cannon to shoot the ball
- Ice -> which shoots a iceball, that when it hits the other player's paddle, slows it, and if the player gets hit again a short amount of time, the paddle will freeze!
- Bubble -> which shoots a bubble, that when it hits the ball, reflects based on the collision point and increases the ball's speed. You can shoot a lot of them at the same time! eheh
- Spark -> which shoots a reverse ball, that when it hits the other player's paddle, it will invert it's controls.
- Ghost -> which shoots a cute ghost, that when it hits any object on the field, it will make it disappear for a short amount of time.
You also have mana and energy that regenerates over time! Use it wisely!

### Chat

In the chat, you can talk to EVERYONE. Chat with who you like. Block who you don't. Send images and gifs. Send invites for Pong. Change some memes with your good friends. Create a group for you and your friends to arrange some pong matches. The chat is yours to use!

### Profile

In the profile you can find all the user's information. You can text them, see their stats, their ranking and the match history.

### Ranking System

The ranking every player starts with is 1000. Every loss and win will take or give points to the player. The amount of points will be based on the difference of points between the players.

### Match History

In the match history you can see all the matches you played. You can see the date, the opponent, the result and the points you won or lost.
It also have some stats to see your performance.

### Customization and Shop

The customization tab is where you get to dress your little penguin. Change his/her color, put on some clothes individually or just put on a full outfit.
Show your personality and style through your penguin's smile!

All of these can be accquired in the shop. There you can also find some paddle skins, special powers and ball skins! Don't forget to get your unique icon!

### Done By

- [António](https://github.com/Grubben)
- [David](https://github.com/dadoming)
- [Henrique](https://github.com/htomas-d)
- [Mário](https://github.com/Mgranatels)
- [Martim](https://github.com/MM1212)
