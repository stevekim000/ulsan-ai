export type WeatherIconType = 
  | 'clear' 
  | 'partly_cloudy' 
  | 'cloudy' 
  | 'fog' 
  | 'drizzle' 
  | 'rain' 
  | 'heavy_rain' 
  | 'snow' 
  | 'storm';

export interface HourlyForecastItem {
  timeStr: string;           // "10:00", "11:00", ...
  isoTime: string;
  temperature: number;       // °C
  apparentTemperature: number; // °C 체감온도
  precipitationProbability: number; // %
  precipitationMm: number;   // mm 강수량
  weatherCode: number;
  conditionText: string;     // "비", "짙은 안개" 등
  iconType: WeatherIconType;
  windSpeed: number;         // km/h
}

export interface DailyForecastItem {
  dateStr: string;           // "오늘 (일)", "내일 (월)", "모레 (화)"
  isoDate: string;
  weatherCode: number;
  conditionText: string;
  iconType: WeatherIconType;
  maxTemp: number;
  minTemp: number;
  maxPrecipitationProb: number;
  maxWindSpeed: number;
}

export interface MountainWeatherResponse {
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
    elevation: number;
  };
  updatedAt: string;
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    precipitationMm: number;
    windSpeed: number;
    windGusts: number;
    weatherCode: number;
    conditionText: string;
    iconType: WeatherIconType;
  };
  mountainRisk: {
    level: 'normal' | 'caution' | 'warning' | 'danger';
    title: string;
    summary: string;
    studentTip: string;
    teacherDirective: string;
  };
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  dataSource: string;
}
