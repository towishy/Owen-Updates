import { spawnSync } from "node:child_process"
import { readdir, readFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repositoryRoot = resolve(process.env.OWEN_UPDATES_ROOT ?? resolve(import.meta.dirname, ".."))
const githubRepository = process.env.OWEN_UPDATES_GITHUB ?? "towishy/Owen-Updates"
const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u

export function platformReleaseTag(product, platform, version) {
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(product), `invalid product: ${product}`)
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(platform), `invalid platform: ${platform}`)
  assert(versionPattern.test(version), `invalid version: ${version}`)
  return `${product}-${platform}-${version}`
}

export function releaseTargetFromManifest(product, platform, entry) {
  assert(entry && typeof entry === "object", `${product}/${platform} update entry is invalid`)
  assert(typeof entry.version === "string" && versionPattern.test(entry.version), `${product}/${platform} version is invalid`)
  assert(typeof entry.feedUrl === "string", `${product}/${platform} feedUrl is invalid`)
  const url = new URL(entry.feedUrl)
  const match = /^\/towishy\/Owen-Updates\/([a-f0-9]{40})\/([^/]+)\/([^/]+)\/([^/]+)$/u.exec(url.pathname)
  assert(url.protocol === "https:" && url.hostname === "raw.githubusercontent.com" && match, `${product}/${platform} feedUrl is not immutable`)
  assert(match[2] === product && match[3] === platform && match[4] === entry.version, `${product}/${platform} feedUrl does not match its manifest entry`)
  return {
    feedUrl: entry.feedUrl,
    metadataRevision: match[1],
    platform,
    product,
    tag: platformReleaseTag(product, platform, entry.version),
    version: entry.version,
  }
}

export function obsoleteManagedTags(tags, targets) {
  const desired = new Set(targets.map((target) => target.tag))
  const prefixes = targets.map((target) => `${target.product}-${target.platform}-`)
  return [...new Set(tags)].filter((tag) => {
    if (versionPattern.test(tag)) return true
    return prefixes.some((prefix) => tag.startsWith(prefix)) && !desired.has(tag)
  }).sort()
}

export async function collectReleaseTargets(root = repositoryRoot) {
  const entries = await readdir(root, { withFileTypes: true })
  const targets = []
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue
    let manifest
    try {
      manifest = JSON.parse(await readFile(join(root, entry.name, "update.json"), "utf8"))
    } catch (error) {
      if (error?.code === "ENOENT") continue
      throw error
    }
    assert(manifest.product === entry.name && manifest.platforms && typeof manifest.platforms === "object", `${entry.name}/update.json is invalid`)
    for (const [platform, platformEntry] of Object.entries(manifest.platforms)) {
      targets.push(releaseTargetFromManifest(entry.name, platform, platformEntry))
    }
  }
  return targets.sort((left, right) => left.tag.localeCompare(right.tag))
}

async function main() {
  assert(run("git", ["branch", "--show-current"], { capture: true }) === "main", "platform releases must be synchronized from main")
  assert(run("git", ["status", "--porcelain"], { capture: true }) === "", "repository must be clean before synchronizing platform releases")
  assert(run("git", ["rev-parse", "HEAD"], { capture: true }) === run("git", ["rev-parse", "origin/main"], { capture: true }), "main must be pushed before synchronizing platform releases")
  run("gh", ["auth", "status"])

  const targets = await collectReleaseTargets()
  assert(targets.length > 0, "no platform release targets were found")
  for (const target of targets) {
    const manifestPath = `${target.product}/update.json`
    const pinRevision = run("git", ["log", "-1", "--format=%H", "-S", target.feedUrl, "--", manifestPath], { capture: true })
    assert(/^[a-f0-9]{40}$/u.test(pinRevision), `could not resolve the manifest pin commit for ${target.tag}`)
    assert(runStatus("git", ["merge-base", "--is-ancestor", target.metadataRevision, "origin/main"]) === 0, `${target.tag} metadata revision is not on origin/main`)
    await ensureTag(target.tag, pinRevision)
  }

  let releaseTags = listReleaseTags()
  for (const target of targets) {
    if (releaseTags.includes(target.tag)) continue
    run("gh", [
      "release", "create", target.tag,
      "--repo", githubRepository,
      "--title", target.version,
      "--notes", `${target.product} ${target.platform} ${target.version} update feed.`,
      "--verify-tag",
    ])
  }

  releaseTags = listReleaseTags()
  for (const tag of obsoleteManagedTags(releaseTags, targets)) {
    run("gh", ["release", "delete", tag, "--repo", githubRepository, "--yes", "--cleanup-tag"])
  }

  const desiredTags = new Set(targets.map((target) => target.tag))
  const remoteTags = listRemoteTags()
  for (const tag of obsoleteManagedTags(remoteTags, targets)) {
    if (!desiredTags.has(tag)) run("git", ["push", "origin", "--delete", tag])
  }
  const localTags = run("git", ["tag", "--list"], { capture: true }).split(/\r?\n/u).filter(Boolean)
  for (const tag of obsoleteManagedTags(localTags, targets)) run("git", ["tag", "-d", tag])

  const finalReleases = listReleaseTags()
  const finalRemoteTags = listRemoteTags()
  for (const target of targets) {
    const prefix = `${target.product}-${target.platform}-`
    assert(finalReleases.filter((tag) => tag.startsWith(prefix)).length === 1 && finalReleases.includes(target.tag), `${target.product}/${target.platform} release retention verification failed`)
    assert(finalRemoteTags.filter((tag) => tag.startsWith(prefix)).length === 1 && finalRemoteTags.includes(target.tag), `${target.product}/${target.platform} tag retention verification failed`)
  }
  assert(!finalReleases.some((tag) => versionPattern.test(tag)), "legacy numeric releases remain")
  assert(!finalRemoteTags.some((tag) => versionPattern.test(tag)), "legacy numeric tags remain")
  console.log(`Synchronized ${targets.length} platform releases; retained one latest release per product and platform.`)
}

async function ensureTag(tag, revision) {
  const remoteTags = listRemoteTags()
  if (!remoteTags.includes(tag)) {
    if (runStatus("git", ["rev-parse", "--verify", `refs/tags/${tag}`]) === 0) {
      assert(run("git", ["rev-list", "-n", "1", tag], { capture: true }) === revision, `${tag} points to an unexpected revision`)
    } else {
      run("git", ["tag", "-a", tag, revision, "-m", tag])
    }
    run("git", ["push", "origin", tag])
    return
  }
  if (runStatus("git", ["rev-parse", "--verify", `refs/tags/${tag}`]) !== 0) {
    run("git", ["fetch", "origin", `refs/tags/${tag}:refs/tags/${tag}`])
  }
  assert(run("git", ["rev-list", "-n", "1", tag], { capture: true }) === revision, `${tag} points to an unexpected revision`)
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

function runStatus(command, argumentsList) {
  return spawnSync(command, argumentsList, { cwd: repositoryRoot, encoding: "utf8", stdio: "pipe" }).status
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