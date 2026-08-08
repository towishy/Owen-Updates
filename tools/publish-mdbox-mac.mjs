import { createHash } from "node:crypto"
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { basename, join, resolve } from "node:path"
import { parse as parseYaml, stringify as stringifyYaml } from "yaml"

const options = parseArguments(process.argv.slice(2))
assert(/^\d+\.\d+\.\d+$/u.test(options.version), "--version must use x.y.z format")
assert(options.source, "--source is required")

const repositoryRoot = resolve(process.env.OWEN_UPDATES_ROOT ?? resolve(import.meta.dirname, ".."))
const productRoot = join(repositoryRoot, "owen-mdbox")
const sourceRoot = resolve(options.source)
const platformRoot = join(productRoot, "mac-arm")
const versionRoot = join(platformRoot, options.version)
const metadataName = "latest-mac.yml"
const metadata = parseYaml(await readFile(join(sourceRoot, metadataName), "utf8"))
const archiveNames = [
  `owen-mdbox-${options.version}-macos-arm64.zip`,
  `owen-mdbox-${options.version}-macos-arm64.dmg`,
]
const artifactNames = archiveNames.flatMap((fileName) => [fileName, `${fileName}.blockmap`])

assert(String(metadata.version) === options.version, "latest-mac.yml version does not match --version")
for (const archiveName of archiveNames) {
  assert(metadata.files?.some((file) => basename(new URL(file.url, "https://placeholder.invalid").pathname) === archiveName), `latest-mac.yml does not contain ${archiveName}`)
}

await mkdir(versionRoot, { recursive: true })
for (const fileName of artifactNames) {
  await copyImmutable(join(sourceRoot, fileName), join(versionRoot, fileName))
}
const publishedMetadata = structuredClone(metadata)
publishedMetadata.files = publishedMetadata.files.map((file) => ({
  ...file,
  url: basename(new URL(file.url, "https://placeholder.invalid").pathname),
}))
await writeImmutableMetadata(publishedMetadata, join(versionRoot, metadataName))

const checksumLines = []
for (const fileName of artifactNames) {
  checksumLines.push(`${await digest(join(versionRoot, fileName), "sha256", "hex")}  ${fileName}`)
}
await writeFile(join(versionRoot, "SHA256SUMS.txt"), `${checksumLines.join("\n")}\n`, "utf8")

console.log(`Prepared owen-mdbox/mac-arm/${options.version}; pin update.json after committing these artifacts.`)

async function copyImmutable(source, destination) {
  const sourceHash = await digest(source, "sha256", "hex")
  try {
    const destinationHash = await digest(destination, "sha256", "hex")
    assert(destinationHash === sourceHash, `${basename(destination)} already exists with different content`)
  } catch (error) {
    if (error?.code !== "ENOENT") throw error
    await copyFile(source, destination)
  }
}

async function writeImmutableMetadata(sourceMetadata, destination) {
  try {
    const destinationMetadata = parseYaml(await readFile(destination, "utf8"))
    const normalize = (metadata) => ({
      ...metadata,
      files: metadata.files.map((file) => ({ ...file, url: basename(new URL(file.url, "https://placeholder.invalid").pathname) })),
    })
    assert(JSON.stringify(normalize(destinationMetadata)) === JSON.stringify(normalize(sourceMetadata)), `${basename(destination)} already exists with different content`)
  } catch (error) {
    if (error?.code !== "ENOENT") throw error
    await writeFile(destination, stringifyYaml(sourceMetadata), "utf8")
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