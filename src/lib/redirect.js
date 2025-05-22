"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import AuthContext from "@/pages/context/AuthProvider";

export default function useRedirectLoggedOutUser() {
  const router = useRouter();
  const { auth, setAuth } = useContext(AuthContext);


  useEffect(() => {
    const checkAuth = async () => {
      if (auth?.name && auth?.email && auth?.role ) return;
      

      try {
        const response = await fetch("/api/users/logginStatus");
        const data = await response.json();
        if (!data.success || !data.data?.isLoggedIn) {
          console.log("out of web");
          toast.error("Please login to continue! Redirecting to login page...");        
          router.push("/");
          return;
        }
        console.log(data.data.user)
        setAuth(prev => ({
          ...prev,
          name: data.data.user.name,
          email: data.data.user.email,
          role: data.data.user.role,
          id: data.data.user.id, 
          
        }));
        console.log(auth);
      } catch (error) {
        console.error(error);
        router.push("/");
        toast.error("Something wrong in auth");
      }
    };

    checkAuth();
  }, [router, setAuth, auth]); // Include auth but use early return to prevent loops
}
