/*
 * GET users listing.
 */
import * as express from 'express';
const router: express.Router = express.Router();

router.get('/', (_req: express.Request, res: express.Response) => {
    res.send("respond with a resource");
});

export default router;
