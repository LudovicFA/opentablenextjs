import { findAvailableTables } from "@/services/restaurants/findAvailableTables";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse){
 if(req.method === 'POST'){
    const {slug, day, time, partySize} = req.query as {slug: string; day: string; time: string; partySize: string}

    const {bookerEmail, bookerPhone, bookerFirstName, bookerLastName, bookerOccasion, bookerRequest} = req.body;

    const restaurant = await prisma.restaurant.findUnique({
        where: {
            slug
        },
        select: {
            id: true,
            tables: true,
            open_time:true,
            close_time: true
        }
    })

    if(!restaurant){
        return res.status(400).json({
            errorMessage: "Invalid data provided"
        })
    }

    if(
        new Date(`${day}T${time}`) < new Date(`${day}T${restaurant.open_time}`) ||
        new Date(`${day}T${time}`) > new Date(`${day}T${restaurant.close_time}`)
    ){
        return res.status(400).json({
            errorMessage: "Restaurant is not open at that time"
        })
    }

    const searchTimesWithTables = await findAvailableTables({time, day, restaurant, res});

    if(!searchTimesWithTables) {
        return res.status(400).json({
            errorMessage: "Invalid data provided"
        })
    }

    const searchTimeWithTables = searchTimesWithTables.find((t) => {
        return t.date.toISOString() === new Date(`${day}T${time}`).toISOString()
    })
    
    if(!searchTimeWithTables){
        return res.status(400).json({
            errorMessage: "No availability, cannot book !!"
        })
    }

    const tableCount: {
        2: number[],
        4: number[]
    } = {
        2: [],
        4: []
    }

    searchTimeWithTables.tables.forEach(table => {
        if(table.seats === 2){
            tableCount[2].push(table.id)
        }
        else{
            tableCount[4].push(table.id)
        }
    })
    
    const tableToBooks: number[] = [];
    let seatsRemaining = parseInt(partySize)

    while (seatsRemaining > 0) {
        if(seatsRemaining >= 3){
            if(tableCount[4].length){
                tableToBooks.push(tableCount[4][0])
                tableCount[4].shift()
                seatsRemaining = seatsRemaining - 4
            }
            else{
                tableToBooks.push(tableCount[2][0])
                tableCount[2].shift()
                seatsRemaining = seatsRemaining - 2
            }
        } else {
            if(tableCount[2].length){
                tableToBooks.push(tableCount[2][0])
                tableCount[2].shift()
                seatsRemaining = seatsRemaining - 2
            }
            else{
                tableToBooks.push(tableCount[4][0])
                tableCount[4].shift()
                seatsRemaining = seatsRemaining - 4
            }
        }
    }

    const booking = await prisma.booking.create({
        data: {
            number_of_people: parseInt(partySize),
            booking_time: new Date(`${day}T${time}`),
            booker_email: bookerEmail,
            booker_first_name: bookerFirstName,
            booker_last_name: bookerLastName,
            booker_occasion: bookerOccasion,
            booker_phone: bookerPhone,
            booker_request: bookerRequest,
            restaurant_id: restaurant.id
        }
    })

    const bookingOnTableData = tableToBooks.map(table_id => {
        return {
            table_id,
            booking_id: booking.id
        }
    })
    
    await prisma.bookingOnTables.createMany({
        data: bookingOnTableData
    })


    return res.json(booking)
 }
} 