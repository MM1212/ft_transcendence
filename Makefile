
ifndef mode
	mode = development
endif
MODE = $(mode)

CP_CMD = cp

setup:
	npm i -g pnpm @nestjs/cli

env:
	cp envs/.env.$(MODE) src/backend/.env.local
	cp envs/.env.$(MODE) src/frontend/.env.local