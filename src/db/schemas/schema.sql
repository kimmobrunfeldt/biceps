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
  PRIMARY KEY (recipe_id, item_id)
);
SELECT crsql_as_crr('recipe_items');
