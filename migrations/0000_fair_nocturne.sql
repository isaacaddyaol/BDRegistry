CREATE TABLE "birth_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" varchar NOT NULL,
	"child_name" varchar NOT NULL,
	"child_sex" varchar NOT NULL,
	"date_of_birth" date NOT NULL,
	"time_of_birth" varchar,
	"place_of_birth" varchar NOT NULL,
	"father_name" varchar NOT NULL,
	"father_national_id" varchar NOT NULL,
	"father_date_of_birth" date,
	"father_occupation" varchar,
	"mother_name" varchar NOT NULL,
	"mother_national_id" varchar NOT NULL,
	"mother_date_of_birth" date,
	"mother_occupation" varchar,
	"submitted_by" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"review_notes" text,
	"certificate_number" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "birth_registrations_application_id_unique" UNIQUE("application_id"),
	CONSTRAINT "birth_registrations_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE "death_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" varchar NOT NULL,
	"deceased_name" varchar NOT NULL,
	"date_of_death" date NOT NULL,
	"time_of_death" varchar,
	"place_of_death" varchar NOT NULL,
	"cause_of_death" text NOT NULL,
	"next_of_kin_name" varchar NOT NULL,
	"next_of_kin_relationship" varchar NOT NULL,
	"next_of_kin_contact" varchar NOT NULL,
	"next_of_kin_national_id" varchar,
	"submitted_by" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar,
	"review_notes" text,
	"certificate_number" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "death_registrations_application_id_unique" UNIQUE("application_id"),
	CONSTRAINT "death_registrations_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" varchar NOT NULL,
	"application_type" varchar NOT NULL,
	"document_type" varchar NOT NULL,
	"file_name" varchar NOT NULL,
	"file_path" varchar NOT NULL,
	"file_size" integer,
	"mime_type" varchar,
	"uploaded_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" varchar DEFAULT 'public' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_token" varchar,
	"verification_token_expiry" timestamp,
	"reset_token" varchar,
	"reset_token_expiry" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");