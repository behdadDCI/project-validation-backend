import express from "express";
import { dbConnect } from "./config/dbConnect.js";
import dotenv from "dotenv"
import cors from "cors"
import userRouter from "./routes/userRouter.js"


dotenv.config()
dbConnect()





const app = express()
const PORT=process.env.PORT || 3400

app.use(express.json())
app.use(cors())
 app.use(userRouter)


app.listen(PORT , ()=>console.log(`server is running on port${PORT}`))