import { NextResponse } from "next/server";
import { listAcVoteStatuses } from "@/lib/server/ac-votes";
import { ro } from "@/lib/i18n";

export async function GET() {
  try {
    const statuses = await listAcVoteStatuses();
    return NextResponse.json({ statuses });
  } catch {
    return NextResponse.json({ error: ro.api.serverError }, { status: 500 });
  }
}
