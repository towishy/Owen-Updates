import { createHash } from "node:crypto"
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { basename, join, resolve } from "node:path"

const options = parseArguments(process.argv.slice(2))
assert(/^\d+\.\d+\.\d+$/u.test(options.version), "--version must use x.y.z format")
assert(options.source, "--source is required")

const repositoryRoot = resolve(import.meta.dirname, "..")
const sourceRoot = resolve(options.source)
const versionRoot = join(repositoryRoot, "gsa-dashboard", "windows-x64", options.version)
const metadataName = "releases.win.json"
const metadata = JSON.parse(await readFile(join(sourceRoot, metadataName), "utf8"))
const assets = metadata.Assets

assert(Array.isArray(assets) && assets.length > 0, "releases.win.json must contain Assets")
const fullAsset = assets.find((asset) => asset.Type === "Full" && String(asset.Version) === options.version)
assert(fullAsset, "releases.win.json does not contain the requested full release")
const packageName = basename(new URL(fullAsset.FileName, "https://placeholder.invalid").pathname)
assert(packageName === `gsa-dashboard-${options.version}-full.nupkg`, "unexpected Velopack package name")
const setupName = "gsa-dashboard-win-Setup.exe"

await mkdir(versionRoot, { recursive: true })
for (const fileName of [packageName, setupName]) {
  await copyImmutable(join(sourceRoot, fileName), join(versionRoot, fileName))
}
const publishedMetadata = structuredClone(metadata)
publishedMetadata.Assets = publishedMetadata.Assets.map((asset) => ({
  ...asset,
  FileName: basename(new URL(asset.FileName, "https://placeholder.invalid").pathname),
}))
await writeImmutableJson(publishedMetadata, join(versionRoot, metadataName))

const checksumLines = []
for (const fileName of [packageName, setupName]) {
  checksumLines.push(`${await digest(join(versionRoot, fileName), "sha256", "hex")}  ${fileName}`)
}
await writeImmutableText(`${checksumLines.join("\n")}\n`, join(versionRoot, "SHA256SUMS.txt"))

console.log(`Prepared gsa-dashboard/windows-x64/${options.version}; commit and push artifacts before finalizing metadata.`)

async function copyImmutable(source, destination) {
  const sourceHash = await digest(source, "sha256", "hex")
  try {
    assert(await digest(destination, "sha256", "hex") === sourceHash, `${basename(destination)} already exists with different content`)
  } catch (error) {
    if (error?.code !== "ENOENT") throw error
    await copyFile(source, destination)
  }
}

async function writeImmutableJson(value, destination) {
  const normalize = (text) => {
    const metadata = JSON.parse(text)
    metadata.Assets = metadata.Assets.map((asset) => ({
      ...asset,
      FileName: basename(new URL(asset.FileName, "https://placeholder.invalid").pathname),
    }))
    return JSON.stringify(metadata)
  }
  await writeImmutableText(`${JSON.stringify(value, null, 2)}\n`, destination, normalize)
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
