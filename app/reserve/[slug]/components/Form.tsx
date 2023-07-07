"use client"

import { partySize } from "@/data"
import useReservation from "@/hooks/useReservation"
import { CircularProgress } from "@mui/material"
import { time } from "console"
import { useEffect, useState } from "react"

export default function Form({slug, date, partySize}:{
  slug: string; date: string; partySize: string
}) {
  const [inputs, setInputs] = useState({
    bookerFirstName:"",
    bookerLastName:"",
    bookerPhone:"",
    bookerEmail:"",
    bookerOccasion:"",
    bookerRequest:"",
  })

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) =>{
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value
    })
  }

  const [day, time] = date.split('T');
  const [disabled, setDisabled] = useState(true);
  const [didBook, setDidBook] = useState(false);
  const { loading, error, createReservation } = useReservation();

  useEffect( () => {
    if(inputs.bookerFirstName && inputs.bookerLastName && inputs.bookerEmail && inputs.bookerPhone) {
        return setDisabled(false);
    }
      return setDisabled(true);
  }, [inputs])

  const handleClick = async () => {
    const booking = await createReservation({
      slug,
      partySize: parseInt(partySize), 
      time, 
      day,
      bookerFirstName: inputs.bookerFirstName,
      bookerLastName: inputs.bookerLastName,
      bookerEmail: inputs.bookerEmail,
      bookerPhone: inputs.bookerPhone,
      bookerOccasion: inputs.bookerOccasion,
      bookerRequest: inputs.bookerRequest,
      setDidBook
}
    )
  }

  return (
    <div className="mt-10 flex flex-wrap justify-between w-[660px]">
      { didBook ? <div>
        <h1>You are all booked up</h1>
        <p>Enjoy your reservation</p>
      </div> : (<>
        <input name="bookerFirstName" value={inputs.bookerFirstName} onChange={handleChangeInput} type="text" className="border rounded p-3 w-80 mb-4" placeholder="First name"/>
        <input name="bookerLastName" value={inputs.bookerLastName} onChange={handleChangeInput} type="text" className="border rounded p-3 w-80 mb-4" placeholder="Last name"/>
        <input name="bookerPhone" value={inputs.bookerPhone} onChange={handleChangeInput} type="text" className="border rounded p-3 w-80 mb-4" placeholder="Phone number"/>
        <input name="bookerEmail" value={inputs.bookerEmail} onChange={handleChangeInput} type="text" className="border rounded p-3 w-80 mb-4" placeholder="Email"/>
        <input name="bookerOccasion" value={inputs.bookerOccasion} onChange={handleChangeInput} type="text" className="border rounded p-3 w-80 mb-4" placeholder="Occassion (optional)"/>
        <input name="bookerRequest" value={inputs.bookerRequest} onChange={handleChangeInput} type="text" className="border rounded p-3 w-80 mb-4" placeholder="Requests (optional)"/>

        <button 
          className="bg-red-600 w-full p-3 text-white font-bold rounded disabled:bg-gray-300"
          disabled={disabled || loading}
          onClick={handleClick}
        >
          {loading ? <CircularProgress color="inherit" /> : "Complete reservation"}
            
        </button>
        <p className="text-sm mt-4">
        By clicking “Complete reservation” you agree to the OpenTable Terms of Use and Privacy Policy. Standard text message rates may apply. You may opt out of receiving text messages at any time.
        </p></>)}
    </div>  
  )
}
