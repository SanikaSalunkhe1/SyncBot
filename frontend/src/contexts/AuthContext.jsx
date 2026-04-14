import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext(null);

const client = axios.create({
    baseURL: `${server}/api/v1/users` ,
    // baseURL: "http://localhost:8000/api/v1/users"
});


export const AuthProvider = ({ children }) => {
    
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);
    const [loading , setLoading] = useState(true);


    //load user from token on refresh or render
    useEffect(() => {
        const token = localStorage.getItem("token");
        if(token) {
            setUserData({ token });
        }
        setLoading(false);
    } , []);


    const handleRegister = async (username, email ) => {
        try {
            const res = await client.post("/register" ,{
                username , 
                email , 
            });

            if (res.status === httpStatus.CREATED) {
                navigate('/auth/login');
                return res.data.message;
            }
        } catch (err) {
            throw err;
        }
    }

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            });

            console.log(username, password)
            console.log(request.data)

            if (request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token);
                setUserData({ token: request.data.token });
                navigate("/home");
            }
        } catch (err) {
            throw err;
        }
    };

    //logout
    const logout = () => {
        localStorage.removeItem("token");
        setUserData(null);
        navigate("/auth/login");
    };

    //get history of user
    const getHistoryOfUser = async () => {
        const token = localStorage.getItem("token");
        const res = await client.get("/getAllActivities" , {
            headers: {
                Authorization: `Bearer ${token}`
            } , 
        });
        return res.data;
    };

    //add to user history
    const addToUserHistory = async (meetingCode) => {
        const token = localStorage.getItem("token");
        return client.post("/addToActivity" , {
            meetingCode: meetingCode
        } , 
    {
            headers: {
                Authorization: `Bearer ${token}`
            } , 
        });
    };


    const data = {
        userData, loading , logout, addToUserHistory, getHistoryOfUser, handleRegister, handleLogin
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )

}