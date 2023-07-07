import { useRouter } from "next/router";
import Header from "./components/Header";
import RestaurantCard, { RestaurantDetailType } from "./components/RestaurantCard";
import SearchSideBar from "./components/SearchSideBar";
import { Cuisine, PRICE, PrismaClient, Location } from "@prisma/client";
export const metadata = {
  title: 'OpenTable - Search',
}


const prisma = new PrismaClient();

interface SearchParams {city?: string, cuisine?: string, price?: PRICE}
  
const fetchRestaurantByCity = (searchParams: SearchParams) : Promise<RestaurantDetailType[]> => {
  const where: any = {};
  if(searchParams.city){
    const location = {
      name: {
        equals: searchParams.city.toLowerCase()
      }
    }
    where.location = location;
  }
  if(searchParams.cuisine){
    const cuisine = {
      name: {
        equals: searchParams.cuisine.toLowerCase()
      }
    }
    where.cuisine = cuisine;
  }
  if(searchParams.price){
    const price = {
      equals: searchParams.price
    }
    where.price = price;
  }

  const select =  {
    id: true,
    name: true,
    main_image: true,
    location: true,
    price: true,
    cuisine: true,
    slug: true,
    reviews: true,
  };
  return prisma.restaurant.findMany({
    where,
    select    
  })
}

const fetchLocations = async () => {
  const locations=  await prisma.location.findMany({
    orderBy:{
      name: 'asc'
    }
  });
  return locations;
}
const fetchCuisines = async () => {
  const cuisines=  await prisma.cuisine.findMany({
    orderBy:{
      name: 'asc'
    }
  });
  return cuisines;
}

export default async function Search({searchParams}: {searchParams : SearchParams}) {

  const restaurants = await fetchRestaurantByCity(searchParams);
  
  const locations = await fetchLocations();
  const cuisines = await fetchCuisines();
    return (
      <>
          <Header />
          <div className="flex py-4 m-auto w-2/3 justify-between items-start">
            <SearchSideBar locations={locations} cuisines={cuisines} searchParams={searchParams}/>
            <div className="w-5/6">
              {
                restaurants.length ? (
                  <>
                  {
                    restaurants.map((restaurant) => (
                     <RestaurantCard key={restaurant.id} restaurant={restaurant}/>
                    ))
                  }
                  </>
                ) : (
                <p>We found no restaurant in this area</p>
              )}
              
            </div>
          </div>
        </>
    )
}