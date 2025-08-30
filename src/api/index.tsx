import type { HolidayResponse } from "./models";

export const API = {
  getHolidayInfo(): Promise<HolidayResponse> {
    return fetch(
      "https://www.shuyz.com/githubfiles/china-holiday-calender/master/holidayAPI.json"
    )
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error fetching holiday info:", error);
        throw error;
      });
  },
};
