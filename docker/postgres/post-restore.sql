BEGIN;

ALTER TABLE public."Products" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Products" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."Categories" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Categories" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."ProductCategories" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProductCategories" NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public."__EFMigrationsHistory" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."__EFMigrationsHistory" NO FORCE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, paintshop_app;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, paintshop_app;

GRANT SELECT, INSERT, UPDATE, DELETE
    ON public."Products", public."Categories", public."ProductCategories"
    TO paintshop_app;
GRANT USAGE ON SEQUENCE public."Categories_Id_seq" TO paintshop_app;

COMMIT;
