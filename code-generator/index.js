import path from 'node:path'
import fs from 'fs-extra'
import { runGeneration, parseYamlFile } from './core/generator.js'
import { rollbackLatest, rollbackBy } from './core/rollback.js'

const args = process.argv.slice(2)

const getArg = (name) => {
  const idx = args.indexOf(name)
  if (idx >= 0) return args[idx + 1]
  return null
}

const cmd = args[0]

const main = async () => {
  if (cmd === '--config') {
    const file = getArg('--config')
    if (!file) throw new Error('missing --config <path>')
    const cfg = await parseYamlFile(file)
    const res = await runGeneration(cfg)
    console.log('generated', res.stamp)
    return
  }
  if (cmd === '--rollback') {
    const stamp = getArg('--rollback')
    const res = stamp ? await rollbackBy(stamp) : await rollbackLatest()
    console.log('rolled back', res.stamp)
    return
  }
  console.log('Usage: node index.js --config <yaml> | --rollback [stamp]')
}

main().catch(async (e) => {
  try {
    const res = await rollbackLatest()
    console.error('error:', e.message || String(e))
    console.error('auto-rolled-back to', res.stamp)
  } catch (err) {
    console.error('rollback failed:', err.message || String(err))
  }
  process.exit(1)
})