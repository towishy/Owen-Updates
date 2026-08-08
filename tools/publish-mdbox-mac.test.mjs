import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { access, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import test from "node:test"
import { parse as parseYaml, stringify as stringifyYaml } from "yaml"

test("publishes, finalizes, pins, and validates a macOS updater feed", async () => {
  const root = await mkdtemp(join(tmpdir(), "owen-updates-mac-publish-"))
  const source = join(root, "source")
  const repository = join(root, "repository")
  const version = "1.2.3"
  await mkdir(source, { recursive: true })
  await mkdir(join(repository, "owen-mdbox", "mac-arm", "1.2.2"), { recursive: true })
  await mkdir(join(repository, "owen-mdbox", "windows-x64", "9.8.7"), { recursive: true })
  const archiveNames = [
    `owen-mdbox-${version}-macos-arm64.zip`,
    `owen-mdbox-${version}-macos-arm64.dmg`,
  ]
  const files = []
  for (const [index, fileName] of archiveNames.entries()) {
    const contents = Buffer.from(`archive-${index}`)
    await writeFile(join(source, fileName), contents)
    await writeFile(join(source, `${fileName}.blockmap`), `blockmap-${index}`)
    files.push({ url: fileName, sha512: createHash("sha512").update(contents).digest("base64"), size: contents.length })
  }
  await writeFile(join(source, "latest-mac.yml"), stringifyYaml({
    files,
    path: archiveNames[0],
    releaseDate: "2026-08-08T00:00:00.000Z",
    sha512: files[0].sha512,
    version,
  }))

  const result = spawnSync(process.execPath, [
    resolve(import.meta.dirname, "publish-mdbox-mac.mjs"),
    "--version", version,
    "--source", source,
  ], { encoding: "utf8", env: { ...process.env, OWEN_UPDATES_ROOT: repository } })
  assert.equal(result.status, 0, result.stderr)

  const versionRoot = join(repository, "owen-mdbox", "mac-arm", version)
  await access(join(repository, "owen-mdbox", "mac-arm", "1.2.2"))
  await access(join(repository, "owen-mdbox", "windows-x64", "9.8.7"))
  const metadata = parseYaml(await readFile(join(versionRoot, "latest-mac.yml"), "utf8"))
  assert.deepEqual(metadata.files.map((file) => file.url), archiveNames)
  const checksums = await readFile(join(versionRoot, "SHA256SUMS.txt"), "utf8")
  for (const fileName of archiveNames.flatMap((name) => [name, `${name}.blockmap`])) {
    assert.match(checksums, new RegExp(`  ${fileName.replaceAll(".", "\\.")}\\n`, "u"))
  }

  const artifactRevision = "a".repeat(40)
  const finalizeResult = runTool("finalize-mdbox-mac.mjs", ["--version", version, "--revision", artifactRevision], repository)
  assert.equal(finalizeResult.status, 0, finalizeResult.stderr)
  await access(join(repository, "owen-mdbox", "mac-arm", "1.2.2"))
  const finalizedMetadata = parseYaml(await readFile(join(versionRoot, "latest-mac.yml"), "utf8"))
  for (const file of finalizedMetadata.files) {
    assert.match(file.url, new RegExp(`^https://media\\.githubusercontent\\.com/media/towishy/Owen-Updates/${artifactRevision}/owen-mdbox/mac-arm/${version}/`, "u"))
  }

  await writeFile(join(repository, "owen-mdbox", "update.json"), `${JSON.stringify({ platforms: {}, product: "owen-mdbox", schemaVersion: 1 }, null, 2)}\n`)
  const metadataRevision = "b".repeat(40)
  const missingVersionResult = runTool("pin-mdbox-mac.mjs", ["--version", "1.2.4", "--revision", metadataRevision], repository)
  assert.notEqual(missingVersionResult.status, 0)
  assert.match(missingVersionResult.stderr, /cannot retain missing version directory/u)
  assert.deepEqual(JSON.parse(await readFile(join(repository, "owen-mdbox", "update.json"), "utf8")).platforms, {})
  await access(join(repository, "owen-mdbox", "mac-arm", "1.2.2"))

  const pinResult = runTool("pin-mdbox-mac.mjs", ["--version", version, "--revision", metadataRevision], repository)
  assert.equal(pinResult.status, 0, pinResult.stderr)
  await assert.rejects(access(join(repository, "owen-mdbox", "mac-arm", "1.2.2")))
  await access(join(repository, "owen-mdbox", "windows-x64", "9.8.7"))
  const manifest = JSON.parse(await readFile(join(repository, "owen-mdbox", "update.json"), "utf8"))
  assert.deepEqual(manifest.platforms["mac-arm"], {
    feedUrl: `https://raw.githubusercontent.com/towishy/Owen-Updates/${metadataRevision}/owen-mdbox/mac-arm/${version}`,
    version,
  })

  const validationResult = runTool("validate-update-repo.mjs", [], repository)
  assert.equal(validationResult.status, 0, validationResult.stderr)

  await mkdir(join(repository, "owen-mdbox", "mac-arm", "1.2.2"))
  const duplicateVersionResult = runTool("validate-update-repo.mjs", [], repository)
  assert.notEqual(duplicateVersionResult.status, 0)
  assert.match(duplicateVersionResult.stderr, /retain exactly one version directory/u)
})

function runTool(fileName, argumentsList, repository) {
  return spawnSync(process.execPath, [resolve(import.meta.dirname, fileName), ...argumentsList], {
    encoding: "utf8",
    env: { ...process.env, OWEN_UPDATES_ROOT: repository },
  })
}