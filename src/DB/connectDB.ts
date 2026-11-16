import mongoose from "mongoose";
import { Application } from "express";
import { DB_URI } from "../config/config.service.js";

const connectDb = async (port:number , app:Application) => {
    try {
        await mongoose.connect(DB_URI);

            app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
        console.log("Connected to MongoDB");

    }
    catch (error) {
        console.error("Error:", error);
    }
};

export default connectDb;