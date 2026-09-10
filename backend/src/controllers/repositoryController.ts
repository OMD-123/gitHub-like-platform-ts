import { Request, Response, NextFunction } from 'express';
import Repository from '../models/Repository';
import { protect } from '../middleware/authMiddleware';
import GitService from '../services/gitService';
import CiCdService from '../services/cicdService';
import WebhookService from '../services/webhookService';
import CodeSearchService from '../services/codeSearchService';

const gitService = new GitService();
const ciCdService = new CiCdService();
// Note: In a real app, you'd pass the io instance to webhook service
const codeSearchService = new CodeSearchService();

export const createRepository = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, isPrivate } = req.body;
    const ownerId = req.user?.id;
    
    if (!ownerId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    const repo = await Repository.create({
      name,
      description: description || '',
      owner: ownerId,
      isPrivate: isPrivate || false,
      defaultBranch: 'master'
    });
    
    // Initialize git repository
    await gitService.initRepository(repo.id.toString());
    
    res.status(201).json({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      ownerId: repo.owner,
      isPrivate: repo.isPrivate,
      defaultBranch: repo.defaultBranch,
      createdAt: repo.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRepository = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const repo = await Repository.findById(id);
    if (!repo) {
      res.status(404).json({ message: 'Repository not found' });
      return;
    }
    
    // Check permissions
    const isPrivate = repo.isPrivate;
    const ownerId = repo.owner.toString();
    const userId = req.user?.id?.toString();
    
    if (isPrivate && ownerId !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    
    res.json(repo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listRepositories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    let repositories;
    
    if (userId) {
      // Get user's repositories (both public and private)
      repositories = await Repository.find({ $or: [{ owner: userId }, { isPrivate: false }] });
    } else {
      // Get only public repositories
      repositories = await Repository.find({ isPrivate: false });
    }
    
    res.json(repositories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCommit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { repoId } = req.params;
    const { message, fileUpdates } = req.body;
    
    if (!message || !Array.isArray(fileUpdates)) {
      res.status(400).json({ message: 'Message and fileUpdates array are required' });
      return;
    }
    
    // Verify repository access
    const repo = await Repository.findById(repoId);
    if (!repo) {
      res.status(404).json({ message: 'Repository not found' });
      return;
    }
    
    const isPrivate = repo.isPrivate;
    const ownerId = repo.owner.toString();
    const userId = req.user?.id?.toString();
    
    if (isPrivate && ownerId !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    
    const author = {
      name: req.user?.username || 'Unknown',
      email: req.user?.email || 'unknown@example.com'
    };
    
    const commitId = await gitService.createCommit(
      repoId,
      message,
      author,
      fileUpdates
    );
    
    // Trigger CI/CD pipeline
    await ciCdService.triggerPipeline(repoId, commitId);
    
    // Trigger webhooks
    // Note: In a real implementation, we'd get the webhook service instance with io
    
    res.status(201).json({
      commitId,
      message,
      fileCount: fileUpdates.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFileContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { repoId, commitId, filePath } = req.params;
    
    // Verify repository access (simplified)
    const repo = await Repository.findById(repoId);
    if (!repo) {
      res.status(404).json({ message: 'Repository not found' });
      return;
    }
    
    const content = await gitService.getFileContent(repoId, commitId, filePath);
    if (content === null) {
      res.status(404).json({ message: 'File not found' });
      return;
    }
    
    res.send(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const searchCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { repoId } = req.params;
    const { query, fileExtensions } = req.query;
    
    if (!query || typeof query !== 'string') {
      res.status(400).json({ message: 'Query parameter is required' });
      return;
    }
    
    // Verify repository access (simplified)
    const repo = await Repository.findById(repoId);
    if (!repo) {
      res.status(404).json({ message: 'Repository not found' });
      return;
    }
    
    const extArray = Array.isArray(fileExtensions) ? fileExtensions : 
                    (typeof fileExtensions === 'string' ? [fileExtensions] : []);
    
    const results = await codeSearchService.searchInRepo(
      repoId,
      query as string,
      extArray
    );
    
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  createRepository,
  getRepository,
  listRepositories,
  createCommit,
  getFileContent,
  searchCode
};
