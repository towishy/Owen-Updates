import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { assertVersionExists, retainOnlyVersion } from "./release-retention.mjs"

const options = parseArguments(process.argv.slice(2))
assert(/^\d+\.\d+\.\d+$/u.test(options.version), "--version must use x.y.z format")
assert(/^[a-f0-9]{40}$/u.test(options.revision), "--revision must be a full lowercase Git commit SHA")

const repositoryRoot = resolve(process.env.OWEN_UPDATES_ROOT ?? resolve(import.meta.dirname, ".."))
const platformRoot = resolve(repositoryRoot, "owen-mdbox", "windows-x64")
const manifestPath = resolve(repositoryRoot, "owen-mdbox", "update.json")
await assertVersionExists(platformRoot, options.version)
const manifest = JSON.parse(await readFile(manifestPath, "utf8"))
manifest.schemaVersion = 2
manifest.platforms["windows-x64"] = {
  downloadUrl: `https://github.com/towishy/Owen-Updates/releases/download/owen-mdbox-windows-x64-${options.version}/owen-mdbox-${options.version}-windows-x64-setup.zip`,
  version: options.version,
  feedUrl: `https://raw.githubusercontent.com/towishy/Owen-Updates/${options.revision}/owen-mdbox/windows-x64/${options.version}`,
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8")
await retainOnlyVersion(platformRoot, options.version)

console.log(`Pinned owen-mdbox/windows-x64/${options.version} to ${options.revision}; removed previous builds.`)

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