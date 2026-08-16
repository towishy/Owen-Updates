import { open, readdir, readFile } from "node:fs/promises"
import { dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const repositoryRoot = resolve(process.env.OWEN_UPDATES_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), ".."))
const products = {
  "gsa-dashboard": ["windows-x64"],
  "owen-mdbox": ["mac-arm", "windows-x64"],
}
const externalZipPattern = /^external\/[a-z0-9][a-z0-9-]*\/[A-Za-z0-9][A-Za-z0-9._-]*\.zip$/u

let validatedProducts = 0
for (const [product, platforms] of Object.entries(products)) {
  try {
    await validateProduct(product, platforms)
    validatedProducts += 1
  } catch (error) {
    if (process.env.OWEN_UPDATES_ROOT && error?.code === "ENOENT") continue
    throw error
  }
}

console.log(`Validated ${validatedProducts} check-only update manifest(s).`)

async function validateProduct(product, supportedPlatforms) {
  const productRoot = join(repositoryRoot, product)
  const manifest = JSON.parse(await readFile(join(productRoot, "update.json"), "utf8"))
  assert(manifest.schemaVersion === 3, `${product}: schemaVersion must be 3`)
  assert(manifest.product === product, `${product}: product name mismatch`)
  assert(isRecord(manifest.platforms), `${product}: platforms must be an object`)

  const platformEntries = Object.entries(manifest.platforms)
  assert(platformEntries.length > 0, `${product}: at least one platform entry is required`)
  for (const [platform, update] of platformEntries) {
    assert(supportedPlatforms.includes(platform), `${product}: unsupported platform ${platform}`)
    assert(isRecord(update), `${product}/${platform}: update entry must be an object`)
    assert(update.mode === "check-only", `${product}/${platform}: mode must be check-only`)
    assert(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(update.version), `${product}/${platform}: invalid version`)
    assert(Object.keys(update).sort().join(",") === "mode,version", `${product}/${platform}: check-only entries may contain only mode and version`)
  }
  const allowedFiles = new Set(["PRIVACY.md", "README.md", "THIRD-PARTY-NOTICES.md", "update.json", ...supportedPlatforms.map((platform) => `${platform}/README.md`)])
  for (const filePath of await listFiles(productRoot)) {
    const relativePath = relative(productRoot, filePath).split(sep).join("/")
    if (allowedFiles.has(relativePath)) continue
    assert(externalZipPattern.test(relativePath), `${product}: binary or feed artifact is not allowed in check-only mode (${relativePath})`)
    assert(await hasZipSignature(filePath), `${product}: external artifact is not a valid ZIP archive (${relativePath})`)
  }
}

async function hasZipSignature(filePath) {
  const file = await open(filePath, "r")
  try {
    const signature = Buffer.alloc(4)
    const { bytesRead } = await file.read(signature, 0, signature.length, 0)
    if (bytesRead !== signature.length || signature[0] !== 0x50 || signature[1] !== 0x4b) return false
    return (signature[2] === 0x03 && signature[3] === 0x04)
      || (signature[2] === 0x05 && signature[3] === 0x06)
      || (signature[2] === 0x07 && signature[3] === 0x08)
  } finally {
    await file.close()
  }
}

async function listFiles(root) {
  const files = []
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name)
    if (entry.isDirectory()) files.push(...await listFiles(path))
    else files.push(path)
  }
  return files
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}