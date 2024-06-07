"use client"

import axios from "axios";
import { useState } from "react";
import { object, string } from 'zod';
import { useRouter } from "next/navigation";

const userDataSchema = object({
  email: string().email(),
  password: string(),
  username: string()
});
const SignupPage = () => {

    const navigator = useRouter();
    const [form, setForm] = useState({
    email: "",
    password: "",
    username: ""
  });

  const submitHandler = async (e : any) => {
        e.preventDefault();
        try {
            userDataSchema.parse(form)
            const response = await axios.post(`http://localhost:8787/signup`, form)
            if (!response.data.success){
                alert(response.data.msg)
            }else {
                navigator.push('/dashboard')
            }

        }catch(err){
            console.log(err);
            alert('An error occured while submitting the details')
        }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-blue-100">
      <div className="w-[25%] bg-blue-200 p-6 rounded-lg">
        <span className="text-2xl font-semibold text-center block mb-3 border-b border-grey">Signin</span>
        <form onSubmit={(e) => submitHandler}>
          <div className="flex flex-col justify-center">
            <label htmlFor="email" className="block">Username</label>
            <input placeholder="Enter email" className="border border-white rounded-lg p-2 bg-blue-100" id="email" name="email" type="text" onChange={(e) => { setForm({ ...form, username: e.target.value }) }} />
          </div>
          <div className="flex flex-col justify-center">
            <label htmlFor="password" className="block">Email</label>
            <input placeholder="Enter password" className="border border-white rounded-lg p-2 bg-blue-100" name="password" id="password" type="password" onChange={(e) => { setForm({ ...form, password: e.target.value }) }} />
          </div>
          <div className="flex flex-col justify-center">
            <label htmlFor="password" className="block">Password</label>
            <input placeholder="Enter password" className="border border-white rounded-lg p-2 bg-blue-100" name="password" id="password" type="password" onChange={(e) => { setForm({ ...form, password: e.target.value }) }} />
          </div>
          <button className="bg-blue-300 font-semibold p-2 flex justify-center mx-auto rounded-lg mt-4">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;