import dotenv from 'dotenv'
dotenv.config();
import http from "node:http";
import app from "./src/app.js";

const server = http.createServer(app);

const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log(`server listen at port ${port}`)
});