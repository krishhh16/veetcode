import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from 'hono/jwt'
import { setCookie } from "hono/cookie";
import { cors } from "hono/cors";
export const auth = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();
import { z } from "zod";

auth.use('/*', cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true
}));

const propType = z.object({
    email: z.string().email(),
    password: z.string()
});

auth.post('/signup', async c => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const signupSchema = propType.extend({
        username: z.string()
    });

    type schemaPropType = z.infer<typeof signupSchema>;

    const { username, email, password }: schemaPropType = await c.req.json();
    try {
        if (!username || !email || !password) {
            return c.json({ success: false, msg: 'please fill some content' });
        }

        signupSchema.parse(await c.req.json());
    } catch (err) {
        console.log(err);
        return c.json({ success: false, msg: "Please write the right credentials" });
    }
    try {
        const userExists = await prisma.user.findFirst({
            where: { email }
        });

        if (userExists) {
            return c.json({ success: false, msg: "user already exists" });
        }

        await prisma.user.create({
            data: {
                username, email, password
            }
        });

        const token = await sign({ email }, c.env.JWT_SECRET);

        setCookie(c, 'authToken', token, {
            httpOnly: true,
            sameSite: "Lax",
            secure: false, // Set secure flag if in production
            path: '/'
        });

        return c.json({ success: true, msg: "You have been signed up successfully" });
    } catch (err) {
        console.log(err);
        return c.json({ success: false, msg: 'internal error from the server' });
    }
});

auth.post('/signin', async c => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    type signinPropTypes = z.infer<typeof propType>;

    const { email, password }: signinPropTypes = await c.req.json();
    try {
        if (!email || !password) {
            return c.json({ success: false, msg: 'please fill some content' });
        }

        propType.parse(await c.req.json());
    } catch (err) {
        return c.json({ success: false, msg: "send right creds" });
    }
    try {
        const userExists = await prisma.user.findFirst({
            where: { email }
        });

        if (!userExists) {
            return c.json({ success: false, msg: "User does not exist" });
        }

        const token = await sign({ email }, c.env.JWT_SECRET);
        const now = new Date();
        const expires = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
      
        setCookie(c, 'authToken', token, {
            path: '/',
            secure: false, // Set to true if your site is HTTPS
            httpOnly: true,
            maxAge: 2 * 24 * 60 * 60, // 2 days in seconds
           
            sameSite: 'None',

          });

        c.header('Access-Control-Allow-Credentials', 'true');
        c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        c.header('Access-Control-Allow-Headers', '*');

        return c.json({ success: true, msg: "You have been signed in successfully" });
    } catch (err) {
        console.log(err);
        return c.json({ success: false, msg: 'internal error from the server' });
    }
});