import { Router } from 'express';
import { CompilerController } from '../controllers/CompilerController';
import { validateRunRequest } from '../middleware/validateRequest';

const router = Router();

router.post('/run', validateRunRequest, CompilerController.run);
router.post('/submit', validateRunRequest, CompilerController.submit);
router.get('/result/:id', CompilerController.result);
router.get('/status/:id', CompilerController.status);

export default router;
