CREATE TABLE migrations (
  version INTEGER,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT,
  kcal INTEGER,
  fat_total REAL,
  fat_saturated REAL,
  carbs_total REAL,
  carbs_sugar REAL,
  protein REAL,
  salt REAL,
  image_url TEXT,
  image_thumb_url TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
SELECT crsql_as_crr('products');

CREATE TABLE recipes (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT,
  portions INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SELECT crsql_as_crr('recipes');

CREATE TABLE recipe_items (
  recipe_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  weight_grams REAL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (recipe_id, product_id)
);
SELECT crsql_as_crr('recipe_items');

CREATE TABLE persons (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
SELECT crsql_as_crr('persons');

CREATE TABLE person_recipes (
  person_id TEXT NOT NULL,
  recipe_id TEXT NOT NULL,
  PRIMARY KEY (person_id, recipe_id)
);
SELECT crsql_as_crr('person_recipes');

CREATE TABLE app_state (
  key TEXT PRIMARY KEY NOT NULL,
  selected_person_id TEXT,
  onboarding_completed_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
SELECT crsql_as_crr('app_state');

CREATE TABLE recurring_events (
  id TEXT PRIMARY KEY NOT NULL,
  weekday INTEGER,
  hour INTEGER,
  minute INTEGER,
  event_type TEXT,
  product_to_eat_id TEXT,
  weight_grams_to_eat REAL,
  recipe_to_eat_id TEXT,
  portions_to_eat REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SELECT crsql_as_crr('recurring_events');
