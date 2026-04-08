PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE IF NOT EXISTS "_emdash_migrations" ("name" varchar(255) not null primary key, "timestamp" varchar(255) not null);
INSERT INTO "_emdash_migrations" VALUES('001_initial','2026-04-08T16:47:10.272Z');
INSERT INTO "_emdash_migrations" VALUES('002_media_status','2026-04-08T16:47:10.310Z');
INSERT INTO "_emdash_migrations" VALUES('003_schema_registry','2026-04-08T16:47:10.353Z');
INSERT INTO "_emdash_migrations" VALUES('004_plugins','2026-04-08T16:47:10.372Z');
INSERT INTO "_emdash_migrations" VALUES('005_menus','2026-04-08T16:47:10.394Z');
INSERT INTO "_emdash_migrations" VALUES('006_taxonomy_defs','2026-04-08T16:47:10.411Z');
INSERT INTO "_emdash_migrations" VALUES('007_widgets','2026-04-08T16:47:10.426Z');
INSERT INTO "_emdash_migrations" VALUES('008_auth','2026-04-08T16:47:10.523Z');
INSERT INTO "_emdash_migrations" VALUES('009_user_disabled','2026-04-08T16:47:10.561Z');
INSERT INTO "_emdash_migrations" VALUES('011_sections','2026-04-08T16:47:10.604Z');
INSERT INTO "_emdash_migrations" VALUES('012_search','2026-04-08T16:47:10.632Z');
INSERT INTO "_emdash_migrations" VALUES('013_scheduled_publishing','2026-04-08T16:47:10.644Z');
INSERT INTO "_emdash_migrations" VALUES('014_draft_revisions','2026-04-08T16:47:10.656Z');
INSERT INTO "_emdash_migrations" VALUES('015_indexes','2026-04-08T16:47:10.698Z');
INSERT INTO "_emdash_migrations" VALUES('016_api_tokens','2026-04-08T16:47:10.788Z');
INSERT INTO "_emdash_migrations" VALUES('017_authorization_codes','2026-04-08T16:47:10.821Z');
INSERT INTO "_emdash_migrations" VALUES('018_seo','2026-04-08T16:47:10.868Z');
INSERT INTO "_emdash_migrations" VALUES('019_i18n','2026-04-08T16:47:10.923Z');
INSERT INTO "_emdash_migrations" VALUES('020_collection_url_pattern','2026-04-08T16:47:10.946Z');
INSERT INTO "_emdash_migrations" VALUES('021_remove_section_categories','2026-04-08T16:47:11.008Z');
INSERT INTO "_emdash_migrations" VALUES('022_marketplace_plugin_state','2026-04-08T16:47:11.052Z');
INSERT INTO "_emdash_migrations" VALUES('023_plugin_metadata','2026-04-08T16:47:11.080Z');
INSERT INTO "_emdash_migrations" VALUES('024_media_placeholders','2026-04-08T16:47:11.121Z');
INSERT INTO "_emdash_migrations" VALUES('025_oauth_clients','2026-04-08T16:47:11.144Z');
INSERT INTO "_emdash_migrations" VALUES('026_cron_tasks','2026-04-08T16:47:11.187Z');
INSERT INTO "_emdash_migrations" VALUES('027_comments','2026-04-08T16:47:11.298Z');
INSERT INTO "_emdash_migrations" VALUES('028_drop_author_url','2026-04-08T16:47:11.327Z');
INSERT INTO "_emdash_migrations" VALUES('029_redirects','2026-04-08T16:47:11.391Z');
INSERT INTO "_emdash_migrations" VALUES('030_widen_scheduled_index','2026-04-08T16:47:11.441Z');
INSERT INTO "_emdash_migrations" VALUES('031_bylines','2026-04-08T16:47:11.545Z');
INSERT INTO "_emdash_migrations" VALUES('032_rate_limits','2026-04-08T16:47:11.609Z');
CREATE TABLE IF NOT EXISTS "_emdash_migrations_lock" ("id" varchar(255) not null primary key, "is_locked" integer default 0 not null);
INSERT INTO "_emdash_migrations_lock" VALUES('migration_lock',0);
CREATE TABLE IF NOT EXISTS "revisions" ("id" text primary key, "collection" text not null, "entry_id" text not null, "data" text not null, "author_id" text, "created_at" text default (datetime('now')));
CREATE TABLE IF NOT EXISTS "taxonomies" ("id" text primary key, "name" text not null, "slug" text not null, "label" text not null, "parent_id" text, "data" text, constraint "taxonomies_name_slug_unique" unique ("name", "slug"), constraint "taxonomies_parent_fk" foreign key ("parent_id") references "taxonomies" ("id") on delete set null);
CREATE TABLE IF NOT EXISTS "content_taxonomies" ("collection" text not null, "entry_id" text not null, "taxonomy_id" text not null, constraint "content_taxonomies_pk" primary key ("collection", "entry_id", "taxonomy_id"), constraint "content_taxonomies_taxonomy_fk" foreign key ("taxonomy_id") references "taxonomies" ("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "media" ("id" text primary key, "filename" text not null, "mime_type" text not null, "size" integer, "width" integer, "height" integer, "alt" text, "caption" text, "storage_key" text not null, "content_hash" text, "created_at" text default (datetime('now')), "author_id" text, "status" text default 'ready' not null, blurhash TEXT, dominant_color TEXT);
CREATE TABLE IF NOT EXISTS "options" ("name" text primary key, "value" text not null);
INSERT INTO "options" VALUES('emdash:exclusive_hook:email:deliver','"emdash-console-email"');
INSERT INTO "options" VALUES('emdash:exclusive_hook:comment:moderate','"emdash-default-comment-moderator"');
INSERT INTO "options" VALUES('site:title','"Bella''s Bistro"');
INSERT INTO "options" VALUES('site:tagline','"Handmade Italian in the heart of Austin"');
CREATE TABLE IF NOT EXISTS "audit_logs" ("id" text primary key, "timestamp" text default (datetime('now')), "actor_id" text, "actor_ip" text, "action" text not null, "resource_type" text, "resource_id" text, "details" text, "status" text);
CREATE TABLE IF NOT EXISTS "_emdash_collections" ("id" text primary key, "slug" text not null unique, "label" text not null, "label_singular" text, "description" text, "icon" text, "supports" text, "source" text, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')), "search_config" text, has_seo INTEGER NOT NULL DEFAULT 0, url_pattern TEXT, "comments_enabled" integer default 0, "comments_moderation" text default 'first_time', "comments_closed_after_days" integer default 90, "comments_auto_approve_users" integer default 1);
INSERT INTO "_emdash_collections" VALUES('01KNQ07D5DD6X1BAP1J19ASTPJ','pages','Pages','Page',NULL,NULL,'["drafts","revisions","seo"]','seed','2026-04-08 16:53:49','2026-04-08 16:53:49',NULL,1,NULL,0,'first_time',90,1);
CREATE TABLE IF NOT EXISTS "_emdash_fields" ("id" text primary key, "collection_id" text not null, "slug" text not null, "label" text not null, "type" text not null, "column_type" text not null, "required" integer default 0, "unique" integer default 0, "default_value" text, "validation" text, "widget" text, "options" text, "sort_order" integer default 0, "created_at" text default (datetime('now')), "searchable" integer default 0, translatable INTEGER NOT NULL DEFAULT 1, constraint "fields_collection_fk" foreign key ("collection_id") references "_emdash_collections" ("id") on delete cascade);
INSERT INTO "_emdash_fields" VALUES('01KNQ07D9TC0Z4D1MYR45HX8CN','01KNQ07D5DD6X1BAP1J19ASTPJ','title','Title','string','TEXT',1,0,NULL,NULL,NULL,NULL,0,'2026-04-08 16:53:50',0,1);
INSERT INTO "_emdash_fields" VALUES('01KNQ07DEM2EAVBK2CTYH5YC0H','01KNQ07D5DD6X1BAP1J19ASTPJ','content','Content','portableText','JSON',0,0,NULL,NULL,NULL,NULL,1,'2026-04-08 16:53:50',0,1);
CREATE TABLE IF NOT EXISTS "_plugin_storage" ("plugin_id" text not null, "collection" text not null, "id" text not null, "data" text not null, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')), constraint "pk_plugin_storage" primary key ("plugin_id", "collection", "id"));
CREATE TABLE IF NOT EXISTS "_plugin_state" ("plugin_id" text primary key, "version" text not null, "status" text default 'installed' not null, "installed_at" text default (datetime('now')), "activated_at" text, "deactivated_at" text, "data" text, source TEXT NOT NULL DEFAULT 'config', marketplace_version TEXT, display_name TEXT, description TEXT);
CREATE TABLE IF NOT EXISTS "_plugin_indexes" ("plugin_id" text not null, "collection" text not null, "index_name" text not null, "fields" text not null, "created_at" text default (datetime('now')), constraint "pk_plugin_indexes" primary key ("plugin_id", "collection", "index_name"));
CREATE TABLE IF NOT EXISTS "_emdash_menus" ("id" text primary key, "name" text not null unique, "label" text not null, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')));
INSERT INTO "_emdash_menus" VALUES('01KNQ07DG31K2PQBRTV290MJ13','primary','Primary Navigation','2026-04-08T16:53:50.211Z','2026-04-08T16:53:50.212Z');
CREATE TABLE IF NOT EXISTS "_emdash_menu_items" ("id" text primary key, "menu_id" text not null, "parent_id" text, "sort_order" integer default 0 not null, "type" text not null, "reference_collection" text, "reference_id" text, "custom_url" text, "label" text not null, "title_attr" text, "target" text, "css_classes" text, "created_at" text default (datetime('now')), constraint "menu_items_menu_fk" foreign key ("menu_id") references "_emdash_menus" ("id") on delete cascade, constraint "menu_items_parent_fk" foreign key ("parent_id") references "_emdash_menu_items" ("id") on delete cascade);
INSERT INTO "_emdash_menu_items" VALUES('01KNQ07DG83RJWQR4V7W08FM6P','01KNQ07DG31K2PQBRTV290MJ13',NULL,0,'custom',NULL,NULL,'/#features','About',NULL,NULL,NULL,'2026-04-08T16:53:50.216Z');
INSERT INTO "_emdash_menu_items" VALUES('01KNQ07DGBEBGW9R8XPNQQD80P','01KNQ07DG31K2PQBRTV290MJ13',NULL,1,'custom',NULL,NULL,'/pricing','Menu',NULL,NULL,NULL,'2026-04-08T16:53:50.219Z');
INSERT INTO "_emdash_menu_items" VALUES('01KNQ07DGF64AYZRASDEV7P2RN','01KNQ07DG31K2PQBRTV290MJ13',NULL,2,'custom',NULL,NULL,'/contact','Reserve a Table',NULL,NULL,NULL,'2026-04-08T16:53:50.223Z');
CREATE TABLE IF NOT EXISTS "_emdash_taxonomy_defs" ("id" text primary key, "name" text not null unique, "label" text not null, "label_singular" text, "hierarchical" integer default 0, "collections" text, "created_at" text default (datetime('now')));
INSERT INTO "_emdash_taxonomy_defs" VALUES('taxdef_category','category','Categories','Category',1,'["posts"]','2026-04-08 16:47:10');
INSERT INTO "_emdash_taxonomy_defs" VALUES('taxdef_tag','tag','Tags','Tag',0,'["posts"]','2026-04-08 16:47:10');
CREATE TABLE IF NOT EXISTS "_emdash_widget_areas" ("id" text primary key, "name" text not null unique, "label" text not null, "description" text, "created_at" text default CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "_emdash_widgets" ("id" text primary key, "area_id" text not null references "_emdash_widget_areas" ("id") on delete cascade, "sort_order" integer default 0 not null, "type" text not null, "title" text, "content" text, "menu_name" text, "component_id" text, "component_props" text, "created_at" text default CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "users" ("id" text primary key, "email" text not null unique, "name" text, "avatar_url" text, "role" integer default 10 not null, "email_verified" integer default 0 not null, "data" text, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')), disabled INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS "credentials" ("id" text primary key, "user_id" text not null, "public_key" blob not null, "counter" integer default 0 not null, "device_type" text not null, "backed_up" integer default 0 not null, "transports" text, "name" text, "created_at" text default (datetime('now')), "last_used_at" text default (datetime('now')), constraint "credentials_user_fk" foreign key ("user_id") references "users" ("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "auth_tokens" ("hash" text primary key, "user_id" text, "email" text, "type" text not null, "role" integer, "invited_by" text, "expires_at" text not null, "created_at" text default (datetime('now')), constraint "auth_tokens_user_fk" foreign key ("user_id") references "users" ("id") on delete cascade, constraint "auth_tokens_invited_by_fk" foreign key ("invited_by") references "users" ("id") on delete set null);
CREATE TABLE IF NOT EXISTS "oauth_accounts" ("provider" text not null, "provider_account_id" text not null, "user_id" text not null, "created_at" text default (datetime('now')), constraint "oauth_accounts_pk" primary key ("provider", "provider_account_id"), constraint "oauth_accounts_user_fk" foreign key ("user_id") references "users" ("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "allowed_domains" ("domain" text primary key, "default_role" integer default 20 not null, "enabled" integer default 1 not null, "created_at" text default (datetime('now')));
CREATE TABLE IF NOT EXISTS "auth_challenges" ("challenge" text primary key, "type" text not null, "user_id" text, "data" text, "expires_at" text not null, "created_at" text default (datetime('now')));
CREATE TABLE IF NOT EXISTS "_emdash_sections" ("id" text primary key, "slug" text not null unique, "title" text not null, "description" text, "keywords" text, "content" text not null, "preview_media_id" text, "source" text default 'user' not null, "theme_id" text, "created_at" text default CURRENT_TIMESTAMP, "updated_at" text default CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS "_emdash_api_tokens" ("id" text primary key, "name" text not null, "token_hash" text not null unique, "prefix" text not null, "user_id" text not null, "scopes" text not null, "expires_at" text, "last_used_at" text, "created_at" text default (datetime('now')), constraint "api_tokens_user_fk" foreign key ("user_id") references "users" ("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "_emdash_oauth_tokens" ("token_hash" text primary key, "token_type" text not null, "user_id" text not null, "scopes" text not null, "client_type" text default 'cli' not null, "expires_at" text not null, "refresh_token_hash" text, "created_at" text default (datetime('now')), client_id TEXT, constraint "oauth_tokens_user_fk" foreign key ("user_id") references "users" ("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "_emdash_device_codes" ("device_code" text primary key, "user_code" text not null unique, "scopes" text not null, "user_id" text, "status" text default 'pending' not null, "expires_at" text not null, "interval" integer default 5 not null, "created_at" text default (datetime('now')), "last_polled_at" text);
CREATE TABLE IF NOT EXISTS "_emdash_authorization_codes" ("code_hash" text primary key, "client_id" text not null, "redirect_uri" text not null, "user_id" text not null, "scopes" text not null, "code_challenge" text not null, "code_challenge_method" text default 'S256' not null, "resource" text, "expires_at" text not null, "created_at" text default (datetime('now')), constraint "auth_codes_user_fk" foreign key ("user_id") references "users" ("id") on delete cascade);
CREATE TABLE IF NOT EXISTS "_emdash_seo" ("collection" text not null, "content_id" text not null, "seo_title" text, "seo_description" text, "seo_image" text, "seo_canonical" text, "seo_no_index" integer default 0 not null, "created_at" text default (datetime('now')) not null, "updated_at" text default (datetime('now')) not null, constraint "_emdash_seo_pk" primary key ("collection", "content_id"));
CREATE TABLE IF NOT EXISTS "_emdash_oauth_clients" ("id" text primary key, "name" text not null, "redirect_uris" text not null, "scopes" text, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')));
CREATE TABLE IF NOT EXISTS "_emdash_cron_tasks" ("id" text primary key, "plugin_id" text not null, "task_name" text not null, "schedule" text not null, "is_oneshot" integer default 0 not null, "data" text, "next_run_at" text not null, "last_run_at" text, "status" text default 'idle' not null, "locked_at" text, "enabled" integer default 1 not null, "created_at" text default (datetime('now')), constraint "uq_cron_tasks_plugin_task" unique ("plugin_id", "task_name"));
CREATE TABLE IF NOT EXISTS "_emdash_comments" ("id" text primary key, "collection" text not null, "content_id" text not null, "parent_id" text references "_emdash_comments" ("id") on delete cascade, "author_name" text not null, "author_email" text not null, "author_user_id" text references "users" ("id") on delete set null, "body" text not null, "status" text default 'pending' not null, "ip_hash" text, "user_agent" text, "moderation_metadata" text, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')));
CREATE TABLE IF NOT EXISTS "_emdash_redirects" ("id" text primary key, "source" text not null, "destination" text not null, "type" integer default 301 not null, "is_pattern" integer default 0 not null, "enabled" integer default 1 not null, "hits" integer default 0 not null, "last_hit_at" text, "group_name" text, "auto" integer default 0 not null, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')));
CREATE TABLE IF NOT EXISTS "_emdash_404_log" ("id" text primary key, "path" text not null, "referrer" text, "user_agent" text, "ip" text, "created_at" text default (datetime('now')));
CREATE TABLE IF NOT EXISTS "_emdash_bylines" ("id" text primary key, "slug" text not null unique, "display_name" text not null, "bio" text, "avatar_media_id" text references "media" ("id") on delete set null, "website_url" text, "user_id" text references "users" ("id") on delete set null, "is_guest" integer default 0 not null, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')));
CREATE TABLE IF NOT EXISTS "_emdash_content_bylines" ("id" text primary key, "collection_slug" text not null, "content_id" text not null, "byline_id" text not null references "_emdash_bylines" ("id") on delete cascade, "sort_order" integer default 0 not null, "role_label" text, "created_at" text default (datetime('now')), constraint "content_bylines_unique" unique ("collection_slug", "content_id", "byline_id"));
CREATE TABLE IF NOT EXISTS "_emdash_rate_limits" ("key" text not null, "window" text not null, "count" integer default 1 not null, constraint "pk_rate_limits" primary key ("key", "window"));
CREATE TABLE IF NOT EXISTS "ec_pages" ("id" text primary key, "slug" text, "status" text default 'draft', "author_id" text, "primary_byline_id" text, "created_at" text default (datetime('now')), "updated_at" text default (datetime('now')), "published_at" text, "scheduled_at" text, "deleted_at" text, "version" integer default 1, "live_revision_id" text references "revisions" ("id"), "draft_revision_id" text references "revisions" ("id"), "locale" text default 'en' not null, "translation_group" text, "title" TEXT NOT NULL DEFAULT '', "content" JSON, constraint "ec_pages_slug_locale_unique" unique ("slug", "locale"));
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