FROM php:8.4-fpm

ARG APP_ENV=local

RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev \
    libicu-dev libexif-dev libjpeg62-turbo-dev libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo_mysql bcmath exif gd intl mbstring opcache pcntl zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini

RUN groupadd -g 1000 www && useradd -u 1000 -ms /bin/bash -g www www

USER www
