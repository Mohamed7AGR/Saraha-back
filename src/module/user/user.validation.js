import mongoose from "mongoose";
import * as z from "zod";
import { generalFildes } from "../../common/index.js";
export const userSchema = (lang) => z.object({
    params: z.strictObject({
        userId: generalFildes.userId(lang).refine((userId) => {
            return mongoose.Types.ObjectId.isValid(userId);
        }, {
            message: "invalid user Id",
            path: ["params","userId"]
        }),
        
    }),
    query: z.strictObject({

        date: z.coerce.number({error:"not a number"}),
     }).optional(),
   
})