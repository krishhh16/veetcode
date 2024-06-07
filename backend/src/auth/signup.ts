import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from 'hono/jwt'
import { setCookie } from "hono/cookie";
export const auth = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();
import z from 'zod';

const propType = z.object({
    email: z.string().email(),
    password: z.string()
})


auth.post('/signup', async c => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const signupSchema = propType.extend({
        username: z.string()
    })


    const {username, email, password}: {
        username: string;
        email: string;
        password: string;
    } = await c.req.json();
    try {
    if (!username || !email || !password){
        return c.json({success: false, msg: 'please fill some content'});
    }

    signupSchema.parse(await c.req.json())
} catch(err){
    console.log(err);
    return c.json({success: false, msg:"Please write the right credentials"})
}
    try {
        const userExists = await prisma.user.findFirst({
            where: {email}
        })

        if (userExists) {
            return c.json({success: false, msg: "user already exists"});
        }

        await prisma.user.create({
            data: {
            username, email, password
            }
        })

        const token = await sign({email} , c.env.JWT_SECRET);

        setCookie(c, 'authToken', token);

        return c.json({success: true, msg: "You have been signed up successfully"});
    } catch (err) {
        console.log(err);
        return c.json({success: false , msg: 'internal error from the server'});
    }
})

auth.post('/signin', async c => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const {email, password}: {
       
        email: string;
        password: string;
    } = await c.req.json();

    if ( !email || !password){
        return c.json({success: false, msg: 'please fill some content'});
    }

    try {
        
        const userExists = await prisma.user.findFirst({
            where: {
                email
            }
        })

        if(userExists) {
            return c.json({success: false, msg: "The user already exists"});
        }
        


        return c.json({success: true, msg: "You have been signed up successfully"});
    } catch (err) {
        console.log(err);
        return c.json({success: false , msg: 'internal error from the server'});
    }
})


