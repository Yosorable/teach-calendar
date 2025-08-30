/*
{
    "Name": "春节",
    "StartDate": "2025-01-28",
    "EndDate": "2025-02-04",
    "Duration": 8,
    "CompDays": [
        "2025-01-26",
        "2025-02-08"
    ],
    "URL": "https://www.gov.cn/zhengce/content/202411/content_6986382.htm",
    "Memo": "二、春节：1月28日（农历除夕、周二）至2月4日（农历正月初七、周二）放假调休，共8天。1月26日（周日）、2月8日（周六）上班。"

*/
export interface HolidayInfo {
  Name: string;
  StartDate: string;
  EndDate: string;
  Duration: number;
  CompDays: string[];
  URL: string;
  Memo: string;
}

export interface HolidayResponse {
  Name: string;
  Version: string;
  Generated: string;
  Timezone: string;
  Years: Record<string, HolidayInfo[]>;
}
