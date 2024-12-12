import { useEffect, useState } from "react";
import { loginApi } from "../services/userSevice";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./context/UserContext";

const Login = () => {
    const navigate = useNavigate();
    const { loginContext } = useContext(UserContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isShowPassword, setIsShowPassword] = useState(false);

    const [loadingAPI, setLoadingAPI] = useState(false);
    
    // useEffect(() => {
    //     let token = localStorage.getItem("token");
    //     if (token) {
    //         navigate("/");
    //     }
    // },[])

    const handleLogin = async () => {

        if(!email || !password) {
            toast.error("Email/Password is required!");
            return;
        }
        setLoadingAPI(true);
        //"eve.holt@reqres.in"
        let res = await loginApi(email.trim(), password);
        console.log(">>>check res: ", res)
        if(res && res.token) {
            loginContext(email, res.token);
            navigate("/");
        } else {
            //error
            if(res && res.status === 400) {
                toast.error(res.data.error);
            }
        }
        setLoadingAPI(false);
    }

    const hanldeGoBack = () => {
        navigate("/");
    }

    const handlePressEnter = (event) => {
        // console.log(event)
        if(event && event.key === 'Enter'){
            handleLogin();
        }
    }

    return(<>
        <div className="login-container col-12 col-sm-4">
            <div className="title">Log in</div>
            <div className="text">Email or username (eve.holt@reqres.in)</div>
            <input 
                type="text" 
                placeholder="Email or username..."
                value={email}
                onChange={(event) => setEmail(event.target.value)}
            />
            <div className="input-2">
                <input 
                    type={isShowPassword === true ? "text" : "password"}
                    placeholder="Password..."
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onKeyDown={(event) => handlePressEnter(event)}
                />
                <li 
                    className={isShowPassword === true ? "fa-solid fa-eye" : "fa-solid fa-eye-slash"}
                    onClick={() => setIsShowPassword(!isShowPassword)}
                ></li>
            </div>
            <button 
                className={email && password ? "active" : ""}
                disabled={email && password ? false : true}
                onClick={() => handleLogin()}
                >
                {loadingAPI && <li className="fa-solid fa-sync fa-spin"></li>}&nbsp;Login</button>
            <div className="back">
                <li className="fa-solid fa-chevron-left"></li>
                <span onClick={() => hanldeGoBack()}>&nbsp;Go back</span>
            </div>
        </div>
    </>)
}

export default Login;