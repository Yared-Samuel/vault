import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState, useContext } from "react";
import AuthContext from "@/pages/context/AuthProvider";
import {useRouter} from "next/router";
import { userRoles } from '@/lib/constants';
const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[.!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const Register = () => {
  const router = useRouter();
  const { setAuth, auth } = useContext(AuthContext);
  const userRef = useRef();
  const emailRef = useRef();
  const roleRef = useRef();
  const pwdRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [role, setRole] = useState("");

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
   userRef.current.focus();
  }, []);

  useEffect(() => {
    const result = USER_REGEX.test(user);
    setValidName(result);
  }, [user]);
  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  useEffect(() => {
    const result = PWD_REGEX.test(pwd);
    setValidPwd(result);
    const match = pwd === matchPwd;
    setValidMatch(match);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd, matchPwd, email, role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v1 = USER_REGEX.test(user);
    const v2 = EMAIL_REGEX.test(email);
    const v3 = PWD_REGEX.test(pwd);
    if (!v1 || !v2 || !v3) {
      setErrMsg("Invalid input data!");
      return;
    }

    try {
        const response = await fetch("/api/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: user,
                email,
                role,
                password: pwd,
            }),
        })
        
        const userData = await response.json()       
        
        if(userData.success === false){
          return alert(userData.message)
        }
        alert(userData.message)     
        const data = userData.data
        setAuth(prev => ({
          ...prev,  
          role: data.role,
          name: data.name,
          email: data.email,
          id: data.id
        }))
        
        // router.push('/page/dashboard')

        setEmail("");
        setUser("");
        setRole("");
        setPwd("");
        setMatchPwd("");
        setSuccess(true)
        
    } catch (error) {        
        alert(error.message)
        errRef.current.focus()
    }
    
  };
  return (
    <>
    {/* {success ? 
        (<section>
        <h1>You are logged in!</h1> <br />
        <p>
            <Link href="/users">Go to Home</Link>
        </p>
    </section>) : ( */}

      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-2 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <p
            ref={errRef}
            className={errMsg ? "text-red-700" : "offscreen"}
            aria-live="assertive"
          >
            {errMsg}
          </p>

          <h2 className="mt-4 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Regeister User
            {/* {auth.role} {auth.name} */}
          </h2>
        </div>
        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm/6 font-medium text-gray-900"
              >
                User name
                <span className={validName ? "inline-block" : "hidden"}>
                  <Image
                    src="/icons/checked-circle.svg"
                    alt="info"
                    width={20}
                    height={20}
                  />
                </span>
                <span
                  className={validName || !user ? "hidden" : "inline-block"}
                >
                  <Image
                    src="/icons/danger-red.svg"
                    alt="info"
                    width={20}
                    height={20}
                  />
                </span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  ref={userRef}
                  autoComplete="off"
                  onChange={(e) => setUser(e.target.value)}
                  required
                  aria-invalid={validName ? "false" : "true"}
                  aria-describedby="uidnote"
                  onFocus={() => setUserFocus(true)}
                  onBlur={() => setUserFocus(false)}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-[1px] -outline-offset-0 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                <p
                  id="uidnote"
                  className={
                    userFocus && user && !validName
                      ? "text-[12px] text-orange-700 flex gap-2 outline-[1px] outline-red-500 outline-offset-1 rounded-md mx-2 mt-2 bg-slate-100"
                      : "hidden"
                  }
                >
                  <Image
                    src="/icons/info-circle.svg"
                    alt="info"
                    width={30}
                    height={30}
                  />
                  4 to 24 characters. Must begin with letter. <br />
                  Letters, numbers, hyphens, and underscores only.
                </p>
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Email address
                <span className={validEmail ? "inline-block" : "hidden"}>
                  <Image
                    src="/icons/checked-circle.svg"
                    alt="info"
                    width={20}
                    height={20}
                  />
                </span>
                <span
                  className={validEmail || !email ? "hidden" : "inline-block"}
                >
                  <Image
                    src="/icons/danger-red.svg"
                    alt="info"
                    width={20}
                    height={20}
                  />
                </span>
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="email"
                  ref={emailRef}
                  aria-invalid={validEmail ? "false" : "true"}
                  aria-describedby="uemnote"
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  required
                  autoComplete="off"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                <p
                  id="uemnote"
                  className={
                    emailFocus && email && !validEmail
                      ? "text-[12px] text-orange-700 flex gap-2 outline-[1px] outline-red-500 outline-offset-1 rounded-md mx-2 mt-2 bg-slate-100"
                      : "hidden"
                  }
                >
                  <Image
                    src="/icons/info-circle.svg"
                    alt="info"
                    width={30}
                    height={30}
                  />
                  Not valid Email!
                </p>
              </div>
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Role
                <span className={role ? "inline-block" : "hidden"}>
                  <Image
                    src="/icons/checked-circle.svg"
                    alt="info"
                    width={20}
                    height={20}
                  />
                </span>
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  ref={roleRef}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                >
                  <option value="" selected disabled>Select Role</option>
                    {userRoles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="pwd"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Password:
                  <span className={validPwd ? "inline-block" : "hidden"}>
                    <Image
                      src="/icons/checked-circle.svg"
                      alt="info"
                      width={20}
                      height={20}
                    />
                  </span>
                  <span
                    className={validPwd || !pwd ? "hidden" : "inline-block"}
                  >
                    <Image
                      src="/icons/danger-red.svg"
                      alt="info"
                      width={20}
                      height={20}
                    />
                  </span>
                </label>
              </div>
              <div className="mt-1">
                <input
                  type="password"
                  id="password"
                  onChange={(e) => setPwd(e.target.value)}
                  required
                  area-invalid={validPwd ? "false" : "true"}
                  aria-describedby="pwdnote"
                  onFocus={() => setPwdFocus(true)}
                  onBlur={() => setPwdFocus(false)}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                <p
                  id="pwdnote"
                  className={
                    pwdFocus && !validPwd
                      ? "text-[12px] text-orange-700 flex gap-2 outline-[1px] outline-red-500 outline-offset-1 rounded-md mx-2 mt-2 bg-slate-100"
                      : "hidden"
                  }
                >
                  <Image
                    src="/icons/info-circle.svg"
                    alt="info"
                    width={30}
                    height={30}
                  />
                  8 to 24 characters. <br />
                  Must include upper and lowercase letters, a number and a
                  special charachter. <br />
                </p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="matchPwd"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Confirm Password
                  <span
                    className={
                      validMatch && matchPwd ? "inline-block" : "hidden"
                    }
                  >
                    <Image
                      src="/icons/checked-circle.svg"
                      alt="info"
                      width={20}
                      height={20}
                    />
                  </span>
                  <span
                    className={
                      validMatch || !matchPwd ? "hidden" : "inline-block"
                    }
                  >
                    <Image
                      src="/icons/danger-red.svg"
                      alt="info"
                      width={20}
                      height={20}
                    />
                  </span>
                </label>
              </div>
              <div className="mt-1">
                <input
                  type="password"
                  id="matchPwd"
                  onChange={(e) => setMatchPwd(e.target.value)}
                  required
                  area-invalid={validMatch ? "false" : "true"}
                  aria-describedby="confirmnote"
                  onFocus={() => setMatchFocus(true)}
                  onBlur={() => setMatchFocus(false)}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                <p
                  id="confirmnote"
                  className={
                    matchFocus && !validMatch
                      ? "text-[12px] text-orange-700 flex gap-2 outline-[1px] outline-red-500 outline-offset-1 rounded-md mx-2 mt-2 bg-slate-100"
                      : "hidden"
                  }
                >
                  <Image
                    src="/icons/info-circle.svg"
                    alt="info"
                    width={30}
                    height={30}
                  />
                  Must Match the fist password input field!
                </p>
              </div>
            </div>

            <div>
              <button
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                disabled={
                  !validName || !validEmail || !validPwd || !role || !validMatch
                    ? true
                    : false
                }
              >
                Register
              </button>
            </div>
          </form>
          <p>
            Already registered?
            <br />
            <span>
              <Link href="/" className="text-indigo-600 hover:underline">
                LOGIN HERE
              </Link>
            </span>
          </p>
        </div>
      </div>
    {/* )} */}

    </>
  )
}

export default Register