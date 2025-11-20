import path from 'node:path'
import fs from 'fs-extra'

export const projectRoot = path.resolve(process.cwd(), '..')
export const srcRoot = path.resolve(projectRoot, 'src')

export const toCamel = (str) => {
  return str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^(.)/, (m) => m.toLowerCase())
}

export const toPascal = (str) => {
  const camel = toCamel(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

export const toKebab = (str, usePlural = false) => {
  // 直接转换为小写，去掉连字符转换
  let baseName = str.toLowerCase()
  
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

export const tsTypeOf = (javaType) => {
  const t = javaType.toLowerCase()
  if (['int', 'integer', 'long', 'bigdecimal', 'double', 'float'].includes(t)) return 'number'
  if (['string'].includes(t)) return 'string'
  if (['boolean'].includes(t)) return 'boolean'
  if (['localdatetime', 'datetime', 'date', 'timestamp'].includes(t)) return 'string'
  return 'any'
}