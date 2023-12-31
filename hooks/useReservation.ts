import axios from "axios";
import { Dispatch, SetStateAction, useState } from "react";

export default function useReservation(){
   const [loading, setLoading] = useState(false);
   const [error, setError] =useState(null);

    const createReservation = async (
        {slug, partySize, day, time, bookerEmail, bookerFirstName, bookerLastName, bookerOccasion, bookerPhone, bookerRequest, setDidBook}: {slug: string; partySize: number; day: string; time: string;bookerFirstName:string;
        bookerLastName:string;
        bookerPhone:string;
        bookerEmail:string;
        bookerOccasion:string;
        bookerRequest:string;
        setDidBook: Dispatch<SetStateAction<boolean>>
    }
    ) => {
        
        setLoading(true);
        try {
            const response = await axios.post(`http://localhost:3000/api/restaurant/${slug}/reserve`,{
                bookerFirstName,
                bookerLastName,
                bookerPhone,
                bookerEmail,
                bookerOccasion,
                bookerRequest,
            },
            {
                params: {
                    day,
                    time,
                    partySize
                }
            });
            setLoading(false);
            setDidBook(true);
            return response.data;

        } catch (error: any) {
            setLoading(false);
            setError(error.response.data.messsage)
        }
    }

    return {loading, error, createReservation}

}