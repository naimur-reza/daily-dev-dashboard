import { Cloud } from "lucide-react";
import type { WeatherData } from "@/types";

export default function WeatherWidget({
  weather,
}: {
  weather: WeatherData | null;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800/60 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="w-4 h-4 text-sky-400" />
        <h2 className="text-xs lg:text-sm font-medium text-gray-400 uppercase tracking-widest">
          Weather
        </h2>
      </div>

      {!weather ? (
        <div className="text-gray-600 text-sm">
          Add NEXT_PUBLIC_WEATHER_API_KEY to .env.local
        </div>
      ) : (
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-semibold text-white">
              {weather.temp}°C
            </span>
          </div>
          <p className="text-sm text-gray-400 capitalize mb-1">
            {weather.description}
          </p>
          <p className="text-xs text-gray-600">
            {weather.city} · Humidity {weather.humidity}%
          </p>
        </div>
      )}
    </div>
  );
}
