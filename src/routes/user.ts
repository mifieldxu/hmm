/*
 * GET users listing.
 */
import express = require('express');
const router: express.Router = express.Router();

router.get('/', (_req: express.Request, res: express.Response) => {
    res.send("respond with a resource");
});

export default router;
