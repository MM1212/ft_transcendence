#!/bin/bash

cd src/server && pnpx prisma migrate deploy

exec pnpm start:prod