PRAGMA foreign_keys=OFF;
DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS "taxonomies";
DROP TABLE IF EXISTS "revisions";
DROP TABLE IF EXISTS "options";
DROP TABLE IF EXISTS "oauth_accounts";
DROP TABLE IF EXISTS "media";
DROP TABLE IF EXISTS "ec_pages";
DROP TABLE IF EXISTS "credentials";
DROP TABLE IF EXISTS "content_taxonomies";
DROP TABLE IF EXISTS "auth_tokens";
DROP TABLE IF EXISTS "auth_challenges";
DROP TABLE IF EXISTS "audit_logs";
DROP TABLE IF EXISTS "allowed_domains";
DROP TABLE IF EXISTS "_plugin_storage";
DROP TABLE IF EXISTS "_plugin_state";
DROP TABLE IF EXISTS "_plugin_indexes";
DROP TABLE IF EXISTS "_emdash_widgets";
DROP TABLE IF EXISTS "_emdash_widget_areas";
DROP TABLE IF EXISTS "_emdash_taxonomy_defs";
DROP TABLE IF EXISTS "_emdash_seo";
DROP TABLE IF EXISTS "_emdash_sections";
DROP TABLE IF EXISTS "_emdash_redirects";
DROP TABLE IF EXISTS "_emdash_rate_limits";
DROP TABLE IF EXISTS "_emdash_oauth_tokens";
DROP TABLE IF EXISTS "_emdash_oauth_clients";
DROP TABLE IF EXISTS "_emdash_migrations_lock";
DROP TABLE IF EXISTS "_emdash_migrations";
DROP TABLE IF EXISTS "_emdash_menus";
DROP TABLE IF EXISTS "_emdash_menu_items";
DROP TABLE IF EXISTS "_emdash_fields";
DROP TABLE IF EXISTS "_emdash_device_codes";
DROP TABLE IF EXISTS "_emdash_cron_tasks";
DROP TABLE IF EXISTS "_emdash_content_bylines";
DROP TABLE IF EXISTS "_emdash_comments";
DROP TABLE IF EXISTS "_emdash_collections";
DROP TABLE IF EXISTS "_emdash_bylines";
DROP TABLE IF EXISTS "_emdash_authorization_codes";
DROP TABLE IF EXISTS "_emdash_api_tokens";
DROP TABLE IF EXISTS "_emdash_404_log";
CREATE TABLE "_emdash_404_log" ("id" text primary key, "path" text not null, "referrer" text, "user_agent" text, "ip" text, "created_at" text default (datetime('now')));
CREATE TABLE "_emdash_api_tokens" ("id" text primary key, "name" text not null, "token_hash" text not null unique, "prefix" text not null, "user_id" text not null, "scopes" text not null, "expires_at" text, "last_used_at" text, "created_at" text default (datetime('now')), constraint "api_tokens_user_fk" foreign key ("user_id") references "users" ("id") on delete cascade);
CREATE TABLE "_emdash_authorization_codes" ("code_hash" text primary key, "client_id" text not null, "redirect_uri" text not null, "user_id" text not null, "scopes" text not null, "code_challenge" text not null, "code_challenge_method" text default 'S256' not null, "resource" text, "expires_at" text not null, "created_at" text default (datetime('now')), constraint "auth_codes_user_fk" foreign key ("user_id") references "users" ("id") on delete cascade);
CREATE TABLE "_emdash_bylines" ("id" text primary key, "slug" text not null unique, "display_name" text not null, "bio" text, "avatar_media_id" text references "media" ("id") on delete set null, "website_url" text, "user_id" text references "users" ("id") on delete set null, "is_guest" integer default 0 not null, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')));
CREATE TABLE "_emdash_collections" ("id" text primary key, "slug" text not null unique, "label" text not null, "label_singular" text, "description" text, "icon" text, "supports" text, "source" text, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')), "search_config" text, has_seo INTEGER NOT NULL DEFAULT 0, url_pattern TEXT, "comments_enabled" integer default 0, "comments_moderation" text default 'first_time', "comments_closed_after_days" integer default 90, "comments_auto_approve_users" integer default 1);
CREATE TABLE "_emdash_comments" ("id" text primary key, "collection" text not null, "content_id" text not null, "parent_id" text references "_emdash_comments" ("id") on delete cascade, "author_name" text not null, "author_email" text not null, "author_user_id" text references "users" ("id") on delete set null, "body" text not null, "status" text default 'pending' not null, "ip_hash" text, "user_agent" text, "moderation_metadata" text, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')));
CREATE TABLE "_emdash_content_bylines" ("id" text primary key, "collection_slug" text not null, "content_id" text not null, "byline_id" text not null references "_emdash_bylines" ("id") on delete cascade, "sort_order" integer default 0 not null, "role_label" text, "created_at" text default (datetime('now')), constraint "content_bylines_unique" unique ("collection_slug", "content_id", "byline_id"));
CREATE TABLE "_emdash_cron_tasks" ("id" text primary key, "plugin_id" text not null, "task_name" text not null, "schedule" text not null, "is_oneshot" integer default 0 not null, "data" text, "next_run_at" text not null, "last_run_at" text, "status" text default 'idle' not null, "locked_at" text, "enabled" integer default 1 not null, "created_at" text default (datetime('now')), constraint "uq_cron_tasks_plugin_task" unique ("plugin_id", "task_name"));
CREATE TABLE "_emdash_device_codes" ("device_code" text primary key, "user_code" text not null unique, "scopes" text not null, "user_id" text, "status" text default 'pending' not null, "expires_at" text not null, "interval" integer default 5 not null, "created_at" text default (datetime('now')), "last_polled_at" text);
CREATE TABLE "_emdash_fields" ("id" text primary key, "collection_id" text not null, "slug" text not null, "label" text not null, "type" text not null, "column_type" text not null, "required" integer default 0, "unique" integer default 0, "default_value" text, "validation" text, "widget" text, "options" text, "sort_order" integer default 0, "created_at" text default (datetime('now')), "searchable" integer default 0, translatable INTEGER NOT NULL DEFAULT 1, constraint "fields_collection_fk" foreign key ("collection_id") references "_emdash_collections" ("id") on delete cascade);
CREATE TABLE "_emdash_menu_items" ("id" text primary key, "menu_id" text not null, "parent_id" text, "sort_order" integer default 0 not null, "type" text not null, "reference_collection" text, "reference_id" text, "custom_url" text, "label" text not null, "title_attr" text, "target" text, "css_classes" text, "created_at" text default (datetime('now')), constraint "menu_items_menu_fk" foreign key ("menu_id") references "_emdash_menus" ("id") on delete cascade, constraint "menu_items_parent_fk" foreign key ("parent_id") references "_emdash_menu_items" ("id") on delete cascade);
CREATE TABLE "_emdash_menus" ("id" text primary key, "name" text not null unique, "label" text not null, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')));
CREATE TABLE "_emdash_migrations" ("name" varchar(255) not null primary key, "timestamp" varchar(255) not null);
CREATE TABLE "_emdash_migrations_lock" ("id" varchar(255) not null primary key, "is_locked" integer default 0 not null);
CREATE TABLE "_emdash_oauth_clients" ("id" text primary key, "name" text not null, "redirect_uris" text not null, "scopes" text, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')));
CREATE TABLE "_emdash_oauth_tokens" ("token_hash" text primary key, "token_type" text not null, "user_id" text not null, "scopes" text not null, "client_type" text default 'cli' not null, "expires_at" text not null, "refresh_token_hash" text, "created_at" text default (datetime('now')), client_id TEXT, constraint "oauth_tokens_user_fk" foreign key ("user_id") references "users" ("id") on delete cascade);
CREATE TABLE "_emdash_rate_limits" ("key" text not null, "window" text not null, "count" integer default 1 not null, constraint "pk_rate_limits" primary key ("key", "window"));
CREATE TABLE "_emdash_redirects" ("id" text primary key, "source" text not null, "destination" text not null, "type" integer default 301 not null, "is_pattern" integer default 0 not null, "enabled" integer default 1 not null, "hits" integer default 0 not null, "last_hit_at" text, "group_name" text, "auto" integer default 0 not null, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')));
CREATE TABLE "_emdash_sections" ("id" text primary key, "slug" text not null unique, "title" text not null, "description" text, "keywords" text, "content" text not null, "preview_media_id" text, "source" text default 'user' not null, "theme_id" text, "created_at" text default CURRENT_TIMESTAMP, "updated_at" text default CURRENT_TIMESTAMP);
CREATE TABLE "_emdash_seo" ("collection" text not null, "content_id" text not null, "seo_title" text, "seo_description" text, "seo_image" text, "seo_canonical" text, "seo_no_index" integer default 0 not null, "created_at" text default (datetime('now')) not null, "updated_at" text default (datetime('now')) not null, constraint "_emdash_seo_pk" primary key ("collection", "content_id"));
CREATE TABLE "_emdash_taxonomy_defs" ("id" text primary key, "name" text not null unique, "label" text not null, "label_singular" text, "hierarchical" integer default 0, "collections" text, "created_at" text default (datetime('now')));
CREATE TABLE "_emdash_widget_areas" ("id" text primary key, "name" text not null unique, "label" text not null, "description" text, "created_at" text default CURRENT_TIMESTAMP);
CREATE TABLE "_emdash_widgets" ("id" text primary key, "area_id" text not null references "_emdash_widget_areas" ("id") on delete cascade, "sort_order" integer default 0 not null, "type" text not null, "title" text, "content" text, "menu_name" text, "component_id" text, "component_props" text, "created_at" text default CURRENT_TIMESTAMP);
CREATE TABLE "_plugin_indexes" ("plugin_id" text not null, "collection" text not null, "index_name" text not null, "fields" text not null, "created_at" text default (datetime('now')), constraint "pk_plugin_indexes" primary key ("plugin_id", "collection", "index_name"));
CREATE TABLE "_plugin_state" ("plugin_id" text primary key, "version" text not null, "status" text default 'installed' not null, "installed_at" text default (datetime('now')), "activated_at" text, "deactivated_at" text, "data" text, source TEXT NOT NULL DEFAULT 'config', marketplace_version TEXT, display_name TEXT, description TEXT);
CREATE TABLE "_plugin_storage" ("plugin_id" text not null, "collection" text not null, "id" text not null, "data" text not null, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')), constraint "pk_plugin_storage" primary key ("plugin_id", "collection", "id"));
CREATE TABLE "allowed_domains" ("domain" text primary key, "default_role" integer default 20 not null, "enabled" integer default 1 not null, "created_at" text default (datetime('now')));
CREATE TABLE "audit_logs" ("id" text primary key, "timestamp" text default (datetime('now')), "actor_id" text, "actor_ip" text, "action" text not null, "resource_type" text, "resource_id" text, "details" text, "status" text);
CREATE TABLE "auth_challenges" ("challenge" text primary key, "type" text not null, "user_id" text, "data" text, "expires_at" text not null, "created_at" text default (datetime('now')));
CREATE TABLE "auth_tokens" ("hash" text primary key, "user_id" text, "email" text, "type" text not null, "role" integer, "invited_by" text, "expires_at" text not null, "created_at" text default (datetime('now')), constraint "auth_tokens_user_fk" foreign key ("user_id") references "users" ("id") on delete cascade, constraint "auth_tokens_invited_by_fk" foreign key ("invited_by") references "users" ("id") on delete set null);
CREATE TABLE "content_taxonomies" ("collection" text not null, "entry_id" text not null, "taxonomy_id" text not null, constraint "content_taxonomies_pk" primary key ("collection", "entry_id", "taxonomy_id"), constraint "content_taxonomies_taxonomy_fk" foreign key ("taxonomy_id") references "taxonomies" ("id") on delete cascade);
CREATE TABLE "credentials" ("id" text primary key, "user_id" text not null, "public_key" blob not null, "counter" integer default 0 not null, "device_type" text not null, "backed_up" integer default 0 not null, "transports" text, "name" text, "created_at" text default (datetime('now')), "last_used_at" text default (datetime('now')), constraint "credentials_user_fk" foreign key ("user_id") references "users" ("id") on delete cascade);
CREATE TABLE "ec_pages" ("id" text primary key, "slug" text, "status" text default 'draft', "author_id" text, "primary_byline_id" text, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')), "published_at" text, "scheduled_at" text, "deleted_at" text, "version" integer default 1, "live_revision_id" text references "revisions" ("id"), "draft_revision_id" text references "revisions" ("id"), "locale" text default 'en' not null, "translation_group" text, "title" TEXT NOT NULL DEFAULT '', "content" JSON, constraint "ec_pages_slug_locale_unique" unique ("slug", "locale"));
CREATE TABLE "media" ("id" text primary key, "filename" text not null, "mime_type" text not null, "size" integer, "width" integer, "height" integer, "alt" text, "caption" text, "storage_key" text not null, "content_hash" text, "created_at" text default (datetime('now')), "author_id" text, "status" text default 'ready' not null, blurhash TEXT, dominant_color TEXT);
CREATE TABLE "oauth_accounts" ("provider" text not null, "provider_account_id" text not null, "user_id" text not null, "created_at" text default (datetime('now')), constraint "oauth_accounts_pk" primary key ("provider", "provider_account_id"), constraint "oauth_accounts_user_fk" foreign key ("user_id") references "users" ("id") on delete cascade);
CREATE TABLE "options" ("name" text primary key, "value" text not null);
CREATE TABLE "revisions" ("id" text primary key, "collection" text not null, "entry_id" text not null, "data" text not null, "author_id" text, "created_at" text default (datetime('now')));
CREATE TABLE "taxonomies" ("id" text primary key, "name" text not null, "slug" text not null, "label" text not null, "parent_id" text, "data" text, constraint "taxonomies_name_slug_unique" unique ("name", "slug"), constraint "taxonomies_parent_fk" foreign key ("parent_id") references "taxonomies" ("id") on delete set null);
CREATE TABLE "users" ("id" text primary key, "email" text not null unique, "name" text, "avatar_url" text, "role" integer default 10 not null, "email_verified" integer default 0 not null, "data" text, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')), disabled INTEGER NOT NULL DEFAULT 0);
INSERT INTO "_emdash_collections" ("id","slug","label","label_singular","description","icon","supports","source","created_at","updated_at","search_config","has_seo","url_pattern","comments_enabled","comments_moderation","comments_closed_after_days","comments_auto_approve_users") VALUES ('01KNEWD5P7S6SJHV8A59QJQESA','pages','Pages','Page',NULL,NULL,'["drafts","revisions","seo"]','seed','2026-04-05 13:13:09','2026-04-05 13:13:09',NULL,1,NULL,0,'first_time',90,1);
INSERT INTO "_emdash_fields" ("id","collection_id","slug","label","type","column_type","required","unique","default_value","validation","widget","options","sort_order","created_at","searchable","translatable") VALUES ('01KNEWD5PHXWHS4EYGVSFG2R0C','01KNEWD5P7S6SJHV8A59QJQESA','title','Title','string','TEXT',1,0,NULL,NULL,NULL,NULL,0,'2026-04-05 13:13:09',0,1);
INSERT INTO "_emdash_fields" ("id","collection_id","slug","label","type","column_type","required","unique","default_value","validation","widget","options","sort_order","created_at","searchable","translatable") VALUES ('01KNEWD5PRK53M8FQMKDXKZBAT','01KNEWD5P7S6SJHV8A59QJQESA','content','Content','portableText','JSON',0,0,NULL,NULL,NULL,NULL,1,'2026-04-05 13:13:09',0,1);
INSERT INTO "_emdash_menu_items" ("id","menu_id","parent_id","sort_order","type","reference_collection","reference_id","custom_url","label","title_attr","target","css_classes","created_at") VALUES ('01KNEWMRHMQFYBNENHM6BQB960','01KNEWD5Q75G9YBT3BTNGB829T',NULL,0,'custom',NULL,NULL,'/#features','About',NULL,NULL,NULL,'2026-04-05T13:17:17.753Z');
INSERT INTO "_emdash_menu_items" ("id","menu_id","parent_id","sort_order","type","reference_collection","reference_id","custom_url","label","title_attr","target","css_classes","created_at") VALUES ('01KNEWMRHTV2Y5JZMWPKZW0V9S','01KNEWD5Q75G9YBT3BTNGB829T',NULL,1,'custom',NULL,NULL,'/pricing','Services',NULL,NULL,NULL,'2026-04-05T13:17:17.754Z');
INSERT INTO "_emdash_menu_items" ("id","menu_id","parent_id","sort_order","type","reference_collection","reference_id","custom_url","label","title_attr","target","css_classes","created_at") VALUES ('01KNEWMRHV6THZQCYEVTAE5EVW','01KNEWD5Q75G9YBT3BTNGB829T',NULL,2,'custom',NULL,NULL,'/contact','Contact',NULL,NULL,NULL,'2026-04-05T13:17:17.755Z');
INSERT INTO "_emdash_menus" ("id","name","label","created_at","updated_at") VALUES ('01KNEWD5Q75G9YBT3BTNGB829T','primary','Primary Navigation','2026-04-05T13:13:09.095Z','2026-04-05T13:13:09.095Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('001_initial','2026-04-05T13:13:08.885Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('002_media_status','2026-04-05T13:13:08.887Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('003_schema_registry','2026-04-05T13:13:08.890Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('004_plugins','2026-04-05T13:13:08.893Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('005_menus','2026-04-05T13:13:08.896Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('006_taxonomy_defs','2026-04-05T13:13:08.897Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('007_widgets','2026-04-05T13:13:08.901Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('008_auth','2026-04-05T13:13:08.913Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('009_user_disabled','2026-04-05T13:13:08.914Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('011_sections','2026-04-05T13:13:08.916Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('012_search','2026-04-05T13:13:08.919Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('013_scheduled_publishing','2026-04-05T13:13:08.920Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('014_draft_revisions','2026-04-05T13:13:08.922Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('015_indexes','2026-04-05T13:13:08.927Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('016_api_tokens','2026-04-05T13:13:08.951Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('017_authorization_codes','2026-04-05T13:13:08.962Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('018_seo','2026-04-05T13:13:08.979Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('019_i18n','2026-04-05T13:13:08.985Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('020_collection_url_pattern','2026-04-05T13:13:08.990Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('021_remove_section_categories','2026-04-05T13:13:09.002Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('022_marketplace_plugin_state','2026-04-05T13:13:09.006Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('023_plugin_metadata','2026-04-05T13:13:09.009Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('024_media_placeholders','2026-04-05T13:13:09.012Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('025_oauth_clients','2026-04-05T13:13:09.014Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('026_cron_tasks','2026-04-05T13:13:09.016Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('027_comments','2026-04-05T13:13:09.030Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('028_drop_author_url','2026-04-05T13:13:09.036Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('029_redirects','2026-04-05T13:13:09.039Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('030_widen_scheduled_index','2026-04-05T13:13:09.040Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('031_bylines','2026-04-05T13:13:09.044Z');
INSERT INTO "_emdash_migrations" ("name","timestamp") VALUES ('032_rate_limits','2026-04-05T13:13:09.046Z');
INSERT INTO "_emdash_migrations_lock" ("id","is_locked") VALUES ('migration_lock',0);
INSERT INTO "_emdash_taxonomy_defs" ("id","name","label","label_singular","hierarchical","collections","created_at") VALUES ('taxdef_category','category','Categories','Category',1,'["posts"]','2026-04-05 13:13:08');
INSERT INTO "_emdash_taxonomy_defs" ("id","name","label","label_singular","hierarchical","collections","created_at") VALUES ('taxdef_tag','tag','Tags','Tag',0,'["posts"]','2026-04-05 13:13:08');
INSERT INTO "ec_pages" ("id","slug","status","author_id","primary_byline_id","created_at","updated_at","published_at","scheduled_at","deleted_at","version","live_revision_id","draft_revision_id","locale","translation_group","title","content") VALUES ('01KNEWD5PZXMVVKSNRG4Z2VHAB','home','published',NULL,NULL,'2026-04-05T13:13:09.087Z','2026-04-05T13:13:09.087Z','2026-04-05T13:13:09.086Z',NULL,NULL,1,NULL,NULL,'en','01KNEWD5PZXMVVKSNRG4Z2VHAB','Home','[{"_type":"marketing.hero","_key":"hero","headline":"Your practice starts here","subheadline":"Sunrise Yoga Studio in Portland, OR offers yoga for every body. Whether you''re a first-timer or an advanced practitioner, our classes meet you where you are. Come breathe, move, and grow with us.","primaryCta":{"label":"Get Started","url":"/contact"},"secondaryCta":{"label":"Learn More","url":"/#features"}},{"_type":"marketing.features","_key":"features","headline":"Why choose Sunrise Yoga Studio","subheadline":"Expert instruction, inclusive community, and a practice tailored to your body and goals.","features":[{"icon":"zap","title":"Vinyasa Flow","description":"Dynamic, breath-linked movement that builds strength and flexibility. All levels welcome."},{"icon":"shield","title":"Yin & Restorative","description":"Slow, deep stretches held for minutes. Perfect for recovery, stress relief, and finding stillness."},{"icon":"users","title":"Hot Yoga","description":"Practice in a heated room to deepen stretches, detoxify, and build endurance. Bring water and a towel."},{"icon":"chart","title":"Community Classes","description":"Weekly donation-based classes open to everyone. Yoga is for every body, every budget."},{"icon":"code","title":"Private Sessions","description":"One-on-one instruction tailored to your goals. Injury recovery, prenatal, or personal development."},{"icon":"globe","title":"Workshops & Retreats","description":"Weekend workshops and seasonal retreats to deepen your practice and connect with community."}]},{"_type":"marketing.testimonials","_key":"testimonials","headline":"What our guests say","testimonials":[{"quote":"Sunrise Yoga Studio changed my relationship with my body. The instructors are warm, knowledgeable, and never make you feel like you''re not enough.","author":"Sarah M.","role":"Member, 2 years","company":"5 stars"},{"quote":"I came for the hot yoga and stayed for the community. This studio feels like home.","author":"David L.","role":"Member, 1 year","company":"5 stars"},{"quote":"As a complete beginner, I was nervous. By the end of my first class, I was hooked. The vibe here is everything.","author":"Priya K.","role":"New Member","company":"5 stars"}]},{"_type":"marketing.faq","_key":"faq","headline":"Good to know","items":[{"question":"Do I need experience?","answer":"Not at all. Every class offers modifications for all levels. Our instructors will help you find your edge without pushing past it."},{"question":"What should I bring?","answer":"Just yourself and a water bottle. We provide mats, blocks, straps, and blankets. For hot yoga, bring a towel."},{"question":"How much does it cost?","answer":"Drop-in classes are $20. Monthly unlimited is $99. We also offer a 10-class pack for $150. First class is always free."},{"question":"Do you offer teacher training?","answer":"Yes! We run 200-hour and 500-hour teacher training programs. Check our workshops page for upcoming dates."}]}]');
INSERT INTO "ec_pages" ("id","slug","status","author_id","primary_byline_id","created_at","updated_at","published_at","scheduled_at","deleted_at","version","live_revision_id","draft_revision_id","locale","translation_group","title","content") VALUES ('01KNEWD5Q2M8YKE1QJ2EKCGAZW','pricing','published',NULL,NULL,'2026-04-05T13:13:09.091Z','2026-04-05T13:13:09.091Z','2026-04-05T13:13:09.090Z',NULL,NULL,1,NULL,NULL,'en','01KNEWD5Q2M8YKE1QJ2EKCGAZW','Pricing & Classes','[{"_type":"marketing.hero","_key":"pricing-hero","headline":"Pricing & Class Options","subheadline":"We believe yoga should be accessible to everyone. Choose the option that works best for your practice and your budget.","centered":true},{"_type":"marketing.pricing","_key":"pricing-plans","plans":[{"name":"Drop-In","price":"$20","description":"Pay as you go. Try a class anytime.","features":["Access to all class types","Mats, blocks & props included","No commitment","Perfect for trying us out"],"cta":{"label":"Schedule a Class","url":"/contact"}},{"name":"10-Class Pack","price":"$150","description":"Save $50 compared to drop-in rates.","features":["10 classes to use at your pace","Valid for 6 months","Use any time, any class","Better rate than drop-in"],"cta":{"label":"Get Started","url":"/contact"},"highlighted":true},{"name":"Monthly Unlimited","price":"$99","description":"Unlimited classes for one month.","features":["Unlimited classes all month","Access to all class times","Workshops included","Community events"],"cta":{"label":"Start Your Practice","url":"/contact"}}]},{"_type":"marketing.faq","_key":"pricing-faq","headline":"Pricing questions","items":[{"question":"Is there a first class free offer?","answer":"Yes! Your first class is always free. Try us out, meet the instructors, and see if we''re the right fit for you."},{"question":"Can I pause or cancel my membership?","answer":"Absolutely. Monthly memberships can be paused or cancelled anytime with no penalties. We want you to practice because you love it, not because you''re stuck."},{"question":"Do you offer student or senior discounts?","answer":"Yes. Students and seniors get 15% off all packages. Just show your student ID or let us know during sign-up."},{"question":"What about private sessions?","answer":"Private sessions are $75/hour and can be customized to your goals — injury recovery, prenatal prep, or deepening your practice. Book via our contact form."}]}]');
INSERT INTO "ec_pages" ("id","slug","status","author_id","primary_byline_id","created_at","updated_at","published_at","scheduled_at","deleted_at","version","live_revision_id","draft_revision_id","locale","translation_group","title","content") VALUES ('01KNEWD5Q5KYJVCBJPBHWBDTD2','contact','published',NULL,NULL,'2026-04-05T13:13:09.093Z','2026-04-05T13:13:09.093Z','2026-04-05T13:13:09.093Z',NULL,NULL,1,NULL,NULL,'en','01KNEWD5Q5KYJVCBJPBHWBDTD2','Get in Touch','[{"_type":"marketing.hero","_key":"contact-hero","headline":"Get in Touch","subheadline":"Questions about classes, scheduling, or our studio? We''d love to hear from you. Reach out anytime — we''ll get back to you within 24 hours.","centered":true}]');
INSERT INTO "options" ("name","value") VALUES ('site:title','"Sunrise Yoga Studio"');
INSERT INTO "options" ("name","value") VALUES ('site:tagline','"Find your flow at Sunrise Yoga Studio"');
INSERT INTO "options" ("name","value") VALUES ('site:description','"Sunrise Yoga Studio in Portland, OR. Classes for all levels: vinyasa flow, yin & restorative, hot yoga, and more. Join our welcoming community."');
INSERT INTO "options" ("name","value") VALUES ('emdash:exclusive_hook:email:deliver','"emdash-console-email"');
INSERT INTO "options" ("name","value") VALUES ('emdash:exclusive_hook:comment:moderate','"emdash-default-comment-moderator"');
CREATE INDEX "idx_revisions_entry" on "revisions" ("collection", "entry_id");
CREATE INDEX "idx_taxonomies_name" on "taxonomies" ("name");
CREATE INDEX "idx_media_content_hash" on "media" ("content_hash");
CREATE INDEX "idx_audit_actor" on "audit_logs" ("actor_id");
CREATE INDEX "idx_audit_action" on "audit_logs" ("action");
CREATE INDEX "idx_audit_timestamp" on "audit_logs" ("timestamp");
CREATE INDEX "idx_media_status" on "media" ("status");
CREATE UNIQUE INDEX "idx_fields_collection_slug" on "_emdash_fields" ("collection_id", "slug");
CREATE INDEX "idx_fields_collection" on "_emdash_fields" ("collection_id");
CREATE INDEX "idx_fields_sort" on "_emdash_fields" ("collection_id", "sort_order");
CREATE INDEX "idx_plugin_storage_list" on "_plugin_storage" ("plugin_id", "collection", "created_at");
CREATE INDEX "idx_menu_items_menu" on "_emdash_menu_items" ("menu_id", "sort_order");
CREATE INDEX "idx_menu_items_parent" on "_emdash_menu_items" ("parent_id");
CREATE INDEX "idx_widgets_area" on "_emdash_widgets" ("area_id", "sort_order");
CREATE INDEX "idx_users_email" on "users" ("email");
CREATE INDEX "idx_credentials_user" on "credentials" ("user_id");
CREATE INDEX "idx_auth_tokens_email" on "auth_tokens" ("email");
CREATE INDEX "idx_oauth_accounts_user" on "oauth_accounts" ("user_id");
CREATE INDEX "idx_auth_challenges_expires" on "auth_challenges" ("expires_at");
CREATE INDEX "idx_users_disabled" on "users" ("disabled");
CREATE INDEX "idx_sections_source" on "_emdash_sections" ("source");
CREATE INDEX "idx_media_mime_type" on "media" ("mime_type");
CREATE INDEX "idx_media_filename" on "media" ("filename");
CREATE INDEX "idx_media_created_at" on "media" ("created_at");
CREATE INDEX "idx_content_taxonomies_term" on "content_taxonomies" ("taxonomy_id");
CREATE INDEX "idx_taxonomies_parent" on "taxonomies" ("parent_id");
CREATE INDEX "idx_audit_resource" on "audit_logs" ("resource_type", "resource_id");
CREATE INDEX "idx_api_tokens_token_hash" on "_emdash_api_tokens" ("token_hash");
CREATE INDEX "idx_api_tokens_user_id" on "_emdash_api_tokens" ("user_id");
CREATE INDEX "idx_oauth_tokens_user_id" on "_emdash_oauth_tokens" ("user_id");
CREATE INDEX "idx_oauth_tokens_expires" on "_emdash_oauth_tokens" ("expires_at");
CREATE INDEX "idx_auth_codes_expires" on "_emdash_authorization_codes" ("expires_at");
CREATE INDEX idx_emdash_seo_collection
		ON _emdash_seo (collection)
	;
CREATE INDEX idx_plugin_state_source
		ON _plugin_state (source)
		WHERE source = 'marketplace'
	;
CREATE INDEX "idx_cron_tasks_due" on "_emdash_cron_tasks" ("enabled", "status", "next_run_at");
CREATE INDEX "idx_cron_tasks_plugin" on "_emdash_cron_tasks" ("plugin_id");
CREATE INDEX "idx_comments_content" on "_emdash_comments" ("collection", "content_id", "status");
CREATE INDEX "idx_comments_parent" on "_emdash_comments" ("parent_id");
CREATE INDEX "idx_comments_status" on "_emdash_comments" ("status", "created_at");
CREATE INDEX "idx_comments_author_email" on "_emdash_comments" ("author_email");
CREATE INDEX "idx_comments_author_user" on "_emdash_comments" ("author_user_id");
CREATE INDEX "idx_redirects_source" on "_emdash_redirects" ("source");
CREATE INDEX "idx_redirects_enabled" on "_emdash_redirects" ("enabled");
CREATE INDEX "idx_redirects_group" on "_emdash_redirects" ("group_name");
CREATE INDEX "idx_404_log_path" on "_emdash_404_log" ("path");
CREATE INDEX "idx_404_log_created" on "_emdash_404_log" ("created_at");
CREATE UNIQUE INDEX "idx_bylines_user_id_unique"
		ON "_emdash_bylines" (user_id)
		WHERE user_id IS NOT NULL
	;
CREATE INDEX "idx_bylines_slug" on "_emdash_bylines" ("slug");
CREATE INDEX "idx_bylines_display_name" on "_emdash_bylines" ("display_name");
CREATE INDEX "idx_content_bylines_content" on "_emdash_content_bylines" ("collection_slug", "content_id", "sort_order");
CREATE INDEX "idx_content_bylines_byline" on "_emdash_content_bylines" ("byline_id");
CREATE INDEX "idx_rate_limits_window" on "_emdash_rate_limits" ("window");
CREATE INDEX "idx_ec_pages_status" 
			ON "ec_pages" (status)
		;
CREATE INDEX "idx_ec_pages_slug" 
			ON "ec_pages" (slug)
		;
CREATE INDEX "idx_ec_pages_created" 
			ON "ec_pages" (created_at)
		;
CREATE INDEX "idx_ec_pages_deleted" 
			ON "ec_pages" (deleted_at)
		;
CREATE INDEX "idx_ec_pages_scheduled" 
			ON "ec_pages" (scheduled_at)
			WHERE scheduled_at IS NOT NULL
		;
CREATE INDEX "idx_ec_pages_live_revision" 
			ON "ec_pages" (live_revision_id)
		;
CREATE INDEX "idx_ec_pages_draft_revision" 
			ON "ec_pages" (draft_revision_id)
		;
CREATE INDEX "idx_ec_pages_author" 
			ON "ec_pages" (author_id)
		;
CREATE INDEX "idx_ec_pages_primary_byline" 
			ON "ec_pages" (primary_byline_id)
		;
CREATE INDEX "idx_ec_pages_updated" 
			ON "ec_pages" (updated_at)
		;
CREATE INDEX "idx_ec_pages_locale" 
			ON "ec_pages" (locale)
		;
CREATE INDEX "idx_ec_pages_translation_group" 
			ON "ec_pages" (translation_group)
		;
PRAGMA foreign_keys=ON;
