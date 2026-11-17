CREATE TABLE IF NOT EXISTS artists (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    genre TEXT
);

CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    artist_id INTEGER REFERENCES artists(id),
    duration INTEGER
);

CREATE TABLE IF NOT EXISTS streams (
    id INTEGER PRIMARY KEY,
    track_id INTEGER REFERENCES tracks(id),
    played_at TEXT,
    country TEXT
);
