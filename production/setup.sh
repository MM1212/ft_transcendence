make db_migrate name=production

exec "cd src/server && pnpm start:prod"