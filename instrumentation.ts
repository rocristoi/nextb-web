const DEV_DEVICE_HASH_SALT = "nextb-dev-salt";

function warnIfInsecureProductionConfig() {
  if (process.env.NODE_ENV !== "production") return;

  const salt = process.env.DEVICE_HASH_SALT ?? DEV_DEVICE_HASH_SALT;
  if (salt === DEV_DEVICE_HASH_SALT) {
    console.warn(
      "[nextb] DEVICE_HASH_SALT is unset or still the dev default. Set a unique secret in production."
    );
  }

  if (!process.env.DATABASE_URL) {
    console.warn(
      "[nextb] DATABASE_URL is unset. AC votes will use in-memory storage and will not persist across instances."
    );
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    warnIfInsecureProductionConfig();
    const { ensureGtfsData } = await import("@/lib/server/gtfs-download");
    ensureGtfsData().catch(console.error);
    const { seedLegacyNoAcVotes } = await import("@/lib/server/ac-votes");
    seedLegacyNoAcVotes().catch(console.error);
  }
}
