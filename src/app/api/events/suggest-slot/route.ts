import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeam } from "@/lib/requireTeam";

const BUSINESS_START_HOUR = 9;
const BUSINESS_END_HOUR = 17;
const SEARCH_DAYS = 14;

function findNextAvailableSlot(
  existingEvents: { startTime: Date; endTime: Date }[],
  durationMinutes: number,
  searchStart: Date
): { start: Date; end: Date } | null {
  const durationMs = durationMinutes * 60 * 1000;

  for (let dayOffset = 0; dayOffset < SEARCH_DAYS; dayOffset++) {
    const day = new Date(searchStart);
    day.setDate(day.getDate() + dayOffset);
    const dayOfWeek = day.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dayStart = new Date(day);
    dayStart.setHours(BUSINESS_START_HOUR, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(BUSINESS_END_HOUR, 0, 0, 0);

    let cursor = dayOffset === 0 && searchStart > dayStart ? new Date(searchStart) : new Date(dayStart);
    const minutes = cursor.getMinutes();
    if (minutes % 30 !== 0 || cursor.getSeconds() > 0) {
      cursor.setMinutes(Math.ceil(minutes / 30) * 30, 0, 0);
    }

    while (cursor.getTime() + durationMs <= dayEnd.getTime()) {
      const slotEnd = new Date(cursor.getTime() + durationMs);
      const overlaps = existingEvents.some((e) => cursor < e.endTime && slotEnd > e.startTime);
      if (!overlaps) {
        return { start: new Date(cursor), end: slotEnd };
      }
      cursor = new Date(cursor.getTime() + 30 * 60 * 1000);
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const { teamId, error } = await requireTeam();
  if (error) return error;

  const { durationMinutes } = await req.json();
  const duration = Number(durationMinutes) || 30;

  const now = new Date();
  const searchWindowEnd = new Date(now);
  searchWindowEnd.setDate(searchWindowEnd.getDate() + SEARCH_DAYS);

  const existingEvents = await prisma.event.findMany({
    where: {
      candidate: { role: { teamId } },
      startTime: { lt: searchWindowEnd },
      endTime: { gt: now },
    },
    select: { startTime: true, endTime: true },
  });

  const slot = findNextAvailableSlot(existingEvents, duration, now);

  if (!slot) {
    return NextResponse.json(
      { error: "No available slot found in the next two weeks" },
      { status: 404 }
    );
  }

  return NextResponse.json(slot);
}
