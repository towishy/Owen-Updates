import { createHash } from "node:crypto"
import { readFile, stat } from "node:fs/promises"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parse as parseYaml } from "yaml"

const repositoryRoot = resolve(process.env.OWEN_UPDATES_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), ".."))
const products = ["owen-mdbox"]
const platformMetadata = {
  "mac-arm": "latest-mac.yml",
  "windows-x64": "latest.yml",
}

for (const product of products) {
  await validateProduct(product)
}

console.log(`Validated ${products.length} product update feed(s).`)

async function validateProduct(product) {
  const productRoot = join(repositoryRoot, product)
  const manifest = JSON.parse(await readFile(join(productRoot, "update.json"), "utf8"))
  assert(manifest.schemaVersion === 1, `${product}: unsupported schemaVersion`)
  assert(manifest.product === product, `${product}: product name mismatch`)
  assert(isRecord(manifest.platforms), `${product}: platforms must be an object`)

  const platformEntries = Object.entries(manifest.platforms)
  assert(platformEntries.length > 0, `${product}: at least one platform feed is required`)
  for (const [platform, update] of platformEntries) {
    assert(Object.hasOwn(platformMetadata, platform), `${product}: unsupported platform ${platform}`)
    assert(isRecord(update), `${product}/${platform}: update entry must be an object`)
    assert(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(update.version), `${product}/${platform}: invalid version`)

    const feedUrl = new URL(update.feedUrl)
    const expectedPath = new RegExp(`^/towishy/Owen-Updates/[a-f0-9]{40}/${product}/${platform}/${update.version}$`, "u")
    assert(feedUrl.protocol === "https:" && feedUrl.hostname === "raw.githubusercontent.com" && expectedPath.test(feedUrl.pathname), `${product}/${platform}: feedUrl must pin a commit containing its version folder`)
    await validateVersionFeed(product, productRoot, platform, update.version)
  }
}

async function validateVersionFeed(product, productRoot, platform, version) {
  const versionRoot = join(productRoot, platform, version)
  const metadata = parseYaml(await readFile(join(versionRoot, platformMetadata[platform]), "utf8"))
  assert(isRecord(metadata), `${platform}/${version}: updater metadata must be an object`)
  assert(String(metadata.version) === version, `${platform}/${version}: metadata version mismatch`)
  assert(Array.isArray(metadata.files) && metadata.files.length > 0, `${platform}/${version}: metadata files are required`)

  for (const file of metadata.files) {
    assert(isRecord(file) && typeof file.url === "string", `${platform}/${version}: invalid update file entry`)
    const fileUrl = new URL(file.url)
    const fileName = basename(fileUrl.pathname)
    const expectedFilePath = new RegExp(`^/media/towishy/Owen-Updates/[a-f0-9]{40}/${product}/${platform}/${version}/${fileName}$`, "u")
    assert(fileUrl.protocol === "https:" && fileUrl.hostname === "media.githubusercontent.com" && expectedFilePath.test(fileUrl.pathname), `${platform}/${version}: invalid update file URL`)
    const filePath = join(versionRoot, fileName)
    const fileStat = await stat(filePath)
    assert(fileStat.size === file.size, `${platform}/${version}/${fileName}: size mismatch`)
    assert(await digest(filePath, "sha512", "base64") === file.sha512, `${platform}/${version}/${fileName}: SHA-512 mismatch`)
  }

  assert(metadata.path === basename(metadata.path), `${platform}/${version}: invalid primary update path`)
  const primaryFile = metadata.files.find((file) => basename(new URL(file.url).pathname) === metadata.path)
  assert(primaryFile?.sha512 === metadata.sha512, `${platform}/${version}: primary SHA-512 mismatch`)

  const checksumPath = join(versionRoot, "SHA256SUMS.txt")
  const checksumLines = (await readFile(checksumPath, "utf8")).trim().split(/\r?\n/u)
  const checksums = new Map(checksumLines.map((line) => {
    const match = /^([a-f0-9]{64})  ([^/\\]+)$/u.exec(line)
    assert(match, `${platform}/${version}: invalid SHA256SUMS line`)
    return [match[2], match[1]]
  }))
  const metadataFiles = metadata.files.map((file) => basename(new URL(file.url).pathname))
  const requiredFiles = platform === "windows-x64"
    ? [metadata.path, `${metadata.path}.blockmap`]
    : metadataFiles.flatMap((fileName) => [fileName, `${fileName}.blockmap`])
  for (const fileName of requiredFiles) {
    assert(checksums.has(fileName), `${platform}/${version}/${fileName}: missing SHA-256 entry`)
    assert(await digest(join(versionRoot, fileName), "sha256", "hex") === checksums.get(fileName), `${platform}/${version}/${fileName}: SHA-256 mismatch`)
  }
}

async function digest(path, algorithm, encoding) {
  return createHash(algorithm).update(await readFile(path)).digest(encoding)
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}