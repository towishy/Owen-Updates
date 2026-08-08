import assert from "node:assert/strict"
import { mkdir, mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import {
    collectReleaseTargets,
    obsoleteManagedTags,
    platformReleaseTag,
    releaseTargetFromManifest,
} from "./sync-platform-releases.mjs"

test("builds a namespaced tag while keeping the release version numeric", () => {
  assert.equal(platformReleaseTag("owen-mdbox", "windows-x64", "0.3.37"), "owen-mdbox-windows-x64-0.3.37")
})

test("parses immutable manifest entries into platform release targets", () => {
  const revision = "a".repeat(40)
  assert.deepEqual(releaseTargetFromManifest("owen-mdbox", "mac-arm", {
    feedUrl: `https://raw.githubusercontent.com/towishy/Owen-Updates/${revision}/owen-mdbox/mac-arm/0.3.35`,
    version: "0.3.35",
  }), {
    feedUrl: `https://raw.githubusercontent.com/towishy/Owen-Updates/${revision}/owen-mdbox/mac-arm/0.3.35`,
    metadataRevision: revision,
    platform: "mac-arm",
    product: "owen-mdbox",
    tag: "owen-mdbox-mac-arm-0.3.35",
    version: "0.3.35",
  })
  assert.throws(() => releaseTargetFromManifest("owen-mdbox", "mac-arm", {
    feedUrl: `https://raw.githubusercontent.com/towishy/Owen-Updates/${revision}/owen-mdbox/windows-x64/0.3.35`,
    version: "0.3.35",
  }), /does not match/u)
})

test("removes only older tags for managed product platforms and legacy numeric tags", () => {
  const targets = [
    { platform: "windows-x64", product: "owen-mdbox", tag: "owen-mdbox-windows-x64-0.3.37" },
    { platform: "mac-arm", product: "owen-mdbox", tag: "owen-mdbox-mac-arm-0.3.35" },
  ]
  assert.deepEqual(obsoleteManagedTags([
    "0.3.37",
    "owen-mdbox-windows-x64-0.3.36",
    "owen-mdbox-windows-x64-0.3.37",
    "owen-mdbox-mac-arm-0.3.34",
    "owen-mdbox-mac-arm-0.3.35",
    "unmanaged-product-windows-x64-1.0.0",
  ], targets), [
    "0.3.37",
    "owen-mdbox-mac-arm-0.3.34",
    "owen-mdbox-windows-x64-0.3.36",
  ])
})

test("collects the latest release target for every manifest platform", async () => {
  const root = await mkdtemp(join(tmpdir(), "owen-platform-releases-"))
  const productRoot = join(root, "owen-mdbox")
  await mkdir(productRoot)
  await writeFile(join(productRoot, "update.json"), JSON.stringify({
    platforms: {
      "mac-arm": {
        feedUrl: `https://raw.githubusercontent.com/towishy/Owen-Updates/${"b".repeat(40)}/owen-mdbox/mac-arm/0.3.35`,
        version: "0.3.35",
      },
      "windows-x64": {
        feedUrl: `https://raw.githubusercontent.com/towishy/Owen-Updates/${"a".repeat(40)}/owen-mdbox/windows-x64/0.3.37`,
        version: "0.3.37",
      },
    },
    product: "owen-mdbox",
    schemaVersion: 1,
  }))
  const targets = await collectReleaseTargets(root)
  assert.deepEqual(targets.map((target) => target.tag), [
    "owen-mdbox-mac-arm-0.3.35",
    "owen-mdbox-windows-x64-0.3.37",
  ])
})