import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createUnauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("ChronoStudy protected procedures", () => {
  it("refuses profile access without a connected account", async () => {
    const caller = appRouter.createCaller(createUnauthenticatedContext());
    await expect(caller.profile.me()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("refuses subjects access without a connected account", async () => {
    const caller = appRouter.createCaller(createUnauthenticatedContext());
    await expect(caller.subjects.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("refuses Pomodoro writes without a connected account", async () => {
    const caller = appRouter.createCaller(createUnauthenticatedContext());
    await expect(caller.pomodoro.complete({
      plannedMinutes: 25,
      actualMinutes: 25,
      outcome: "completed",
      startedAt: new Date("2026-09-21T18:00:00Z"),
      endedAt: new Date("2026-09-21T18:25:00Z"),
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
