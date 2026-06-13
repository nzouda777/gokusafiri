.PHONY: up down sh artisan test migrate seed fresh logs build

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build --no-cache

sh:
	docker compose exec app bash

artisan:
	docker compose exec app php artisan $(cmd)

test:
	docker compose exec app php artisan test

migrate:
	docker compose exec app php artisan migrate

seed:
	docker compose exec app php artisan db:seed

fresh:
	docker compose exec app php artisan migrate:fresh --seed

logs:
	docker compose logs -f app horizon scheduler

pint:
	docker compose exec app ./vendor/bin/pint

horizon:
	docker compose exec app php artisan horizon

horizon-pause:
	docker compose exec app php artisan horizon:pause

horizon-continue:
	docker compose exec app php artisan horizon:continue
