CREATE TABLE migrations (
  version INTEGER,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
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
SELECT crsql_as_crr('items');

CREATE TABLE recipes (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SELECT crsql_as_crr('recipes');

CREATE TABLE recipe_items (
  recipe_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  weight_grams REAL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (recipe_id, item_id)
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
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
SELECT crsql_as_crr('app_state');
