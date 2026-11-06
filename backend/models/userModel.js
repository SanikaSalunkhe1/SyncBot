import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true
    } , 
    username : {
        type : String,
        required : true,
        unique : true,
        trim : true
    } , 
    password : {
        type : String,
        required : true
    } ,

    meetingCode : {
        type : String,
        required : true , 
        unique : true
    } , 
    // token : {
    //     type : String,
    //     required : false
    // }
} , 
{ timestamps : true }
);

const User = mongoose.model('User' , UserSchema);

export default User; 