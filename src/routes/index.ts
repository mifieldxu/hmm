/*
 * GET home page.
 */
import * as express from 'express';
const router: express.Router = express.Router();

router.get('/', (_req: express.Request, res: express.Response) => {
    res.render('index', { title: 'Express' });
});

export default router;
