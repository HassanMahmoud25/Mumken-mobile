import test from "node:test";
import assert from "node:assert/strict";
import { createRepository } from "../src/discussion/repository";
import { formatDate, replies, roots } from "../src/discussion/model";
import type { CreateCommentInput } from "../src/discussion/types";

const input: CreateCommentInput = {
  recordId: "record-001",
  parentId: null,
  authorId: "user-001",
  body: "  A useful perspective  ",
  language: "en",
};
test("preserves supplied IDs, empty discussion, and chronological thread ordering", async () => {
  const data = await createRepository().loadInitialData();
  assert.equal(data.currentUser.id, "user-001");
  assert.equal(data.records.length, 4);
  assert.equal(
    data.comments.filter((c) => c.recordId === "record-002").length,
    0,
  );
  const comments = data.comments.filter((c) => c.recordId === "record-001");
  assert.deepEqual(
    roots(comments).map((c) => c.id),
    ["comment-005", "comment-003", "comment-001"],
  );
  assert.deepEqual(
    replies(data.comments, "comment-008").map((c) => c.id),
    ["comment-009", "comment-010"],
  );
});
test("submission trims text, uses UTC, and stays in its session and record", async () => {
  const repo = createRepository();
  const created = await repo.createComment(input);
  assert.equal(created.body, input.body.trim());
  assert.match(created.createdAt, /Z$/);
  const data = await repo.loadInitialData();
  assert.equal(data.comments.filter((c) => c.id === created.id).length, 1);
  assert.equal(data.comments.at(-1)?.recordId, input.recordId);
  assert.equal(
    (await createRepository().loadInitialData()).comments.some(
      (c) => c.id === created.id,
    ),
    false,
  );
});
test("rejects empty, long, unknown record, impersonation, invalid locale and nested/cross-record replies", async () => {
  const repo = createRepository();
  for (const [patch, error] of [
    [{ body: " \n " }, "EMPTY_COMMENT"],
    [{ body: "a".repeat(2001) }, "COMMENT_TOO_LONG"],
    [{ recordId: "missing" }, "UNAVAILABLE"],
    [{ authorId: "user-002" }, "INVALID_AUTHOR"],
    [{ language: "fr" }, "INVALID_LOCALE"],
    [{ parentId: "comment-002" }, "INVALID_REPLY_TARGET"],
    [{ parentId: "comment-006" }, "INVALID_REPLY_TARGET"],
    [{ parentId: "missing" }, "INVALID_REPLY_TARGET"],
  ] as const)
    await assert.rejects(
      repo.createComment({ ...input, ...patch } as CreateCommentInput),
      new RegExp(error),
    );
  assert.equal(
    (await repo.createComment({ ...input, body: "a".repeat(2000) })).body
      .length,
    2000,
  );
});
test("one-time submission failure leaves input unchanged, writes nothing, and retry creates exactly one reply", async () => {
  const repo = createRepository({
    development: true,
    delay: 0,
    scenario: "submit-error",
  });
  const draft = { ...input, parentId: "comment-001" };
  const count = (await repo.loadInitialData()).comments.length;
  await assert.rejects(repo.createComment(draft), /DEMO_REQUEST_FAILED/);
  assert.equal(draft.body, input.body);
  assert.equal((await repo.loadInitialData()).comments.length, count);
  const reply = await repo.createComment(draft);
  assert.equal(reply.parentId, "comment-001");
  assert.equal((await repo.loadInitialData()).comments.length, count + 1);
});
test("initial and discussion failures recover on retry; missing record remains unavailable", async () => {
  const initial = createRepository({
    development: true,
    delay: 0,
    scenario: "initial-error",
  });
  await assert.rejects(initial.loadInitialData());
  assert.equal((await initial.loadInitialData()).records.length, 4);
  const detail = createRepository({
    development: true,
    delay: 0,
    scenario: "load-error",
  });
  await assert.rejects(detail.loadRecord("record-001"));
  await detail.loadRecord("record-001");
  await assert.rejects(detail.loadRecord("missing"), /UNAVAILABLE/);
});
test("production ignores every simulated failure and empty-records scenario", async () => {
  for (const scenario of [
    "initial-error",
    "load-error",
    "submit-error",
    "empty-records",
  ] as const) {
    const repo = createRepository({ scenario, development: false });
    assert.equal((await repo.loadInitialData()).records.length, 4);
    await repo.loadRecord("record-001");
    await repo.createComment(input);
  }
});
test("development empty records is explicit and localized dates represent the same UTC instant", async () => {
  assert.equal(
    (
      await createRepository({
        development: true,
        delay: 0,
        scenario: "empty-records",
      }).loadInitialData()
    ).records.length,
    0,
  );
  assert.equal(formatDate("invalid", "en"), "");
  assert.match(formatDate("2026-10-24T08:30:00Z", "en", "UTC"), /8:30/);
  assert.match(
    formatDate("2026-10-24T08:30:00Z", "en", "Asia/Riyadh"),
    /11:30/,
  );
  assert.ok(formatDate("2026-10-24T08:30:00Z", "ar", "UTC").length > 0);
});

test("Arabic stays Gregorian on native runtimes that ignore the calendar option", (context) => {
  const OriginalFormatter = Intl.DateTimeFormat;
  context.mock.method(
    Intl,
    "DateTimeFormat",
    function (
      locales: Intl.LocalesArgument,
      options?: Intl.DateTimeFormatOptions,
    ) {
      const nativeOptions = { ...options };
      delete nativeOptions.calendar;
      return new OriginalFormatter(locales, nativeOptions);
    },
  );
  const formatted = formatDate("2026-10-24T08:30:00Z", "ar", "UTC");
  assert.match(formatted, /٢٠٢٦|2026/);
  assert.doesNotMatch(formatted, /١٤٤٨|1448|هـ/);
});
