/**
 * Site-wide constants. Server/build-time only: do not import from client scripts.
 */
export const SITE = {
  name: 'Quire',
  tagline: "Amirali's knowledge library",
  description: 'A personal library of notes on code, mathematics, and whatever else is worth remembering.',
  /** Vault directory, relative to the project root. This folder is the Obsidian vault. */
  vaultDir: 'notes',
  github: {
    /** "owner/repo". GitHub Actions sets GITHUB_REPOSITORY automatically; set SITE_REPO for local builds. */
    repo: process.env.GITHUB_REPOSITORY || process.env.SITE_REPO || '',
    branch: 'main',
  },
} as const;
