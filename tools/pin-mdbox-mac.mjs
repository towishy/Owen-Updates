import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const options = parseArguments(process.argv.slice(2))
assert(/^\d+\.\d+\.\d+$/u.test(options.version), "--version must use x.y.z format")
assert(/^[a-f0-9]{40}$/u.test(options.revision), "--revision must be a full lowercase Git commit SHA")

const repositoryRoot = resolve(process.env.OWEN_UPDATES_ROOT ?? resolve(import.meta.dirname, ".."))
const manifestPath = resolve(repositoryRoot, "owen-mdbox", "update.json")
const manifest = JSON.parse(await readFile(manifestPath, "utf8"))
manifest.platforms["mac-arm"] = {
  version: options.version,
  feedUrl: `https://raw.githubusercontent.com/towishy/Owen-Updates/${options.revision}/owen-mdbox/mac-arm/${options.version}`,
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8")

console.log(`Pinned owen-mdbox/mac-arm/${options.version} to ${options.revision}.`)

function parseArguments(argumentsList) {
  const parsed = {}
  for (let index = 0; index < argumentsList.length; index += 2) {
    const name = argumentsList[index]?.replace(/^--/u, "")
    assert(name && argumentsList[index + 1], `missing value for ${argumentsList[index] ?? "argument"}`)
    parsed[name] = argumentsList[index + 1]
  }
  return parsed
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}