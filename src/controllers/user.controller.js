import { asyncHandler } from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const generateAccessAndRefreshToken = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken(); 
        const refreshToken = user.generateRefreshToken();

       user.refreshToken = refreshToken ;

       await user.save({ validateBeforeSave : false });

       return {
        refreshToken,
        accessToken
       }
    }catch(error){
        throw new ApiError(500,'Something went wrong while generating refresh and access token.');
    }
}

const registerUser = asyncHandler( async (req, res) => {
    const { fullName, email, password, username } = req.body ;

    const isAnyEmptyField = [fullName, email, password, username].some((field) => field?.trim()  === '');

    if(isAnyEmptyField){
        throw new ApiError(400, "All Fields are required!!");
    }

    const existedUser = await User.findOne({ $or : [ {username}, {email} ] });

    if(existedUser){
        throw new ApiError(409, "user with username or email already exists");
    }

    // files
    const avatarLocalPath = req.files?.avatar[0]?.path ;
    let coverImageLocalPath = '' ;
    if(req.files?.coverImage){
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

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
        username : username?.toLowerCase(),
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

const loginUser = asyncHandler(async (req, res) => {
    // extract details from req.body
    // validation of fields
    // check if user exists or not and password check
    // if exists then generate token
    // else send an error message 

    const { email, password, username } = req.body ; 

    if(!username && !email){
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or : [{ username }, { email }]
    });

    if(!user){
        throw new ApiError(404,"user does not found");
    }

    const isPasswordValid = await user.isPassswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid User Credentails!");
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser,
                accessToken,
                refreshToken
            },
            "User LoggedIn Successfully"
        )
    )
});

const logoutUser = asyncHandler( async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : ''
            }
        },
        {
            new  : true
        }
    )
    console.log(updatedUser);

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            200,
            {},
            "User LoggedOut Successfully"
        )
    )
});

export { 
    registerUser,
    loginUser,
    logoutUser
};