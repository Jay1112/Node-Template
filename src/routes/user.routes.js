import { Router } from 'express';
import { loginUser, registerUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserAvatar } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
);

router.route('/login').post(loginUser);

// secure routes
router.route('/logout').post(verifyJWT,logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/change-password').post(verifyJWT ,changeCurrentPassword);
router.route('/get-user').get(verifyJWT ,getCurrentUser);
router.route('/update-user-avatar').post(verifyJWT, upload.single('avatar'),updateUserAvatar);

export default router;