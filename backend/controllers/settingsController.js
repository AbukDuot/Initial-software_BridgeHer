import * as SettingsModel from "../models/settingsModel.js";

export async function getMySettings(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Authentication required" });
    const settings = await SettingsModel.getSettings(userId);
    return res.json({ settings: settings || {} });
  } catch (err) {
    next(err);
  }
}

export async function updateMySettings(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Authentication required" });
    const payload = req.body.settings || req.body;
    const updated = await SettingsModel.upsertSettings(userId, payload);
    return res.json({ settings: updated });
  } catch (err) {
    next(err);
  }
}