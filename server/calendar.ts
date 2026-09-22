import { Request, Response } from "express";

export interface ScheduleItemPayload {
  id?: string;
  day?: string;
  timeSlot?: string;
  subject?: string;
  topic?: string;
  durationMinutes?: number;
}

// Generate standard RFC 5545 iCalendar string
export function generateIcs(sessions: ScheduleItemPayload[]): string {
  const nowStr = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  // Calculate next dates for days of week
  const dayIndexMap: Record<string, number> = {
    dimanche: 0,
    lundi: 1,
    mardi: 2,
    mercredi: 3,
    jeudi: 4,
    vendredi: 5,
    samedi: 6,
  };

  const slotHourMap: Record<string, number> = {
    matin: 9,
    "après-midi": 14,
    apres_midi: 14,
    soir: 19,
  };

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ChronoStudy//Academic Study Planner//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Planning ChronoStudy",
    "X-WR-TIMEZONE:Europe/Paris",
  ];

  const today = new Date();

  sessions.forEach((s, idx) => {
    const rawDay = (s.day || "lundi").toLowerCase();
    const targetDayNum = dayIndexMap[rawDay] ?? 1;
    const dayDiff = (targetDayNum - today.getDay() + 7) % 7;
    
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + (dayDiff === 0 ? 7 : dayDiff));

    const rawSlot = (s.timeSlot || "matin").toLowerCase();
    const startHour = slotHourMap[rawSlot] ?? 9;
    eventDate.setHours(startHour, 0, 0, 0);

    const durationMin = Number(s.durationMinutes) || 60;
    const endDate = new Date(eventDate.getTime() + durationMin * 60 * 1000);

    const dtStart = eventDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dtEnd = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const uid = `cs-event-${s.id || idx}-${Date.now()}@chronostudy.app`;
    const summary = `${s.subject || "Études"} : ${s.topic || "Session de révision"}`;
    const description = `Session planifiée avec ChronoStudy.\\nCréneau : ${s.timeSlot || "Standard"}\\nDurée : ${durationMin} minutes.`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowStr}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${summary.replace(/,/g, "\\,")}`);
    lines.push(`DESCRIPTION:${description}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("TRANSP:OPAQUE");
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export const CalendarController = {
  exportIcs(req: Request, res: Response) {
    const { sessions } = req.body || {};
    const sessionList: ScheduleItemPayload[] = Array.isArray(sessions) && sessions.length > 0
      ? sessions
      : [
          { day: "Lundi", timeSlot: "Matin", subject: "Mathématiques", topic: "Algèbre Linéaire", durationMinutes: 90 },
          { day: "Mardi", timeSlot: "Après-midi", subject: "Informatique", topic: "Algorithmique & Graphes", durationMinutes: 120 },
          { day: "Jeudi", timeSlot: "Matin", subject: "Physique", topic: "Électromagnétisme", durationMinutes: 90 },
        ];

    const icsContent = generateIcs(sessionList);

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="chronostudy-planning.ics"`);
    return res.send(icsContent);
  },
};
