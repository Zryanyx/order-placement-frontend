import path from 'node:path'
import fs from 'fs-extra'

export const projectRoot = path.resolve(process.cwd(), '..')
export const srcRoot = path.resolve(projectRoot, 'src')

export const nowStamp = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

export const toCamel = (str) => {
  return str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^(.)/, (m) => m.toLowerCase())
}

export const toPascal = (str) => {
  const camel = toCamel(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

export const toKebab = (str, usePlural = false) => {
  // 根据复数要求处理模块名
  let baseName = str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .toLowerCase()
  
  // 如果要求使用复数形式，则转换为复数
  if (usePlural) {
    baseName = toPlural(baseName)
  }
  
  return baseName
}

export const toPlural = (str) => {
  const s = str.toLowerCase()
  if (s.endsWith('y')) return s.slice(0, -1) + 'ies'
  if (s.endsWith('s') || s.endsWith('x') || s.endsWith('z') || s.endsWith('ch') || s.endsWith('sh')) return s + 'es'
  return s + 's'
}

export const ensureDir = async (p) => {
  await fs.ensureDir(p)
}

export const readText = async (p) => {
  try {
    return await fs.readFile(p, 'utf-8')
  } catch {
    return ''
  }
}

export const writeText = async (p, content) => {
  await fs.outputFile(p, content)
}

export const backupRoot = path.resolve(projectRoot, '.codegen-backups')

export const createBackup = async (files) => {
  const stamp = nowStamp()
  const dir = path.join(backupRoot, stamp)
  await fs.ensureDir(dir)
  const manifest = { stamp, files: [], created: [] }
  for (const file of files) {
    const abs = path.resolve(projectRoot, file)
    const rel = path.relative(projectRoot, abs)
    const dest = path.join(dir, rel)
    const exists = await fs.pathExists(abs)
    if (exists) {
      await fs.ensureDir(path.dirname(dest))
      await fs.copy(abs, dest)
      manifest.files.push(rel)
    }
  }
  await fs.writeJson(path.join(dir, 'manifest.json'), manifest, { spaces: 2 })
  return { stamp, dir }
}

export const recordCreated = async (stamp, createdPaths) => {
  const dir = path.join(backupRoot, stamp)
  const manifestPath = path.join(dir, 'manifest.json')
  const manifest = await fs.readJson(manifestPath)
  manifest.created.push(...createdPaths.map((p) => path.relative(projectRoot, path.resolve(projectRoot, p))))
  await fs.writeJson(manifestPath, manifest, { spaces: 2 })
}

export const rollbackByStamp = async (stamp) => {
  const dir = path.join(backupRoot, stamp)
  const manifestPath = path.join(dir, 'manifest.json')
  if (!(await fs.pathExists(manifestPath))) throw new Error('manifest not found')
  const manifest = await fs.readJson(manifestPath)
  for (const created of manifest.created) {
    const abs = path.resolve(projectRoot, created)
    if (await fs.pathExists(abs)) await fs.remove(abs)
  }
  for (const file of manifest.files) {
    const abs = path.resolve(projectRoot, file)
    const backupFile = path.join(dir, file)
    await fs.ensureDir(path.dirname(abs))
    await fs.copy(backupFile, abs)
  }
}

export const latestBackupStamp = async () => {
  if (!(await fs.pathExists(backupRoot))) return null
  const entries = await fs.readdir(backupRoot)
  const sort = entries.filter((e) => /^\d{8}-\d{6}$/.test(e)).sort()
  return sort.length ? sort[sort.length - 1] : null
}

export const tsTypeOf = (javaType) => {
  const t = javaType.toLowerCase()
  if (['int', 'integer', 'long', 'bigdecimal', 'double', 'float'].includes(t)) return 'number'
  if (['string'].includes(t)) return 'string'
  if (['boolean'].includes(t)) return 'boolean'
  if (['localdatetime', 'datetime', 'date', 'timestamp'].includes(t)) return 'string'
  return 'any'
}