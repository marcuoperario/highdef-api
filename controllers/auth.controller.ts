import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { SECRET_TOKEN } from '../constants/constants';

export const signin = async (req: Request, res: Response) => {
    try {
        const userExists = await User.findOne({
            email_address: req.body.email_address
        });

        const userValidated = await User.findOne({
            email_address: req.body.email_address,
            is_activated: true
        });

        if (!userExists) {
            throw 'Account does not exist!';
        }

        if (!userValidated) {
            throw 'Account is still under review.';
        }

        const verifyPassword = await bcrypt.compare(req.body.password, userExists.password);

        if (!verifyPassword) {
            throw 'Incorrect password.';
        }

        const token = jwt.sign({ _id: userExists._id }, SECRET_TOKEN, {
            expiresIn: '1d'
        });

        res.header('token', token).json({
            token: token,
            user: {
                id: userExists.id,
                firstname: userExists.firstname,
                lastname: userExists.lastname,
                email_address: userExists.email_address,
                role: userExists.role,
                is_activated: userExists.is_activated
            }
        });
    } catch (error) {
        return res.status(400).json({ message: error });
    }
};

export const signup = async (req: Request, res: Response) => {
    try {
        const salt = await bcrypt.genSalt(14);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const userExists = await User.findOne({
            email_address: req.body.email_address
        });

        const validatePassword = (value: string) => {
            const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            return regex.test(value);
        };

        if (userExists) {
            throw 'Account already exists!';
        }

        const isPasswordValid = validatePassword(req.body.password);

        if (!isPasswordValid) {
            throw 'Password must have a minimum length of 8 characters, at least 1 uppercase letter, and at least 1 special character.';
        }

        const user = new User({
            ...req.body,
            is_activated: false,
            role: 'User',
            password: hashedPassword
        });

        const savedUser = await user.save();
        res.status(200).json(savedUser);
    } catch (error) {
        return res.status(400).json({ message: error });
    }
};
