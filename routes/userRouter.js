import Router from "express";
import { registerUser, userLogin, verifyAccount } from "../controllers/userController.js";


const router = Router();

router.post("/api/register", registerUser);
router.get("/api/verify_token/:token", verifyAccount);
router.post("/api/login",userLogin)

export default router;
