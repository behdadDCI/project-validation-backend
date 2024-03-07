import Router from "express";
import { registerUser, verifyAccount } from "../controllers/userController.js";


const router = Router();

router.post("/api/register", registerUser);
router.get("/api/verify_token/:token", verifyAccount);


export default router;
