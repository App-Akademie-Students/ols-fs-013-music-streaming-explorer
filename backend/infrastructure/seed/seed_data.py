from contextlib import closing
from datetime import datetime, timedelta
from random import Random

from persistance.db.database import SCHEMA_PATH, get_db_connection


ARTISTS = [
    ("Neon Atlas", "Electronic"),
    ("Copper Pines", "Folk"),
    ("Mira Vale", "Pop"),
    ("Harbor Static", "Indie Rock"),
    ("Blue Hour Trio", "Jazz"),
    ("Northbound Signal", "Hip-Hop"),
    ("Sol de Tinta", "Latin"),
    ("June Meridian", "Soul"),
    ("Lowland Echo", "Ambient"),
    ("Marble Current", "House"),
    ("Orchard Lines", "Country"),
    ("Ivory Transit", "Classical"),
    ("Paper Voltage", "Punk"),
    ("Saffron Coast", "Reggae"),
    ("Iron Canopy", "Metal"),
]

TRACK_TITLES = [
    ("Parallel Lights", "Night Circuit", "Afterimage", "Soft Reset"),
    ("Cedar Road", "North Window", "Harvest Moonrise", "Field Notes"),
    ("Say It Slowly", "Silver Day", "Same Sky", "Anywhere Tonight"),
    ("Breakwater", "Small Signals", "Open Channel", "Second Shore"),
    ("Table for Two", "Late Check-In", "Velvet Steps", "Corner Booth"),
    ("No Transfers", "Side Street", "Last Train"),
    ("Luz de Enero", "Mar Abierto", "Punto de Partida"),
    ("Room for June", "In Your Corner", "Hold the Line"),
    ("Quiet Inlet", "Drifting North", "Between Tides"),
    ("Under Glass", "Close to Dawn", "Night Exchange"),
    ("Fencepost Letters", "Porch Swing", "Winding Road"),
    ("Morning Prelude", "Glass Sonata", "Evening Waltz"),
    ("Cut the Wire", "Streetlight Fever", "Bad Reception"),
    ("Sun on the Water", "Easy Current", "Golden Sand"),
    ("Stone Crown", "Black Timber", "Furnace Sky"),
]

COUNTRIES = ("DE", "AT", "CH", "US", "GB", "FR", "BR", "ES", "JP", "CA")


def seed_db():
    random = Random(42)
    artists = [(artist_id, *artist) for artist_id, artist in enumerate(ARTISTS, start=1)]
    tracks = []
    for artist_id, titles in enumerate(TRACK_TITLES, start=1):
        for title in titles:
            tracks.append((len(tracks) + 1, title, artist_id, random.randint(120, 360)))

    # Give every track at least one play and vary the remaining play counts.
    track_ids = [track_id for track_id, *_ in tracks]
    played_tracks = track_ids + random.choices(
        track_ids, weights=range(len(track_ids), 0, -1), k=1000 - len(track_ids)
    )
    random.shuffle(played_tracks)
    start = datetime(2025, 1, 1)
    streams = [
        (
            stream_id,
            track_id,
            (start + timedelta(seconds=random.randrange(365 * 24 * 60 * 60))).isoformat(
                sep=" ", timespec="seconds"
            ),
            random.choice(COUNTRIES),
        )
        for stream_id, track_id in enumerate(played_tracks, start=1)
    ]

    tables = (
        ("artists", "id, name, genre", artists),
        ("tracks", "id, title, artist_id, duration", tracks),
        ("streams", "id, track_id, played_at, country", streams),
    )
    with closing(get_db_connection()) as conn, conn:
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        conn.execute("BEGIN IMMEDIATE")
        for table, columns, rows in tables:
            existing = [
                tuple(row)
                for row in conn.execute(f"SELECT {columns} FROM {table} ORDER BY id")
            ]
            if existing == rows:
                continue
            if existing:
                raise ValueError(f"Die Tabelle {table} enthält bereits andere Daten.")
            placeholders = ", ".join("?" for _ in rows[0])
            conn.executemany(f"INSERT INTO {table} ({columns}) VALUES ({placeholders})", rows)


if __name__ == "__main__":
    try:
        seed_db()
    except ValueError as exc:
        raise SystemExit(str(exc)) from exc
    print("Seed-Daten bereit: 15 Künstler, 50 Tracks und 1.000 Streams.")