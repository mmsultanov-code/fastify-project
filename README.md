# Проект: Тестовое задание для покупки товаров

## Описание проекта

Этот проект был создан как тестовое задание и служит для того, чтобы пользователи из таблицы `users` могли покупать товары из предоставленного API. 

## Установка и настройка (docker)

Запустите команду

```bash
docker-compose up --build
```

После этого вам будет доступен адрес http://localhost:3000/, ниже вы можете увидеть доступные для вас ендпоинты

## Установка и настройка (local)

### Шаг 1: Настройка переменных окружения

Создайте файл `.env` в корне проекта и добавьте в него следующие данные:

```env
# Среда разработки
NODE_ENV=development

# Данные для тестовой базы данных
DB_HOST_DEV=хост базы данных
DB_USER_DEV=имя пользователя базы данных
DB_PASS_DEV=пароль пользователя базы данных
DB_NAME_DEV=имя базы данных
DB_PORT_DEV=порт базы данных
PORT_DEV=порт проекта, обычно это 3000 или 8000

# Данные для продуктивной базы данных
DB_HOST_PROD=хост базы данных
DB_USER_PROD=имя пользователя базы данных
DB_PASS_PROD=пароль пользователя базы данных
DB_NAME_PROD=имя базы данных
DB_PORT_PROD=порт базы данных
PORT_PROD=порт проекта, обычно это 3000 или 8000

SALT=1223213
JWT_SECRET=client_secret
```

## Шаг 2: Установка зависимостей

Выполните следующие команды в терминале:

```bash
npm install
npm install -g typescript @types/node
```

## Шаг 3: Запуск проекта

```bash
npm run dev
```

## Доступные маршруты

После запуска проект будет доступен на указанном в файле .env порту. Используйте следующие маршруты для взаимодействия с приложением:

- GET http://localhost:${port}/users/ - Показать всех пользователей
- POST http://localhost:${port}/user/login - передаются параметры:
```JSON
{
    "email": "test@example.com",
    "password": "password"
}
```
- PATCH http://localhost:${port}/user/change-password - передаются параметры:
```JSON
{
    "email": "test@example.com",
    "oldPassword": "password",
    "newPassword": "test"
}
```
- POST http://localhost:${port}/user/buy - передаются параметры:
```JSON
{
    "userId": 1,
    "amount": 10
}
```
- GET http://localhost:${port}/users/1 - Получить пользователя по id
- GET http://localhost:${port}/skin/ - Показать массив объектов из API (/v1/items)