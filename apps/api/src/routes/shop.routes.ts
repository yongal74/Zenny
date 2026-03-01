import { Router } from 'express';
import { getShopItems, purchaseItem } from '../controllers/shop.controller';

const router = Router();

// Shop routes
router.get('/items', getShopItems);
router.post('/purchase', purchaseItem);

export { router as shopRouter };
