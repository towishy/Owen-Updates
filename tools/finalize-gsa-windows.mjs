import { readFile, writeFile } from "node:fs/promises"
import { basename, resolve } from "node:path"

const options = parseArguments(process.argv.slice(2))
assert(/^\d+\.\d+\.\d+$/u.test(options.version), "--version must use x.y.z format")
assert(/^[a-f0-9]{40}$/u.test(options.revision), "--revision must be a full lowercase Git commit SHA")

const metadataPath = resolve(import.meta.dirname, "..", "gsa-dashboard", "windows-x64", options.version, "releases.win.json")
const metadata = JSON.parse(await readFile(metadataPath, "utf8"))
assert(Array.isArray(metadata.Assets), "releases.win.json must contain Assets")
metadata.Assets = metadata.Assets.map((asset) => {
  const fileName = basename(new URL(asset.FileName, "https://placeholder.invalid").pathname)
  return {
    ...asset,
    FileName: `https://media.githubusercontent.com/media/towishy/Owen-Updates/${options.revision}/gsa-dashboard/windows-x64/${options.version}/${fileName}`,
  }
})
await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8")

console.log(`Finalized gsa-dashboard/windows-x64/${options.version} binaries at ${options.revision}.`)

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
