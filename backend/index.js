import dotenv from 'dotenv'
dotenv.config({ override: true });
import http from "node:http";
import app from "./src/app.js";
import connectDB from "./src/config/db.config.js";

const server = http.createServer(app);

const port = process.env.PORT || 5000;

// Connect to Database first
connectDB().then(() => {
    server.listen(port, () => {
        console.log(`server listen at port ${port}`)
    });
});