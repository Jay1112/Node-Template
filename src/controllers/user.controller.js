import { asyncHandler } from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation
    // check if user already exists or not : email && username
    // check for images, check for avatar
    // upload them cloudinary, avatar
    // create user Object - create entry in db
    // remove password and refresh token fields from response
    // check for user creation
    // return response

    const { fullName, email, password, username } = req.body ;

    const isAnyEmptyField = [fullName, email, password, username].some((field) => field?.trim()  === '');

    if(isAnyEmptyField){
        throw new ApiError(400, "All Fields are required!!");
    }

    const existedUser = User.findOne({ $or : [ {username}, {email} ] });

    if(existedUser){
        throw new ApiError(409, "user with username or email already exists");
    }

    // files
    const avatarLocalPath = req.files?.avatar[0]?.path ;
    const coverImageLocalPath = req.files?.coverImage[0]?.path ;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar Image is Required!");
    }

    // upload avatar image
    const avatarUploadResponse = await uploadOnCloudinary(avatarLocalPath);
    if(!avatarUploadResponse){
        throw new ApiError(500, "Avatar Image Upload Failed");
    }
    
    // upload coverImage
    const coverImageUploadResponse = await uploadOnCloudinary(coverImageLocalPath);

    // create user in db
    const user = await User.create({
        fullName, 
        username : username?.toLowerCasr(),
        avatar : avatarUploadResponse?.url,
        coverImage : coverImageUploadResponse?.url || '',
        email,
        password
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating user in db");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User Registered Successfully')
    );

});

export { registerUser };