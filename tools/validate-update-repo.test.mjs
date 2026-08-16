import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdir, mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const toolsRoot = dirname(fileURLToPath(import.meta.url))
const validatorPath = resolve(toolsRoot, "validate-update-repo.mjs")

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), "owen-updates-validation-"))
  const productRoot = join(root, "owen-mdbox")
  await mkdir(productRoot, { recursive: true })
  await writeFile(join(productRoot, "update.json"), JSON.stringify({
    platforms: {
      "mac-arm": { mode: "check-only", version: "0.3.78" },
      "windows-x64": { mode: "check-only", version: "0.3.78" },
    },
    product: "owen-mdbox",
    schemaVersion: 3,
  }))
  return { productRoot, root }
}

function validate(root) {
  return spawnSync(process.execPath, [validatorPath], {
    encoding: "utf8",
    env: { ...process.env, OWEN_UPDATES_ROOT: root },
  })
}

test("allows a requested public ZIP under an external purpose folder", async () => {
  const { productRoot, root } = await createFixture()
  const reviewRoot = join(productRoot, "external", "app-review")
  await mkdir(reviewRoot, { recursive: true })
  await writeFile(join(reviewRoot, "MDBOX-App-Review-Sample.zip"), Buffer.from([
    0x50, 0x4b, 0x05, 0x06,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]))

  const result = validate(root)
  assert.equal(result.status, 0, result.stderr)
})

test("rejects unpacked files in an external purpose folder", async () => {
  const { productRoot, root } = await createFixture()
  const reviewRoot = join(productRoot, "external", "app-review")
  await mkdir(reviewRoot, { recursive: true })
  await writeFile(join(reviewRoot, "README.md"), "Do not publish unpacked content.")

  const result = validate(root)
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /binary or feed artifact is not allowed/u)
})

test("rejects a non-ZIP payload with a zip extension", async () => {
  const { productRoot, root } = await createFixture()
  const reviewRoot = join(productRoot, "external", "app-review")
  await mkdir(reviewRoot, { recursive: true })
  await writeFile(join(reviewRoot, "not-an-archive.zip"), "plain text")

  const result = validate(root)
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /not a valid ZIP archive/u)
})
