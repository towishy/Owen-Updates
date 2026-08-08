import { readdir, rm } from "node:fs/promises"
import { join } from "node:path"

export async function assertVersionExists(platformRoot, version) {
  const entries = await readdir(platformRoot, { withFileTypes: true })
  const currentVersion = entries.find((entry) => entry.isDirectory() && entry.name === version)
  if (!currentVersion) throw new Error(`cannot retain missing version directory: ${version}`)
}

export async function retainOnlyVersion(platformRoot, version) {
  await assertVersionExists(platformRoot, version)
  const entries = await readdir(platformRoot, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== version) {
      await rm(join(platformRoot, entry.name), { recursive: true })
    }
  }
}