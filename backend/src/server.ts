import express from "express";
import dotenv from "dotenv";
import subjectRouter from "./routes/subjects.js";
import cors from "cors";
dotenv.config()
const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {
    origin : process.env.FRONTEND_URL || "http://localhost:3000",
    methods:['GET','POST','PUT','DELETE'],
    credentials:true
}
app.use(cors(corsOptions))


app.get("/" ,(req,res) => {
 res.send("Hello, Welcome to the classroom API")
})
app.use('/api/subjects',subjectRouter)
app.listen (PORT,() => {
    console.log(`Server is running on port ${PORT}`);
    
})