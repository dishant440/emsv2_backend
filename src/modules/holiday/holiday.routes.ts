import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../access-control';
import * as holidayController from './holiday.controller';

const router = Router();

router.get('/', authenticate, authorize('holiday', 'list'), holidayController.getAll);
router.post('/', authenticate, authorize('holiday', 'create'), holidayController.create);
router.put('/:id', authenticate, authorize('holiday', 'update'), holidayController.update);
router.delete('/:id', authenticate, authorize('holiday', 'delete'), holidayController.remove);

export default router;
