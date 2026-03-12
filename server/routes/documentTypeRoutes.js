/**
 * Document Types Route — returns all registered document plugins
 */
import express from 'express';
import { getAllPlugins } from '../plugins/documentRegistry.js';

const router = express.Router();

router.get('/', (req, res) => {
    return res.json({ documentTypes: getAllPlugins() });
});

export default router;
