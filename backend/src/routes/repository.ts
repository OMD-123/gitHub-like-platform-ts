import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import * as repoController from '../controllers/repositoryController';

const router = Router();

router.post('/', protect, repoController.createRepository);
router.get('/', protect, repoController.listRepositories);
router.get('/:id', protect, repoController.getRepository);
router.post('/:id/commits', protect, repoController.createCommit);
router.get('/:id/contents/:commitId/*', protect, repoController.getFileContent);
router.get('/:id/search', protect, repoController.searchCode);

export default router;
