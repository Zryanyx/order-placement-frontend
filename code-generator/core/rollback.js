import { rollbackByStamp, latestBackupStamp } from './utils.js'

export const rollbackLatest = async () => {
  const stamp = await latestBackupStamp()
  if (!stamp) throw new Error('no backups')
  await rollbackByStamp(stamp)
  return { ok: true, stamp }
}

export const rollbackBy = async (stamp) => {
  await rollbackByStamp(stamp)
  return { ok: true, stamp }
}