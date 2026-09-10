import { Repository, Commit, Tree, Blob, Oid } from 'nodegit';

export class CodeSearchService {
  async searchInRepo(repoId: string, query: string, fileExtensions: string[] = []): Promise<Array<{ filePath: string; lineNumber: number; lineContent: string; matchContext: string }>> {
    const results: Array<{ filePath: string; lineNumber: number; lineContent: string; matchContext: string }> = [];
    
    try {
      const repo = await Repository.open(`./repos/${repoId}`);
      const masterCommit = await repo.getBranchCommit('master');
      
      if (!masterCommit) {
        // Try main branch
        const mainCommit = await repo.getBranchCommit('main');
        if (!mainCommit) return results;
        masterCommit = mainCommit;
      }
      
      const tree = await masterCommit.getTree();
      
      // Walk the tree and search files
      await this.searchTree(repo, tree, '', query, fileExtensions, results);
    } catch (error) {
      console.error(`Error searching in repo ${repoId}:`, error.message);
    }
    
    return results;
  }

  private async searchTree(
    repo: Repository,
    tree: Tree,
    pathPrefix: string,
    query: string,
    fileExtensions: string[],
    results: Array<{ filePath: string; lineNumber: number; lineContent: string; matchContext: string }>
  ): Promise<void> {
    const entries = await tree.getEntries();
    
    for (const entry of entries) {
      const fullPath = join(pathPrefix, entry.path());
      
      if (entry.isFile()) {
        // Check file extension if specified
        if (fileExtensions.length > 0) {
          const ext = entry.path().split('.').pop();
          if (!fileExtensions.includes(ext)) continue;
        }
        
        try {
          const blob = await entry.getBlob();
          const content = blob.toString('utf8');
          const lines = content.split('\n');
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes(query)) {
              // Get context (previous and next line)
              const start = Math.max(0, i - 1);
              const end = Math.min(lines.length, i + 2);
              const contextLines = lines.slice(start, end);
              const matchContext = contextLines.join('\n');
              
              results.push({
                filePath: fullPath,
                lineNumber: i + 1,
                lineContent: line,
                matchContext: matchContext
              });
            }
          }
        } catch (error) {
          // Skip binary files or unreadable files
          continue;
        }
      } else if (entry.isDirectory()) {
        // Recursively search subdirectories
        const subtree = await entry.getTree();
        await this.searchTree(repo, subtree, fullPath, query, fileExtensions, results);
      }
    }
  }
}

export default CodeSearchService;
