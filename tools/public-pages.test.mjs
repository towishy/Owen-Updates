import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

test("public product pages accept only UTF-8 Markdown, never binaries", async () => {
  const root = await mkdtemp(join(tmpdir(), "owen-public-pages-"))
  const product = join(root, "owen-caption")
  const run = () => spawnSync(process.execPath, [fileURLToPath(new URL("./validate-update-repo.mjs", import.meta.url))], {
    env: { ...process.env, OWEN_UPDATES_ROOT: root }, encoding: "utf8"
  })
  try {
    await mkdir(product)
    await writeFile(join(product, "README.md"), "# Support\n")
    await writeFile(join(product, "PRIVACY.md"), "# Privacy\n")
    assert.equal(run().status, 0)
    await writeFile(join(product, "installer.exe"), "MZ")
    assert.notEqual(run().status, 0)
    await rm(join(product, "installer.exe"))
    await writeFile(join(product, "PRIVACY.md"), Buffer.from([0, 255, 0, 255]))
    assert.notEqual(run().status, 0)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})