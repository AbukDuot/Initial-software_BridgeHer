beforeAll(async () => {

  await jest.unstable_mockModule("../config/db.js", () => ({
    default: { query: jest.fn() },
  }));
});

describe("mentorshipModel (ESM-safe)", () => {
  let pool;
  let MentorshipModel;

  beforeAll(async () => {
    const dbMod = await import("../config/db.js");
    pool = dbMod.default;
    MentorshipModel = await import("../models/mentorshipModel.js");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("list() returns rows from pool.query", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, topic: "t1" }] });
    const rows = await MentorshipModel.list({});
    expect(pool.query).toHaveBeenCalled();
    expect(rows).toEqual([{ id: 1, topic: "t1" }]);
  });

  test("create() inserts and returns created row", async () => {
    const payload = { requester_id: 2, mentor_id: 1, topic: "X", message: "Y", status: "pending", scheduled_at: null };
    pool.query.mockResolvedValueOnce({ rows: [{ id: 999, ...payload }] });
    const created = await MentorshipModel.create(payload);
    expect(pool.query).toHaveBeenCalled();
    expect(created).toMatchObject({ id: 999, requester_id: 2, topic: "X" });
  });

  test("getById() returns single row or null", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 5, topic: "found" }] });
    const item = await MentorshipModel.getById(5);
    expect(item).toEqual({ id: 5, topic: "found" });

    pool.query.mockResolvedValueOnce({ rows: [] });
    const none = await MentorshipModel.getById(9999);
    expect(none).toBeNull();
  });
});