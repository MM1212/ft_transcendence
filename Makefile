
ifndef mode
	mode = development
endif
MODE = $(mode)

SERVER_DIR = src/server
CLIENT_DIR = src/client
PROD_DIR = production


DB_FILE = $(SERVER_DIR)/prisma/schema.prisma
DB_MIGRATE_FILE = $(SERVER_DIR)/prisma/migrations/.schema.prisma
DB_COMPOSE_FILE = $(PROD_DIR)/docker-compose.yml

IS_LINUX = 1
ifeq ($(OS), Windows_NT)
IS_LINUX = 0
endif

CP = cp
ifeq ($(IS_LINUX), 0)
CP = copy
endif

setup:
ifeq ($(shell test envs/.tokens.env), 1)
	$(error Setup the tokens file before setting up everything!)
endif
	$(MAKE) env
	git lfs pull
	npm i -g pnpm
	npm i -g pnpm @nestjs/cli
	cd $(CLIENT_DIR) && pnpm i
	$(MAKE) client_gen_icon icon=--all
	$(MAKE) db_start
	cd $(SERVER_DIR) && pnpm i && pnpx prisma generate && pnpx prisma migrate dev --name init

create_session_tokens:
# generate session key	
	openssl rand -base64 32 > .session.key
# generate session salt with 16 chars
	openssl rand -base64 16 | head -c 16 > .session.salt


generate_session_key: create_session_tokens
	sed "s/<session_secret_key>/$(shell cat .session.key | sed 's/\//\\\//g')/g" envs/.env.tmp > envs/.env.secret.tmp
	mv envs/.env.secret.tmp envs/.env.tmp
	rm .session.key
	sed "s/<session_secret_salt>/$(shell cat .session.salt | sed 's/\//\\\//g')/g" envs/.env.tmp > envs/.env.secret.tmp
	mv envs/.env.secret.tmp envs/.env.tmp
	rm .session.salt

setup_tokens:
ifeq ($(shell test envs/.tokens.env), 1)
	echo "Setup the tokens file before setting up the env!"
else
	echo "\n\n# TOKENS\n" >> envs/.env.tmp
	cat envs/.tokens.env >> envs/.env.tmp
	echo "" >> envs/.env.tmp
endif

env: envs/.active.env

envs/.active.env: envs/.env.$(MODE) envs/.tokens.env
ifneq ($(IS_LINUX), 1)
	$(error This Makefile is only for Linux atm)
endif
	cp envs/.env.$(MODE) envs/.env.tmp
	make generate_session_key
	make setup_tokens
	cp envs/.env.tmp $(SERVER_DIR)/.env
	cp envs/.env.tmp $(CLIENT_DIR)/.env
	cp envs/.env.tmp $(PROD_DIR)/.env
	cp envs/.env.tmp envs/.active.env
	rm envs/.env.tmp


server_dev:
	cd $(SERVER_DIR) && pnpm start:dev

client_dev:
	cd $(CLIENT_DIR) && pnpm dev

client_gen_icon:
ifndef icon
	$(error icon is not set, use `make client_gen_icon icon=<icon>`)
else
ifeq ($(icon), --all)
	@cd $(CLIENT_DIR) && node scripts/generate-all.js
else
	@cd $(CLIENT_DIR) && node scripts/generate-icon.js $(icon)
endif
endif

ifeq ($(back), true)
BACK_PAPER_FLAG="--back-paper"
endif
client_gen_clothing:
ifndef id
	$(error id is not set, use `make client_gen_clothing id=<id>`)
else
	@cd $(CLIENT_DIR) && node scripts/generate-clothing-item.js $(id) $(BACK_PAPER_FLAG)
endif

db_start:
ifneq ($(IS_LINUX), 1)
	$(error This Makefile is only for Linux atm)
endif
	docker compose -f $(DB_COMPOSE_FILE) up -d

db_stop:
ifneq ($(IS_LINUX), 1)
	$(error This Makefile is only for Linux atm)
endif
	docker compose -f $(DB_COMPOSE_FILE) down

db_studio:
	cd $(SERVER_DIR) && pnpx prisma studio

db_generate:
	cd $(SERVER_DIR) && pnpx prisma generate

db_migrate: $(DB_MIGRATE_FILE)

$(DB_MIGRATE_FILE): $(DB_FILE)
ifndef name
	$(error name is not set, use `make db_migrate name=<name>`)
else
	cd $(SERVER_DIR) && pnpx prisma migrate dev --name $(name)
endif
	$(CP) $(DB_FILE) $(DB_MIGRATE_FILE)
$(DB_FILE):

db_rebuild:
	cd $(SERVER_DIR) && pnpx prisma migrate reset --force && pnpx prisma migrate dev --name init

prod_build:
	$(MAKE) env mode=production
	$(MAKE) db_migrate name=prod
	cd $(CLIENT_DIR) && pnpm build
	cd $(SERVER_DIR) && pnpm build
	cp -r $(CLIENT_DIR)/dist $(SERVER_DIR)/dist/public

prod_start:
	cd $(SERVER_DIR) && pnpm start:prod
