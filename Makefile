
ifndef mode
	mode = development
endif
MODE = $(mode)

SERVER_DIR = src/server
CLIENT_DIR = src/client
PROD_DIR = production

setup:
	npm i -g pnpm @nestjs/cli

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

env:
	cp envs/.env.$(MODE) envs/.env.tmp
	make generate_session_key
	make setup_tokens
	cp envs/.env.tmp $(SERVER_DIR)/.env
	cp envs/.env.tmp $(CLIENT_DIR)/.env
	cp envs/.env.tmp $(PROD_DIR)/.env
	rm envs/.env.tmp

server_dev: start_db
	cd $(SERVER_DIR) && pnpm start:dev

client_dev:
	cd $(CLIENT_DIR) && pnpm dev

start_db:
	docker compose -f $(PROD_DIR)/docker-compose.yml up -d

stop_db:
	docker compose -f $(PROD_DIR)/docker-compose.yml down

db_studio:
	cd $(SERVER_DIR) && pnpx prisma studio