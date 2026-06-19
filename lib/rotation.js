import RotationSetting from '../models/RotationSetting';

// Fetch the single global rotation document, creating it on first use.
export async function getRotationSetting() {
  let setting = await RotationSetting.findOne({ key: 'global' });
  if (!setting) {
    setting = await RotationSetting.create({ key: 'global' });
  }
  return setting;
}

// Pick the next agent for an incoming lead using round-robin.
// Returns an agent ObjectId, or null when rotation is off / pool is empty.
//
// The pointer is advanced atomically with $inc so two simultaneous
// submissions can't land on the same agent — keeping distribution fair.
export async function assignViaRotation() {
  const setting = await RotationSetting.findOne({ key: 'global' });
  if (!setting || !setting.enabled) return null;
  if (!Array.isArray(setting.agents) || setting.agents.length === 0) return null;

  const updated = await RotationSetting.findOneAndUpdate(
    { key: 'global', enabled: true },
    { $inc: { lastIndex: 1 } },
    { new: true }
  );
  if (!updated || !updated.agents.length) return null;

  const index = ((updated.lastIndex % updated.agents.length) + updated.agents.length) % updated.agents.length;
  return updated.agents[index] || null;
}