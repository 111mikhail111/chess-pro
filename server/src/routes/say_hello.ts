import express from 'express';
import { registerUser } from '../controllers/authController';

const router = express.Router();

router.post('/say_hello', registerUser);

export default router;