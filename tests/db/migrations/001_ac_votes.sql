CREATE TABLE IF NOT EXISTS ac_votes (
  id          BIGSERIAL PRIMARY KEY,
  vehicle_id  INTEGER NOT NULL,
  vote        SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
  device_hash TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vehicle_id, device_hash)
);

CREATE INDEX IF NOT EXISTS ac_votes_vehicle_id_idx ON ac_votes (vehicle_id);
