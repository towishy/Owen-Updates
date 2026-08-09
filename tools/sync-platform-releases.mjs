import { spawnSync } from "node:child_process"
import { readdir, readFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repositoryRoot = resolve(process.env.OWEN_UPDATES_ROOT ?? resolve(import.meta.dirname, ".."))
const githubRepository = process.env.OWEN_UPDATES_GITHUB ?? "towishy/Owen-Updates"
const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u

export function managedPlatformFromManifest(product, platform, entry) {
  assert(entry && typeof entry === "object", `${product}/${platform} update entry is invalid`)
  assert(entry.mode === "check-only", `${product}/${platform} mode must be check-only`)
  assert(typeof entry.version === "string" && versionPattern.test(entry.version), `${product}/${platform} version is invalid`)
  return {
    platform,
    prefix: `${product}-${platform}-`,
    product,
    version: entry.version,
  }
}

export function obsoleteManagedTags(tags, platforms) {
  const prefixes = platforms.map((platform) => platform.prefix)
  return [...new Set(tags)].filter((tag) => {
    if (versionPattern.test(tag)) return true
    return prefixes.some((prefix) => tag.startsWith(prefix))
  }).sort()
}

export async function collectManagedPlatforms(root = repositoryRoot) {
  const entries = await readdir(root, { withFileTypes: true })
  const platforms = []
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue
    let manifest
    try {
      manifest = JSON.parse(await readFile(join(root, entry.name, "update.json"), "utf8"))
    } catch (error) {
      if (error?.code === "ENOENT") continue
      throw error
    }
    assert(manifest.schemaVersion === 3, `${entry.name}/update.json must use schemaVersion 3`)
    assert(manifest.product === entry.name && manifest.platforms && typeof manifest.platforms === "object", `${entry.name}/update.json is invalid`)
    for (const [platform, platformEntry] of Object.entries(manifest.platforms)) {
      platforms.push(managedPlatformFromManifest(entry.name, platform, platformEntry))
    }
  }
  return platforms.sort((left, right) => left.prefix.localeCompare(right.prefix))
}

async function main() {
  assert(run("git", ["branch", "--show-current"], { capture: true }) === "main", "platform releases must be synchronized from main")
  assert(run("git", ["status", "--porcelain"], { capture: true }) === "", "repository must be clean before synchronizing platform releases")
  assert(run("git", ["rev-parse", "HEAD"], { capture: true }) === run("git", ["rev-parse", "origin/main"], { capture: true }), "main must be pushed before synchronizing platform releases")
  run("gh", ["auth", "status"])

  const platforms = await collectManagedPlatforms()
  assert(platforms.length > 0, "no managed update platforms were found")

  for (const tag of obsoleteManagedTags(listReleaseTags(), platforms)) {
    run("gh", ["release", "delete", tag, "--repo", githubRepository, "--yes", "--cleanup-tag"])
  }
  for (const tag of obsoleteManagedTags(listRemoteTags(), platforms)) {
    run("git", ["push", "origin", "--delete", tag])
  }
  const localTags = run("git", ["tag", "--list"], { capture: true }).split(/\r?\n/u).filter(Boolean)
  for (const tag of obsoleteManagedTags(localTags, platforms)) run("git", ["tag", "-d", tag])

  assert(obsoleteManagedTags(listReleaseTags(), platforms).length === 0, "managed check-only releases remain")
  assert(obsoleteManagedTags(listRemoteTags(), platforms).length === 0, "managed check-only tags remain")
  console.log(`Removed GitHub releases and tags for ${platforms.length} check-only update platform(s).`)
}

function listReleaseTags() {
  const value = run("gh", ["release", "list", "--repo", githubRepository, "--limit", "1000", "--json", "tagName"], { capture: true })
  return JSON.parse(value).map((release) => release.tagName)
}

function listRemoteTags() {
  return run("git", ["ls-remote", "--tags", "--refs", "origin"], { capture: true })
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => line.split(/\s+/u)[1].replace(/^refs\/tags\//u, ""))
}

function run(command, argumentsList, options = {}) {
  const result = spawnSync(command, argumentsList, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  })
  if (result.error) throw result.error
  assert(result.status === 0, `${command} ${argumentsList.join(" ")} failed with exit code ${result.status}`)
  return options.capture ? `${result.stdout ?? ""}${result.stderr ?? ""}`.trim() : ""
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
