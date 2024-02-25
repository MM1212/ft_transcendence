#!/bin/bash

cd src/server && pnpx prisma migrate dev --name prod &&  pnpx prisma migrate deploy

exec pnpm start:prod