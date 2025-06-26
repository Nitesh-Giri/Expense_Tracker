import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import { z } from 'zod';
import User from '../models/user.model.js';

// Register a new user
export const signup = async (req, res) => {
    const {firstName, lastName, email, password} = req.body;

    const userSchema = z.object({
        firstName: z.string().min(3, {message: "First name must be at least 3 characters long"}),
        lastName: z.string().min(3, {message: "Last name must be at least 3 characters long"}),
        email: z.string().email(),
        password: z.string().min(6, {message: "Password must be at least 6 characters long"})
    });

    const validateData = userSchema.safeParse(req.body);

    if(!validateData.success){
        return res.status(400).json({errors:validateData.error.issues.map(err => err.message)});
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    try {

        const existingUser = await User.findOne({email : email});
        if(existingUser){
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = await User.create({ 
            firstName,
            lastName, 
            email, 
            password:hashedPassword 
        });

        await newUser.save();

        res.status(201).json({
            message:"User created successfully",
            newUser
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating user" });
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;

    try {

        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({ message: "Invalid user name" });
        }

        const isCorrectPassword = await bcryptjs.compare(password, user.password);

        if(!isCorrectPassword){
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //jwt code

        const token = jwt.sign(
            { id: user._id }, 
            config.JWT_USER_PASSWORD,
            { expiresIn: "1d" }
        );


        const cookieOptions = {
            expires: new Date(Date.now() + 24*60*60*1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:"Strict"
        };

        res.cookie("jwt", token, cookieOptions); 
        res.status(200).json({
            message:"User logged in successfully",
            user,
            token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error logging in user" });
    }
};

export const logout = async (req, res) =>{
    try {

        if (!req.cookies || !req.cookies.jwt) {
            return res.status(400).json({ message: "User not logged in" });
        }

        res.clearCookie("jwt");
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        res.status(500).json({error: "Error in logged out"});
        console.log("error in logged out", error);
    }

};


