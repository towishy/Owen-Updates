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
const platformRoot = join(productRoot, "windows-x64")
const versionRoot = join(platformRoot, options.version)
const metadataName = "latest.yml"
const metadataSource = join(sourceRoot, metadataName)
const metadata = parseYaml(await readFile(metadataSource, "utf8"))
const setupName = `owen-mdbox-${options.version}-windows-x64-setup.exe`
const archiveName = `owen-mdbox-${options.version}-windows-x64-setup.zip`
const blockmapName = `${setupName}.blockmap`

assert(String(metadata.version) === options.version, "latest.yml version does not match --version")
assert(metadata.path === setupName, "latest.yml path does not match the expected setup name")
assert(metadata.files?.some((file) => file.url === setupName), "latest.yml does not contain the setup file")

await mkdir(versionRoot, { recursive: true })
await copyImmutable(join(sourceRoot, setupName), join(versionRoot, setupName))
await copyImmutable(join(sourceRoot, archiveName), join(versionRoot, archiveName))
await copyImmutable(join(sourceRoot, blockmapName), join(versionRoot, blockmapName))
const publishedMetadata = structuredClone(metadata)
publishedMetadata.files = publishedMetadata.files.map((file) => ({
  ...file,
  url: basename(new URL(file.url, "https://placeholder.invalid").pathname),
}))
await writeImmutableMetadata(publishedMetadata, join(versionRoot, metadataName))

const checksumLines = []
for (const fileName of [setupName, archiveName, blockmapName]) {
  checksumLines.push(`${await digest(join(versionRoot, fileName), "sha256", "hex")}  ${fileName}`)
}
await writeFile(join(versionRoot, "SHA256SUMS.txt"), `${checksumLines.join("\n")}\n`, "utf8")

console.log(`Prepared owen-mdbox/windows-x64/${options.version}; pin update.json after committing these artifacts.`)

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