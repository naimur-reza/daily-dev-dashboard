import type { WeatherData } from "@/types";

export async function getWeather(): Promise<WeatherData | null> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  const city = process.env.NEXT_PUBLIC_WEATHER_CITY || "Dhaka";
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      city: data.name,
      humidity: data.main.humidity,
      icon: data.weather[0].icon,
    };
  } catch {
    return null;
  }
}
