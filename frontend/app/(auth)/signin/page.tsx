"use client"

import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { object, string } from 'zod';
import { useRouter } from "next/navigation";

const userDataSchema = object({
  email: string().email(),
  password: string(),
});

const SignupPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      userDataSchema.parse(form);
      const response = await axios.post('http://localhost:8787/auth/signin', form);
      
      if (!response.data.success) {
        alert(response.data.msg);
      } else {
        alert("You have logged in successfully!!");
        // router.push('/dashboard');
      }
    } catch (err: any) {
      console.log(err);
      alert(err.message || "An error occurred");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-blue-100">
      <div className="w-[25%] bg-blue-200 p-6 rounded-lg">
        <span className="text-2xl font-semibold text-center block mb-3 border-b border-grey">Signin</span>
        <form onSubmit={(e) => submitHandler(e)}>
          <div className="flex flex-col justify-center">
            <label htmlFor="email" className="block">Email</label>
            <input placeholder="Enter email" className="border border-white rounded-lg p-2 bg-blue-100" id="email" name="email" type="text" onChange={(e) => { setForm({ ...form, email: e.target.value }) }} />
          </div>
          <div className="flex flex-col justify-center">
            <label htmlFor="password" className="block">Password</label>
            <input placeholder="Enter password" className="border border-white rounded-lg p-2 bg-blue-100" name="password" id="password" type="password" onChange={(e) => { setForm({ ...form, password: e.target.value }) }} />
          </div>
          <button type="submit" className="bg-blue-300 font-semibold p-2 flex justify-center mx-auto rounded-lg mt-4">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;