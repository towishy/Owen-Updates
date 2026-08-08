import { createHash } from "node:crypto"
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { basename, join, resolve } from "node:path"
import { parse as parseYaml, stringify as stringifyYaml } from "yaml"

const options = parseArguments(process.argv.slice(2))
assert(/^\d+\.\d+\.\d+$/u.test(options.version), "--version must use x.y.z format")
assert(options.source, "--source is required")

const repositoryRoot = resolve(import.meta.dirname, "..")
const sourceRoot = resolve(options.source)
const platformRoot = join(repositoryRoot, "gsa-dashboard", "mac-arm")
const versionRoot = join(platformRoot, options.version)
const metadataName = "latest-mac.yml"
const metadata = parseYaml(await readFile(join(sourceRoot, metadataName), "utf8"))
assert(String(metadata.version) === options.version, "latest-mac.yml version does not match --version")
assert(Array.isArray(metadata.files) && metadata.files.length > 0, "latest-mac.yml must contain files")

const updateFiles = metadata.files.map((file) => basename(new URL(file.url, "https://placeholder.invalid").pathname))
const primaryName = basename(new URL(metadata.path, "https://placeholder.invalid").pathname)
assert(updateFiles.includes(primaryName), "latest-mac.yml primary path is missing from files")
assert(primaryName.endsWith(".zip"), "macOS primary updater artifact must be a ZIP")
const dmgName = options.dmg || `GSADashboard-${options.version}-mac-arm64.dmg`

await mkdir(versionRoot, { recursive: true })
for (const fileName of [...new Set([...updateFiles, dmgName])]) {
  await copyImmutable(join(sourceRoot, fileName), join(versionRoot, fileName))
}
const publishedMetadata = structuredClone(metadata)
publishedMetadata.path = primaryName
publishedMetadata.files = publishedMetadata.files.map((file) => ({
  ...file,
  url: basename(new URL(file.url, "https://placeholder.invalid").pathname),
}))
await writeImmutableMetadata(publishedMetadata, join(versionRoot, metadataName))

const payloads = [...new Set([...updateFiles, dmgName])]
const checksumLines = []
for (const fileName of payloads) {
  checksumLines.push(`${await digest(join(versionRoot, fileName), "sha256", "hex")}  ${fileName}`)
}
await writeImmutableText(`${checksumLines.join("\n")}\n`, join(versionRoot, "SHA256SUMS.txt"))

console.log(`Prepared gsa-dashboard/mac-arm/${options.version}; commit and push artifacts before finalizing metadata.`)

async function copyImmutable(source, destination) {
  const sourceHash = await digest(source, "sha256", "hex")
  try {
    assert(await digest(destination, "sha256", "hex") === sourceHash, `${basename(destination)} already exists with different content`)
  } catch (error) {
    if (error?.code !== "ENOENT") throw error
    await copyFile(source, destination)
  }
}

async function writeImmutableMetadata(value, destination) {
  const normalize = (text) => {
    const metadata = parseYaml(text)
    metadata.path = basename(new URL(metadata.path, "https://placeholder.invalid").pathname)
    metadata.files = metadata.files.map((file) => ({
      ...file,
      url: basename(new URL(file.url, "https://placeholder.invalid").pathname),
    }))
    return JSON.stringify(metadata)
  }
  await writeImmutableText(stringifyYaml(value), destination, normalize)
}

async function writeImmutableText(value, destination, normalize = (text) => text) {
  try {
    assert(normalize(await readFile(destination, "utf8")) === normalize(value), `${basename(destination)} already exists with different content`)
  } catch (error) {
    if (error?.code !== "ENOENT") throw error
    await writeFile(destination, value, "utf8")
  }
}

async function digest(path, algorithm, encoding) {
  return createHash(algorithm).update(await readFile(path)).digest(encoding)
}

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
