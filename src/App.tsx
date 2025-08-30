import { createMemo, createSignal, onMount } from "solid-js";
import {
  TeachingCalendar,
  type SpecialDay,
} from "./components/calendar/TeachingCalendar";
import { API } from "./api";
import type { HolidayInfo } from "./api/models";

import TeacherTimetable, {
  type CellsMap,
} from "./components/course/TeacherTimeTable";

interface AppConfig {
  calendar: {
    start: string;
    end: string;
  };
  course: {
    name: string;
    className: string;
    room: string;
    color: string;
    sections: string[];
  }[];
  centerImage?: string;
  backgroundImage?: string;
}

function App() {
  const [specialDays, setSpecialDays] = createSignal<SpecialDay[]>([]);

  onMount(() => {
    API.getHolidayInfo().then((res) => {
      const currentYear = new Date().getFullYear();
      const currentYearHolidays = res.Years[currentYear.toString()];
      const nextYearHolidays = res.Years[(currentYear + 1).toString()];

      let holidays: SpecialDay[] = [];

      [currentYearHolidays, nextYearHolidays].forEach((curr) => {
        if (curr === null || curr === undefined) return;
        curr.forEach((h: HolidayInfo) => {
          const start = new Date(h.StartDate);
          const end = new Date(h.EndDate);

          for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            holidays.push({
              date: d.toISOString().split("T")[0],
              name: h.Name,
              type: "holiday",
            });
          }
          h.CompDays.forEach((cd) => {
            holidays.push({
              date: cd,
              name: h.Name + "调休",
              type: "makeup",
            });
          });
        });
      });
      setSpecialDays(holidays);
    });
  });

  const appConfig = createMemo(() => {
    const hash = window.location.hash.split("#")[1];
    const jsonStr = hash ? decodeURIComponent(hash) : "";

    if (jsonStr !== "") {
      try {
        const config = JSON.parse(jsonStr) as AppConfig;
        const res: CellsMap = {};
        for (const c of config.course) {
          c.sections.forEach((s) => {
            res[s] = {
              course: c.name,
              className: c.className,
              room: c.room,
              color: c.color,
            };
          });
        }
        return {
          calendar: config.calendar,
          course: res,
          backgroundImage: config.backgroundImage,
          centerImage: config.centerImage,
        };
      } catch (error) {
        console.warn("JSON parse error:", error);
      }
    }

    return {
      calendar: {
        start: new Date().toISOString().split("T")[0],
        end: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString()
          .split("T")[0],
      },
      course: generateCourseCell(),
    };
  });

  function generateCourseCell() {
    const candidateColors = [
      "hsl(  0 65% 86%)", // 柔和红
      "hsl( 30 65% 86%)", // 橙
      "hsl( 60 60% 86%)", // 浅黄
      "hsl( 90 55% 86%)", // 青黄
      "hsl(120 55% 86%)", // 绿
      "hsl(150 55% 86%)", // 翠绿
      "hsl(180 55% 86%)", // 青
      "hsl(210 60% 86%)", // 蔚蓝
      "hsl(240 60% 88%)", // 蓝
      "hsl(270 60% 88%)", // 紫
      "hsl(300 60% 88%)", // 品红
      "hsl(330 65% 88%)", // 粉
    ];
    const res: CellsMap = {
      "1-0-0": { course: "数学", className: "六(2)班", room: "A102" },
      "1-0-1": { course: "数学", className: "六(1)班", room: "A101" },
      "1-0-2": { course: "数学", className: "六(2)班", room: "A102" },

      "2-0-2": { course: "数学", className: "六(2)班", room: "A102" },
      "2-1-0": { course: "数学", className: "六(1)班", room: "A101" },
      "2-1-2": { course: "数学", className: "六(2)班", room: "A102" },
      "2-1-3": {
        course: "校本课程(数)",
        className: "六(1)班",
        room: "A101",
      },

      "3-0-2": { course: "数学", className: "六(2)班", room: "A102" },
      "3-0-3": { course: "数学", className: "六(1)班", room: "A101" },

      "4-0-0": { course: "数学", className: "六(1)班", room: "A101" },
      "4-0-3": { course: "数学", className: "六(1)班", room: "A101" },
      "4-1-0": {
        course: "校本课程(数)",
        className: "六(2)班",
        room: "A102",
      },
    };

    const mp: Record<string, string> = {};
    const keysCnt: Record<string, number> = {};
    let idx = 0;

    for (const key in res) {
      const cell = res[key];
      const colorKey = cell.course + (cell.className ?? "");
      keysCnt[colorKey] = (keysCnt[colorKey] || 0) + 1;
    }

    // 根据key出现的次数排序
    const sortedKeys = Object.keys(keysCnt).sort(
      (a, b) => keysCnt[a] - keysCnt[b]
    );

    for (const key of sortedKeys) {
      if (!(key in mp)) {
        const c = idx++ % candidateColors.length;
        mp[key] = candidateColors[c];
      }
    }

    for (const key in res) {
      const cell = res[key];
      const colorKey = cell.course + (cell.className ?? "");
      if (colorKey in mp) {
        cell.color = mp[colorKey];
      }
    }

    return res;
  }

  return (
    <div
      class="main-box"
      style={{
        "background-image": appConfig().backgroundImage
          ? `url(${appConfig().backgroundImage})`
          : undefined,
        "background-size": "cover",
        "background-position": "center",
      }}
    >
      <div
        style={{
          "max-width": "500px",
        }}
      >
        <TeacherTimetable
          data={appConfig().course}
          onCellClick={() => {}}
          weekdays={["星期一", "星期二", "星期三", "星期四", "星期五"]}
          sections={[
            { title: "上午", periods: 4 },
            { title: "下午", periods: 4 },
          ]}
        />
      </div>
      {appConfig().centerImage && (
        <div>
          <img src={appConfig().centerImage} alt="Center" />
        </div>
      )}
      <div
        style={{
          "max-width": "700px",
        }}
      >
        <TeachingCalendar
          start={appConfig().calendar.start}
          end={appConfig().calendar.end}
          locale="zh-CN"
          weekdayLabels={[
            "星期一",
            "星期二",
            "星期三",
            "星期四",
            "星期五",
            "星期六",
            "星期日",
          ]}
          specialDays={specialDays()}
          hideYear
          onReady={(api) => api.scrollToToday()}
          maxHeight="80vh"
        />
      </div>
    </div>
  );
}

export default App;
