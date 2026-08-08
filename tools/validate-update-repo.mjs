import { createHash } from "node:crypto"
import { readdir, readFile, stat } from "node:fs/promises"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parse as parseYaml } from "yaml"

const repositoryRoot = resolve(process.env.OWEN_UPDATES_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), ".."))
const products = {
  "gsa-dashboard": {
    allowEmpty: true,
    platforms: {
      "mac-arm": { kind: "electron", metadata: "latest-mac.yml", required: (version) => [`GSADashboard-${version}-mac-arm64.dmg`] },
      "windows-x64": { kind: "velopack", metadata: "releases.win.json", required: () => ["gsa-dashboard-win-Setup.exe"] },
    },
  },
  "owen-mdbox": {
    platforms: {
      "mac-arm": { kind: "electron", metadata: "latest-mac.yml", required: () => [] },
      "windows-x64": { kind: "electron", metadata: "latest.yml", required: () => [] },
    },
  },
}

let validatedProducts = 0
for (const [product, config] of Object.entries(products)) {
  try {
    await validateProduct(product, config)
    validatedProducts += 1
  } catch (error) {
    if (process.env.OWEN_UPDATES_ROOT && error?.code === "ENOENT") continue
    throw error
  }
}

console.log(`Validated ${validatedProducts} product update feed(s).`)

async function validateProduct(product, config) {
  const productRoot = join(repositoryRoot, product)
  const manifest = JSON.parse(await readFile(join(productRoot, "update.json"), "utf8"))
  assert(manifest.schemaVersion === 1, `${product}: unsupported schemaVersion`)
  assert(manifest.product === product, `${product}: product name mismatch`)
  assert(isRecord(manifest.platforms), `${product}: platforms must be an object`)

  const platformEntries = Object.entries(manifest.platforms)
  assert(config.allowEmpty || platformEntries.length > 0, `${product}: at least one platform feed is required`)
  for (const [platform, update] of platformEntries) {
    assert(Object.hasOwn(config.platforms, platform), `${product}: unsupported platform ${platform}`)
    assert(isRecord(update), `${product}/${platform}: update entry must be an object`)
    assert(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(update.version), `${product}/${platform}: invalid version`)

    const feedUrl = new URL(update.feedUrl)
    const expectedPath = new RegExp(`^/towishy/Owen-Updates/[a-f0-9]{40}/${product}/${platform}/${update.version}$`, "u")
    assert(feedUrl.protocol === "https:" && feedUrl.hostname === "raw.githubusercontent.com" && expectedPath.test(feedUrl.pathname), `${product}/${platform}: feedUrl must pin a commit containing its version folder`)
    await validatePlatformRetention(productRoot, product, platform, update.version)
    await validateVersionFeed(product, productRoot, platform, update.version, config.platforms[platform])
  }
}

async function validatePlatformRetention(productRoot, product, platform, version) {
  const entries = await readdir(join(productRoot, platform), { withFileTypes: true })
  const versionDirectories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
  assert(versionDirectories.length === 1 && versionDirectories[0] === version, `${product}/${platform}: retain exactly one version directory matching update.json (${version})`)
}

async function validateVersionFeed(product, productRoot, platform, version, config) {
  const versionRoot = join(productRoot, platform, version)
  if (config.kind === "velopack") {
    await validateVelopackFeed(product, platform, version, versionRoot, config)
    return
  }
  const metadata = parseYaml(await readFile(join(versionRoot, config.metadata), "utf8"))
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
  const requiredFiles = [...new Set([
    ...(platform === "windows-x64" ? [metadata.path, `${metadata.path}.blockmap`] : metadataFiles),
    ...(product === "owen-mdbox" && platform === "mac-arm" ? metadataFiles.map((fileName) => `${fileName}.blockmap`) : []),
    ...config.required(version),
  ])]
  for (const fileName of requiredFiles) {
    assert(checksums.has(fileName), `${platform}/${version}/${fileName}: missing SHA-256 entry`)
    assert(await digest(join(versionRoot, fileName), "sha256", "hex") === checksums.get(fileName), `${platform}/${version}/${fileName}: SHA-256 mismatch`)
  }
}

async function validateVelopackFeed(product, platform, version, versionRoot, config) {
  const metadata = JSON.parse(await readFile(join(versionRoot, config.metadata), "utf8"))
  assert(Array.isArray(metadata.Assets) && metadata.Assets.length > 0, `${platform}/${version}: Velopack Assets are required`)
  const fullAsset = metadata.Assets.find((asset) => asset.Type === "Full" && String(asset.Version) === version)
  assert(isRecord(fullAsset), `${platform}/${version}: full Velopack asset is required`)

  const fileUrl = new URL(fullAsset.FileName)
  const fileName = basename(fileUrl.pathname)
  assertMediaUrl(fileUrl, product, platform, version, fileName)
  const filePath = join(versionRoot, fileName)
  const fileStat = await stat(filePath)
  assert(fileStat.size === fullAsset.Size, `${platform}/${version}/${fileName}: size mismatch`)
  assert((await digest(filePath, "sha1", "hex")).toUpperCase() === fullAsset.SHA1, `${platform}/${version}/${fileName}: SHA-1 mismatch`)
  assert((await digest(filePath, "sha256", "hex")).toUpperCase() === fullAsset.SHA256, `${platform}/${version}/${fileName}: metadata SHA-256 mismatch`)

  const requiredFiles = [fileName, ...config.required(version)]
  await validateChecksums(versionRoot, platform, version, requiredFiles)
}

async function validateChecksums(versionRoot, platform, version, requiredFiles) {
  const checksumPath = join(versionRoot, "SHA256SUMS.txt")
  const checksumLines = (await readFile(checksumPath, "utf8")).trim().split(/\r?\n/u)
  const checksums = new Map(checksumLines.map((line) => {
    const match = /^([a-f0-9]{64})  ([^/\\]+)$/u.exec(line)
    assert(match, `${platform}/${version}: invalid SHA256SUMS line`)
    return [match[2], match[1]]
  }))
  for (const fileName of requiredFiles) {
    assert(checksums.has(fileName), `${platform}/${version}/${fileName}: missing SHA-256 entry`)
    assert(await digest(join(versionRoot, fileName), "sha256", "hex") === checksums.get(fileName), `${platform}/${version}/${fileName}: SHA-256 mismatch`)
  }
}

function assertMediaUrl(fileUrl, product, platform, version, fileName) {
  const expectedFilePath = new RegExp(`^/media/towishy/Owen-Updates/[a-f0-9]{40}/${product}/${platform}/${version}/${fileName}$`, "u")
  assert(fileUrl.protocol === "https:" && fileUrl.hostname === "media.githubusercontent.com" && expectedFilePath.test(fileUrl.pathname), `${platform}/${version}: invalid update file URL`)
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