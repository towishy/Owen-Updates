import assert from "node:assert/strict"
import { mkdir, mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import {
    collectManagedPlatforms,
    managedPlatformFromManifest,
    obsoleteManagedTags,
} from "./sync-platform-releases.mjs"

test("parses a check-only platform without a release target", () => {
  assert.deepEqual(managedPlatformFromManifest("gsa-dashboard", "windows-x64", {
    mode: "check-only",
    version: "0.24.74",
  }), {
    platform: "windows-x64",
    prefix: "gsa-dashboard-windows-x64-",
    product: "gsa-dashboard",
    version: "0.24.74",
  })
  assert.throws(() => managedPlatformFromManifest("gsa-dashboard", "windows-x64", {
    mode: "download",
    version: "0.24.74",
  }), /mode must be check-only/u)
})

test("removes managed platform tags and legacy numeric tags only", () => {
  const platforms = [
    { prefix: "gsa-dashboard-windows-x64-" },
    { prefix: "owen-mdbox-mac-arm-" },
  ]
  assert.deepEqual(obsoleteManagedTags([
    "0.3.44",
    "gsa-dashboard-windows-x64-0.24.74",
    "owen-mdbox-mac-arm-0.3.43",
    "owen-mdbox-windows-x64-0.3.44",
    "unmanaged-product-windows-x64-1.0.0",
  ], platforms), [
    "0.3.44",
    "gsa-dashboard-windows-x64-0.24.74",
    "owen-mdbox-mac-arm-0.3.43",
  ])
})

test("collects every check-only platform from schema v3 manifests", async () => {
  const root = await mkdtemp(join(tmpdir(), "owen-check-only-platforms-"))
  const productRoot = join(root, "owen-mdbox")
  await mkdir(productRoot)
  await writeFile(join(productRoot, "update.json"), JSON.stringify({
    platforms: {
      "mac-arm": { mode: "check-only", version: "0.3.43" },
      "windows-x64": { mode: "check-only", version: "0.3.45" },
    },
    product: "owen-mdbox",
    schemaVersion: 3,
  }))

  assert.deepEqual((await collectManagedPlatforms(root)).map((platform) => platform.prefix), [
    "owen-mdbox-mac-arm-",
    "owen-mdbox-windows-x64-",
  ])
})
