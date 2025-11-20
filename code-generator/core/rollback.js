import fs from 'fs-extra'
import path from 'node:path'

const backupDir = path.join(process.cwd(), '.codegen-backups')

const getLatestBackup = async () => {
  if (!(await fs.pathExists(backupDir))) {
    return null
  }
  const entries = await fs.readdir(backupDir)
  const stamps = entries.filter(e => /^\d{8}-\d{6}$/.test(e)).sort().reverse()
  return stamps.length > 0 ? stamps[0] : null
}

export const listBackups = async () => {
  if (!(await fs.pathExists(backupDir))) {
    return []
  }
  
  const entries = await fs.readdir(backupDir)
  const stamps = entries.filter(e => /^\d{8}-\d{6}$/.test(e)).sort().reverse()
  
  const backups = []
  for (const stamp of stamps) {
    const backupPath = path.join(backupDir, stamp)
    const manifestPath = path.join(backupPath, 'manifest.json')
    
    if (await fs.pathExists(manifestPath)) {
      try {
        const manifest = await fs.readJson(manifestPath)
        backups.push({
          timestamp: stamp,
          files: manifest.files || []
        })
      } catch (error) {
        // 如果manifest文件损坏，仍然显示备份但无文件信息
        backups.push({
          timestamp: stamp,
          files: []
        })
      }
    } else {
      // 如果没有manifest文件，只显示时间戳
      backups.push({
        timestamp: stamp,
        files: []
      })
    }
  }
  
  return backups
}

export const rollbackLatest = async () => {
  const stamp = await getLatestBackup()
  if (!stamp) {
    throw new Error('No backups found')
  }
  return await rollbackBy(stamp)
}

export const rollbackBy = async (stamp) => {
  const backupPath = path.join(backupDir, stamp)
  if (!(await fs.pathExists(backupPath))) {
    throw new Error(`Backup ${stamp} not found`)
  }
  
  const manifestPath = path.join(backupPath, 'manifest.json')
  if (!(await fs.pathExists(manifestPath))) {
    throw new Error(`Manifest not found in backup ${stamp}`)
  }
  
  const manifest = await fs.readJson(manifestPath)
  const srcPath = path.join(process.cwd(), 'src')
  
  // 恢复备份的文件
  for (const filePath of manifest.files) {
    const backupFilePath = path.join(backupPath, filePath)
    const targetFilePath = path.join(srcPath, filePath)
    
    if (await fs.pathExists(backupFilePath)) {
      await fs.ensureDir(path.dirname(targetFilePath))
      await fs.copy(backupFilePath, targetFilePath)
    }
  }
  
  return { stamp, files: manifest.files }
}