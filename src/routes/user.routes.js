import { Router } from 'express';
import { loginUser, registerUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserAvatar } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
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
route.router('/change-password').post(verifyJWT ,changeCurrentPassword);
route.router('/get-user').post(verifyJWT ,getCurrentUser);
route.router('/update-user-avatar').post(verifyJWT, upload ,updateUserAvatar);

export default router;