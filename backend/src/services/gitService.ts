import { Repository, Commit, Tree, Blob, Index, Reference, Signature, Oid } from 'nodegit';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class GitService {
  private reposDir: string;

  constructor(reposDir: string = './repos') {
    this.reposDir = reposDir;
    if (!existsSync(this.reposDir)) {
      mkdirSync(this.reposDir, { recursive: true });
    }
  }

  private getRepoPath(repoId: string): string {
    return join(this.reposDir, repoId);
  }

  async initRepository(repoId: string): Promise<void> {
    const repoPath = this.getRepoPath(repoId);
    await Repository.init(repoPath, 0);
  }

  async getRepository(repoId: string): Promise<Repository> {
    const repoPath = this.getRepoPath(repoId);
    return Repository.open(repoPath);
  }

  async createCommit(
    repoId: string,
    message: string,
    author: { name: string; email: string },
    fileUpdates: Array<{ path: string; content: string }>
  ): Promise<string> {
    const repo = await this.getRepository(repoId);
    const index = await repo.index();

    // Add/update files
    for (const file of fileUpdates) {
      const blobId = await Blob.createFromBuffer(repo, Buffer.from(file.content));
      await index.addByPath(file.path, blobId);
    }

    await index.write();
    const treeId = await index.writeTree();

    // Get parent commit (if any)
    let parentCommitId = null;
    try {
      const headRef = await Reference.nameToId(repo, 'HEAD');
      parentCommitId = headRef;
    } catch (e) {
      // No HEAD yet, this is first commit
    }

    const authorSig = Signature.now(author.name, author.email);
    const commitId = await repo.createCommit(
      'HEAD',
      authorSig,
      authorSig,
      message,
      treeId,
      parentCommitId ? [parentCommitId] : []
    );

    return commitId.toString();
  }

  async getFileContent(repoId: string, commitId: string, filePath: string): Promise<string | null> {
    try {
      const repo = await this.getRepository(repoId);
      const commit = await Repository.getCommit(repo, Oid.fromString(commitId));
      const tree = await commit.getTree();
      const entry = await tree.getEntryByPath(filePath);
      if (!entry) return null;
      
      const blob = await entry.getBlob();
      return blob.toString('utf8');
    } catch (e) {
      return null;
    }
  }

  async listFiles(repoId: string, commitId: string, dirPath: string = ''): Promise<Array<{ name: string; type: 'file' | 'directory' }>> {
    try {
      const repo = await this.getRepository(repoId);
      const commit = await Repository.getCommit(repo, Oid.fromString(commitId));
      const tree = await commit.getTree();
      
      const entries = [];
      tree.walk((entry, root) => {
        const fullPath = join(root, entry.path());
        if (dirPath === '' || fullPath.startsWith(dirPath + '/') || fullPath === dirPath) {
          const relativePath = dirPath === '' ? entry.path() : entry.path().substring(dirPath.length + 1);
          const parts = relativePath.split('/');
          if (parts.length === 1) {
            entries.push({
              name: parts[0],
              type: entry.isFile() ? 'file' : 'directory'
            });
          }
        }
        return 0; // Continue walking
      });
      
      return entries;
    } catch (e) {
      return [];
    }
  }
}

export default GitService;
