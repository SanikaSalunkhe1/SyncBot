import mongoose, { Schema } from 'mongoose';

const meetingSchema = new Schema({

    user : {
        type : Schema.Types.ObjectId,
        ref : "User" , 
        required : true
    } ,

    meetingCode : {
        type : String,
        required : true , 
        unique : true
    } , 

    date :{
        type : Date,
        default : Date.now 
        // required : true    
    }
} , { timestamps : true });

const Meeting = mongoose.model('Meeting' , meetingSchema);

// export default Meeting => export only one default
export { Meeting };