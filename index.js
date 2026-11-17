import { Router } from 'express';
import { showHome, handleSearch } from '../controllers/homeController.js';
import {
  showTopArtists,
  showTopTracks,
  showRecentListens,
} from '../controllers/userController.js';
import {
  validateSearchForm,
  validateUsernameParam,
} from '../middleware/validateUsername.js';

const router = Router();

router.get('/', showHome);

router.post('/search', validateSearchForm, handleSearch);

router.get('/user/:username', validateUsernameParam, showTopArtists);
router.get('/user/:username/tracks', validateUsernameParam, showTopTracks);
router.get('/user/:username/recent', validateUsernameParam, showRecentListens);

export default router;
