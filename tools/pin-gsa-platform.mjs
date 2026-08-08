import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"

const options = parseArguments(process.argv.slice(2))
assert(/^\d+\.\d+\.\d+$/u.test(options.version), "--version must use x.y.z format")
assert(/^[a-f0-9]{40}$/u.test(options.revision), "--revision must be a full lowercase Git commit SHA")
assert(["windows-x64", "mac-arm"].includes(options.platform), "--platform must be windows-x64 or mac-arm")

const repositoryRoot = resolve(import.meta.dirname, "..")
const manifestPath = resolve(repositoryRoot, "gsa-dashboard", "update.json")
await mkdir(dirname(manifestPath), { recursive: true })
let manifest = { schemaVersion: 1, product: "gsa-dashboard", platforms: {} }
try {
  manifest = JSON.parse(await readFile(manifestPath, "utf8"))
} catch (error) {
  if (error?.code !== "ENOENT") throw error
}
assert(manifest.schemaVersion === 1 && manifest.product === "gsa-dashboard", "gsa-dashboard manifest identity mismatch")
manifest.platforms[options.platform] = {
  version: options.version,
  feedUrl: `https://raw.githubusercontent.com/towishy/Owen-Updates/${options.revision}/gsa-dashboard/${options.platform}/${options.version}`,
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8")

console.log(`Pinned gsa-dashboard/${options.platform}/${options.version} to ${options.revision}.`)

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
