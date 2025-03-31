CREATE TABLE "package_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_type" text NOT NULL,
	"default_cost" numeric(10, 2) NOT NULL,
	"default_deliverables" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "package_configs_package_type_unique" UNIQUE("package_type")
);
