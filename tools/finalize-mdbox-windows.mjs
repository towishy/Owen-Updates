import { readFile, writeFile } from "node:fs/promises"
import { basename, resolve } from "node:path"
import { parse as parseYaml, stringify as stringifyYaml } from "yaml"

const options = parseArguments(process.argv.slice(2))
assert(/^\d+\.\d+\.\d+$/u.test(options.version), "--version must use x.y.z format")
assert(/^[a-f0-9]{40}$/u.test(options.revision), "--revision must be a full lowercase Git commit SHA")

const metadataPath = resolve(import.meta.dirname, "..", "owen-mdbox", "windows-x64", options.version, "latest.yml")
const metadata = parseYaml(await readFile(metadataPath, "utf8"))
assert(String(metadata.version) === options.version, "latest.yml version does not match --version")
metadata.files = metadata.files.map((file) => {
  const fileName = basename(new URL(file.url, "https://placeholder.invalid").pathname)
  return {
    ...file,
    url: `https://media.githubusercontent.com/media/towishy/Owen-Updates/${options.revision}/owen-mdbox/windows-x64/${options.version}/${fileName}`,
  }
})
await writeFile(metadataPath, stringifyYaml(metadata), "utf8")

console.log(`Finalized owen-mdbox/windows-x64/${options.version} binaries at ${options.revision}.`)

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