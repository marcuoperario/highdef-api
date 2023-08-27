import { Request, Response } from 'express';
import User from '../models/user.model';
import bcrypt from 'bcrypt';

export const getUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const findUser = await User.find({ _id: id });
        res.status(200).json(findUser);
    } catch (error) {
        res.status(400).json({ message: error });
    }
};

export const getUsersPerPage = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const Users = await User.aggregate([{ $sort: { createdAt: -1 } }, { $skip: ((page as number) - 1) * (limit as number) }, { $limit: (limit as number) * 1 }]);
        const count = await User.countDocuments();
        res.status(200).json({
            Users,
            totalPages: Math.ceil(count / (limit as number)),
            currentPage: parseInt(page as string)
        });
    } catch (error) {
        res.status(400).json({ message: error });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const Users = await User.find();
        res.status(200).json(Users);
    } catch (error) {
        res.status(400).json({ message: error });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const requesterId = req.body.requesterId;
        let updatedBody = req.body;

        if (requesterId !== id) {
            delete updatedBody.password;
            delete updatedBody.requesterId;
        }

        const findAndUpdateUser = await User.findByIdAndUpdate(id, updatedBody, { new: true });
        res.status(200).json(findAndUpdateUser);
    } catch (error) {
        res.status(400).json({ message: error });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const findAndDeleteUser = await User.findByIdAndDelete(id);
        res.status(200).json(findAndDeleteUser);
    } catch (error) {
        res.status(400).json({ message: error });
    }
};

export const deleteUsers = async (req: Request, res: Response) => {
    try {
        const deleteUsers = await User.deleteMany();
        res.status(200).json(deleteUsers);
    } catch (error) {
        res.status(400).json({ message: error });
    }
};
