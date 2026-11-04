# Локальная PostgreSQL 18.6

Эта конфигурация предназначена для отдельной локальной базы PaintShop. Она не
подключает backend и не запускает EF-миграции или восстановление автоматически.
Команды ниже выполнять только после отдельного разрешения на соответствующие
изменения. Запускать их из корня репозитория.

## Роли и хранение данных

- `paintshop_admin` — начальный суперпользователь, только для администрирования.
- `paintshop_migrator` — владелец базы и восстановленных объектов; не имеет
  `SUPERUSER`, `CREATEDB` или `CREATEROLE`.
- `paintshop_app` — роль приложения; получает права на прикладные таблицы только
  после восстановления. На схему получает только `USAGE`, а на историю миграций
  прав не получает.

Схема `public` принадлежит `pg_database_owner`, поэтому владелец базы управляет
ею. Права на новые таблицы после будущих миграций нужно выдавать отдельно.
Данные сохраняются в volume `paintshop_pg18_data`; порт доступен на хосте только
через `127.0.0.1:5434`. Контейнер и volume проверки на порту 5433 не используются.

## Подготовка секретов

До первой команды Compose подготовьте три разных секрета вне репозитория.
Приведённая ACL рассчитана на обычный rootful Docker **без** user namespace
remapping: пользователь `postgres` официального образа имеет UID 999. Сначала
проверьте `docker info --format '{{json .SecurityOptions}}'`; при rootless Docker
или remapping остановитесь и определите отображение UID отдельно. Убедитесь, что
каталог и файлы не содержат ранее созданных секретов: код ниже не перезаписывает
файлы, но может создать часть из них до обнаружения конфликта.

```bash
secret_dir="$HOME/.local/share/paintshop/secrets"
install -d -m 700 "$secret_dir"
(
  set -eu -o noclobber
  umask 077
  for role in admin migrator app; do
    openssl rand -hex 32 > "$secret_dir/$role"
  done
)
setfacl -m u:999:r-- "$secret_dir/admin" "$secret_dir/migrator" "$secret_dir/app"
getfacl "$secret_dir" "$secret_dir/admin" "$secret_dir/migrator" "$secret_dir/app"
```

Родительский каталог остаётся `0700`; ACL разрешает UID 999 читать только файлы
секретов, смонтированные в контейнер. Docker Compose использует для файловых
secrets bind mount и не применяет для них `uid`, `gid` и `mode`. Это не
зашифрованное хранилище: доступ к Docker daemon и процессам контейнера является
привилегированным. Не выводите содержимое файлов и не включайте shell tracing.

`docker compose config --quiet` можно выполнять только после подготовки файлов
secrets. Само создание секретов и запуск Docker требуют отдельного разрешения.

## Первый запуск

Убедитесь, что Docker доступен, порт `127.0.0.1:5434` свободен, проект
`paintshop-local-pg18` не занят, а volume `paintshop_pg18_data` отсутствует.
Если volume уже существует, остановитесь: нельзя предполагать, что он пустой.
Например, проверьте `docker compose ls -a`, `docker volume inspect
paintshop_pg18_data` и `ss -ltn`. Не удаляйте обнаруженный volume.

Следующая проверка создаёт временный контейнер и может создать именованный volume,
но не инициализирует кластер PostgreSQL. Выполняйте её только после проверки
отсутствия volume, указанной выше. Она проверяет доступность secrets без вывода
значений:

```bash
docker compose run --rm --no-deps --user 999:999 --entrypoint sh db -ec '
  test -r /run/secrets/paintshop_admin_password
  test -r /run/secrets/paintshop_migrator_password
  test -r /run/secrets/paintshop_app_password
'
```

Если проверка завершилась ошибкой, остановитесь и проверьте права на secrets.
Volume, созданный этой проверкой, не является ранее существовавшей БД: его не
нужно удалять. После успешной проверки убедитесь, что других операций с этим
volume не выполнялось, и запустите инициализацию:

```bash
docker compose up -d db
docker compose ps
```

Healthcheck использует TCP и проверяет готовность сервера, но не аутентификацию.
Если инициализация завершилась ошибкой, остановитесь и исследуйте состояние.
Entry point не повторяет init-скрипты на уже инициализированном volume. Не
удаляйте и не пересоздавайте его для исправления без отдельного разрешения.

## Восстановление архива

Восстанавливать только в новую пустую базу `paintshop`, после проверки здоровья
сервера. Не использовать `--clean`, не удалять базу или volume и не повторять
восстановление в непустую базу. Архив не копируется и не изменяется.

1. Проверьте пустоту схемы. Результат должен быть `0`; иначе остановитесь:

   ```bash
   docker compose exec -T --user postgres db psql -X --no-password \
     -U paintshop_migrator -d paintshop -v ON_ERROR_STOP=1 -Atc '
     SELECT (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname = '\''public'\'')
          + (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname = '\''public'\'')
          + (SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname = '\''public'\'' AND t.typrelid = 0);'
   ```

2. Получите и изучите фактический TOC. Исходный архив был проверен ранее, но
   локальный TOC необходимо проверить перед каждым первым восстановлением:

   ```bash
   umask 077
   DUMP="$HOME/paintshop-backups/supabase-2026-11-04/paintshop-public.dump"
   WORK="$HOME/.local/share/paintshop/restore"
   install -d -m 700 "$WORK"
   docker compose exec -T --user postgres db pg_restore --list < "$DUMP" > "$WORK/archive.toc"
   cat "$WORK/archive.toc"
   ```

3. Подготовьте список для восстановления, исключив создание уже существующей
   схемы `public`, ACL, default ACL и политики. `--no-owner` и `--no-acl` также
   исключают исходных владельцев и привилегии Supabase:

   ```bash
   awk '/^[0-9]+; [0-9]+ [0-9]+ (SCHEMA - public |ACL |DEFAULT ACL |POLICY )/ {$0=";" $0} {print}' \
     "$WORK/archive.toc" > "$WORK/restore.toc"
   diff -u "$WORK/archive.toc" "$WORK/restore.toc"
   ```

   `diff` возвращает код 1, когда исключённые записи найдены. Просмотрите оба
   списка. Убедитесь, что сохранены все четыре таблицы и их `TABLE DATA`,
   `Categories_Id_seq` и `SEQUENCE SET`, восемь индексов, ограничения и три
   внешних ключа. Не удаляйте записи только по их названию или числу. Если есть
   неизвестные объекты, зависимости от Supabase, ролей или расширений,
   остановитесь для отдельного решения. Записи `ROW SECURITY` можно оставить:
   следующий SQL-файл отключает RLS после восстановления.

4. Скопируйте проверенный TOC и предоставьте чтение только системному пользователю
   `postgres`. `docker compose cp` может создать файл с владельцем root:

   ```bash
   docker compose cp "$WORK/restore.toc" db:/tmp/paintshop-restore.toc
   docker compose exec -T --user 0 db chown postgres:postgres /tmp/paintshop-restore.toc
   docker compose exec -T --user 0 db chmod 600 /tmp/paintshop-restore.toc
   docker compose exec -T --user postgres db test -r /tmp/paintshop-restore.toc

   docker compose exec -T --user postgres db pg_restore \
     --username=paintshop_migrator --dbname=paintshop --no-password \
     --no-owner --no-acl --single-transaction --exit-on-error \
     --use-list=/tmp/paintshop-restore.toc < "$DUMP"
   ```

   Это локальное socket-подключение к новому контейнеру; стандартный образ
   разрешает доверенную аутентификацию через него. Наличие доступа к Docker
   daemon позволяет использовать этот socket и является привилегированным.
   При ошибке остановитесь и исследуйте состояние; не выполняйте автоматический
   повтор или очистку.

5. Только после успешного восстановления отключите RLS и выдайте права:

   ```bash
   docker compose exec -T --user postgres db psql -X --no-password \
     -U paintshop_migrator -d paintshop -v ON_ERROR_STOP=1 \
     < docker/postgres/post-restore.sql
   ```

## Проверка после восстановления

Проверить версию сервера, владельцев, права и состояние данных через миграционную
роль, без изменения строк. Ожидаемый ориентир из проверочного восстановления:
`Products` — 5, `Categories` — 61, `ProductCategories` — 5,
`__EFMigrationsHistory` — 3, восемь индексов и три внешних ключа;
`Categories_Id_seq`: `last_value = 63`, `is_called = true`. Сравнить идентификаторы
миграций с тремя файлами миграций в репозитории и убедиться, что RLS и политики
отсутствуют для четырёх таблиц.

Парольную аутентификацию каждой роли проверьте отдельно по TCP. Временный
`PGPASSFILE` создаётся в `/dev/shm` с режимом `0600`, пароль не попадает в argv;
команда удаляет файл при завершении. Запустить для `app` и `migrator`:

```bash
for role in app migrator; do
  docker compose exec -T --user postgres db sh -eu -c '
    role="$1"
    umask 077
    passfile=$(mktemp /dev/shm/paintshop-pgpass.XXXXXX)
    trap '\''rm -f "$passfile"'\'' EXIT HUP INT TERM
    printf "127.0.0.1:5432:paintshop:paintshop_%s:%s\n" \
      "$role" "$(cat "/run/secrets/paintshop_${role}_password")" > "$passfile"
    PGPASSFILE="$passfile" psql -X -w -h 127.0.0.1 -p 5432 \
      -U "paintshop_$role" -d paintshop -v ON_ERROR_STOP=1 \
      -c "SELECT current_user, current_database(), inet_client_addr(), version();"
  ' sh "$role"
done
```

Проверки метаданных можно выполнить так:

```bash
docker compose exec -T --user postgres db psql -X --no-password \
  -U paintshop_migrator -d paintshop -v ON_ERROR_STOP=1 <<'SQL'
SELECT count(*) AS products FROM public."Products";
SELECT count(*) AS categories FROM public."Categories";
SELECT count(*) AS product_categories FROM public."ProductCategories";
SELECT "MigrationId", "ProductVersion" FROM public."__EFMigrationsHistory" ORDER BY 1;
SELECT last_value, is_called FROM public."Categories_Id_seq";
SELECT schemaname, tablename, indexname FROM pg_indexes
 WHERE schemaname = 'public' ORDER BY tablename, indexname;
SELECT conname, conrelid::regclass, confrelid::regclass FROM pg_constraint
 WHERE contype = 'f' AND connamespace = 'public'::regnamespace ORDER BY conname;
SELECT c.relname, pg_get_userbyid(c.relowner) AS owner, c.relrowsecurity, c.relforcerowsecurity
 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
 WHERE n.nspname = 'public' AND c.relname IN
 ('Products', 'Categories', 'ProductCategories', '__EFMigrationsHistory', 'Categories_Id_seq')
 ORDER BY c.relname;
SELECT schemaname, tablename, policyname FROM pg_policies
 WHERE schemaname = 'public' AND tablename IN
 ('Products', 'Categories', 'ProductCategories', '__EFMigrationsHistory');
SELECT pg_get_userbyid(datdba) AS database_owner FROM pg_database WHERE datname = 'paintshop';
SELECT pg_get_userbyid(nspowner) AS schema_owner FROM pg_namespace WHERE nspname = 'public';
SELECT rolname, rolcanlogin, rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls
 FROM pg_roles WHERE rolname IN ('paintshop_app', 'paintshop_migrator') ORDER BY rolname;
SELECT pg_has_role('paintshop_app', 'paintshop_migrator', 'MEMBER') AS app_is_migrator,
 has_database_privilege('paintshop_app', 'paintshop', 'CONNECT') AS app_connect,
 has_database_privilege('paintshop_app', 'paintshop', 'CREATE') AS app_database_create,
 has_database_privilege('paintshop_app', 'paintshop', 'TEMP') AS app_database_temp,
 has_schema_privilege('paintshop_app', 'public', 'USAGE') AS app_schema_usage,
 has_schema_privilege('paintshop_app', 'public', 'CREATE') AS app_schema_create,
 has_table_privilege('paintshop_app', 'public."__EFMigrationsHistory"', 'SELECT') AS app_history_select,
 has_sequence_privilege('paintshop_app', 'public."Categories_Id_seq"', 'USAGE') AS app_sequence_usage;
SELECT table_name, privilege,
 has_table_privilege('paintshop_app', format('public.%I', table_name), privilege) AS granted
 FROM unnest(ARRAY['Products','Categories','ProductCategories']) AS t(table_name)
 CROSS JOIN unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) AS p(privilege)
 ORDER BY table_name, privilege;
SQL
```

На трёх прикладных таблицах app получает `SELECT`, `INSERT`, `UPDATE`, `DELETE`,
но не `TRUNCATE`, `REFERENCES` или `TRIGGER`. Права `CONNECT`, `USAGE` схемы и
`USAGE` последовательности должны присутствовать; `CREATE`, `TEMP`, чтение
истории миграций и членство в migrator — отсутствовать. Не выполняйте пробные
`INSERT`, `UPDATE` или `DELETE` без отдельного разрешения. После отдельно
разрешённого повторного запуска Compose проверьте те же данные: скрипты
инициализации и restore не должны выполняться снова.

## Ротация паролей

Замена файла secret не меняет пароль роли в существующей БД. Ротацию выполнять
только после отдельного согласования: подготовить новый случайный пароль в
защищённом файле и сохранить прежний до проверки; изменить пароль через
административную `psql`-сессию с отключённым SQL-echo и логированием текста
запросов, передав значение через stdin и безопасно экранированную psql-переменную;
обновить соответствующий файл secret и ACL; проверить TCP-вход. Пароль нельзя
передавать в argv или выводить. При замене файла через rename bind mount может
остаться привязанным к старому inode — потребуется отдельно согласованное
пересоздание контейнера. При ошибке не удалять volume и не терять старый secret.
