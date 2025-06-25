import Image from "next/image";
import React, { useEffect, useState,  useContext } from "react";
import AuthContext from "@/pages/context/AuthProvider";
import { useRouter } from "next/router";
import { toast } from "sonner";
import LoadingComponent from "./LoadingComponent";
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const Login = () => {
  const router = useRouter();

  const { setAuth, auth } = useContext(AuthContext);
  

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [password, setPassword] = useState("");
  
  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const userData = data.data;
        console.log(userData)
        setAuth({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          id: userData.id
        });
        localStorage.setItem("auth", JSON.stringify({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          id: userData.id
        }));
        console.log(auth)
        
        router.push('/dashboard')
        setIsLoading(false); // Stop loading before navigation
        toast.success(data.message);
      } else {
        toast.error(data.message || "Login failed");
        setErrMsg(data?.message || "Login failed");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
      console.error("Error during login:", error);
      setErrMsg("An error occurred while logging in");
      setIsLoading(false);
    }
  };
  return (
   
      
        <div className=" min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-2 sm:px-0">
          <div className="w-full max-w-xs sm:max-w-md mx-auto bg-[#EEEFE0] backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 px-4  sm:px-8 py-6 md:py-8 flex flex-col items-center animate-fadeInUp">
            <Image src="/logo/Vault Logo.svg" alt="logo" width={90} height={90} className="mb-4" />
            {isLoading ? (
        <LoadingComponent />
      ) : (
            <form onSubmit={handleLogin} className="space-y-6 w-full">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-black mb-1">
                  Email
                  <span className={validEmail ? "inline-block ml-1" : "hidden"}>
                    <Image src="/icons/checked-green.svg" alt="info" width={18} height={18} />
                  </span>
                  <span className={validEmail || !email ? "hidden" : "inline-block ml-1"}>
                    <Image src="/icons/not-right.svg" alt="info" width={14} height={14} />
                  </span>
                </label>
                <input
                  type="email"
                  id="email"
                  aria-invalid={validEmail ? "false" : "true"}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  required
                  autoComplete="off"
                  className="block w-full rounded-lg bg-white/90 dark:bg-gray-500 px-3 py-2 text-base text-gray-900 outline-none border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 shadow-sm placeholder:text-gray-400 transition-all duration-200"
                />
                <p
                  id="uemnote"
                  className={
                    emailFocus && email && !validEmail
                      ? "text-xs text-orange-700 flex gap-2 border border-red-300 rounded-md px-2 py-1 mt-2 bg-slate-50 animate-fadeIn"
                      : "hidden"
                  }
                >
                  <Image src="/icons/danger-triangle.svg" alt="info" width={20} height={20} />
                  Not valid Email!
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-bold text-black dark:text-gray-200">
                    Password
                  </label>
                  <div
                    className="text-xs cursor-pointer text-indigo-500 hover:underline"
                    onClick={() => alert("Contact your administrator.")}
                  >
                    Forgot password?
                  </div>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="off"
                  className="block w-full rounded-lg bg-white/90 dark:bg-gray-500 px-3 py-2 text-base text-gray-900 outline-none border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 shadow-sm placeholder:text-gray-400 transition-all duration-200"
                />
              </div>
              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="w-1/2 sm:w-1/3 py-2 rounded-lg bg-[#819A91] text-white font-semibold text-lg shadow-md hover:from-indigo-600 hover:to-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                >
                  Login
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      
  );
};

export default Login;
