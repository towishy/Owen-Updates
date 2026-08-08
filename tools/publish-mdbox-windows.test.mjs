import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { access, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import test from "node:test"
import { stringify as stringifyYaml } from "yaml"

test("publishes, pins, and validates a Windows setup ZIP download", async () => {
  const root = await mkdtemp(join(tmpdir(), "owen-updates-windows-publish-"))
  const source = join(root, "source")
  const repository = join(root, "repository")
  const version = "1.2.3"
  const setupName = `owen-mdbox-${version}-windows-x64-setup.exe`
  const archiveName = `owen-mdbox-${version}-windows-x64-setup.zip`
  const blockmapName = `${setupName}.blockmap`
  const setup = Buffer.from("signed setup")
  await mkdir(source, { recursive: true })
  await writeFile(join(source, setupName), setup)
  await writeFile(join(source, archiveName), "setup zip")
  await writeFile(join(source, blockmapName), "blockmap")
  await writeFile(join(source, "latest.yml"), stringifyYaml({
    files: [{ sha512: createHash("sha512").update(setup).digest("base64"), size: setup.length, url: setupName }],
    path: setupName,
    sha512: createHash("sha512").update(setup).digest("base64"),
    version,
  }))
  await mkdir(join(repository, "owen-mdbox", "windows-x64", "1.2.2"), { recursive: true })
  await writeFile(join(repository, "owen-mdbox", "update.json"), `${JSON.stringify({ platforms: {}, product: "owen-mdbox", schemaVersion: 1 }, null, 2)}\n`)

  const publishResult = runTool("publish-mdbox-windows.mjs", ["--version", version, "--source", source], repository)
  assert.equal(publishResult.status, 0, publishResult.stderr)
  const versionRoot = join(repository, "owen-mdbox", "windows-x64", version)
  await access(join(versionRoot, archiveName))
  assert.match(await readFile(join(versionRoot, "SHA256SUMS.txt"), "utf8"), new RegExp(`  ${archiveName.replaceAll(".", "\\.")}\\n`, "u"))

  const artifactRevision = "a".repeat(40)
  const finalizeResult = runTool("finalize-mdbox-windows.mjs", ["--version", version, "--revision", artifactRevision], repository)
  assert.equal(finalizeResult.status, 0, finalizeResult.stderr)
  const metadataRevision = "b".repeat(40)
  const pinResult = runTool("pin-mdbox-windows.mjs", ["--version", version, "--revision", metadataRevision], repository)
  assert.equal(pinResult.status, 0, pinResult.stderr)

  const manifest = JSON.parse(await readFile(join(repository, "owen-mdbox", "update.json"), "utf8"))
  assert.equal(manifest.schemaVersion, 2)
  assert.equal(manifest.platforms["windows-x64"].downloadUrl, `https://github.com/towishy/Owen-Updates/releases/download/owen-mdbox-windows-x64-${version}/${archiveName}`)
  const validationResult = runTool("validate-update-repo.mjs", [], repository)
  assert.equal(validationResult.status, 0, validationResult.stderr)
})

function runTool(fileName, argumentsList, repository) {
  return spawnSync(process.execPath, [resolve(import.meta.dirname, fileName), ...argumentsList], {
    encoding: "utf8",
    env: { ...process.env, OWEN_UPDATES_ROOT: repository },
  })
}