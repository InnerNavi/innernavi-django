import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const expected = readFileSync(resolve(import.meta.dirname, '../.node-version'), 'utf8').trim()
if (process.versions.node !== expected) {
  console.error(`Expected Node ${expected}; found ${process.versions.node}. Do not change global PATH automatically.`)
  process.exit(1)
}
const agent = process.env.npm_config_user_agent
if (agent && !agent.startsWith('npm/11.17.0 ')) {
  console.error(`Expected npm 11.17.0; found ${agent.split(' ')[0]}.`)
  process.exit(1)
}
