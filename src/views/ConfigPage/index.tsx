import { createSignal, For } from "solid-js";
import { type AppConfig } from "../../App";
import { btoaUtf8 } from "../../utils/base64";

export default function ConfigPage() {
  const [calendar, setCalendar] = createSignal<AppConfig["calendar"]>({
    start: "2025-09-01",
    end: "2026-02-08",
  });
  const [courses, setCourses] = createSignal<AppConfig["course"]>([]);
  const [courseSections, setCourseSections] = createSignal<
    AppConfig["courseSections"]
  >([
    {
      title: "上午",
      periods: [
        { start: "08:00", end: "08:40" },
        { start: "08:50", end: "09:30" },
        { start: "09:40", end: "10:20" },
        { start: "10:30", end: "11:10" },
      ],
    },
    {
      title: "下午",
      periods: [
        { start: "13:00", end: "13:40" },
        { start: "13:50", end: "14:30" },
        { start: "14:40", end: "15:20" },
        { start: "15:30", end: "16:10" },
      ],
    },
  ]);
  const [centerImage, setCenterImage] =
    createSignal<AppConfig["centerImage"]>(undefined);
  const [backgroundImage, setBackgroundImage] =
    createSignal<AppConfig["backgroundImage"]>(undefined);

  function generateLink() {
    let centerImg = centerImage();
    if (centerImg === "") centerImg = undefined;

    let backgroundImg = backgroundImage();
    if (backgroundImg === "") backgroundImg = undefined;

    const config: AppConfig = {
      calendar: calendar(),
      course: courses(),
      courseSections: courseSections(),
      centerImage: centerImg,
      backgroundImage: backgroundImg,
    };

    const jsonStr = JSON.stringify(config);
    const encoded = btoaUtf8(jsonStr);
    // 去除最后一个路径
    const lastPath = window.location.pathname.split("/").pop() ?? "";
    return `${window.location.origin}${window.location.pathname.replace(
      lastPath,
      ""
    )}#${encoded}`;
  }

  return (
    <div>
      <h1>配置页面</h1>
      <div>
        <h2>日历配置</h2>
        <label>
          开始时间:
          <input
            type="date"
            value={calendar().start}
            onChange={(e) =>
              setCalendar((prev) => ({ ...prev, start: e.target.value }))
            }
          />
        </label>
        <label>
          结束时间:
          <input
            type="date"
            value={calendar().end}
            onChange={(e) =>
              setCalendar((prev) => ({ ...prev, end: e.target.value }))
            }
          />
        </label>
      </div>
      <div>
        <h2>课程配置</h2>
        <div>
          <h3>节数配置</h3>
          <div
            style={{
              display: "flex",
              gap: "20px",
              "align-items": "flex-start",
            }}
          >
            <div>
              <h4>上午</h4>
              <div>
                <For each={courseSections()[0].periods}>
                  {(period, idx) => (
                    <div>
                      <label>
                        第 {idx() + 1} 节 :
                        <input
                          type="time"
                          value={period.start}
                          onChange={(e) =>
                            setCourseSections((prev) => {
                              const newSections = [...prev];
                              newSections[0].periods[idx()] = {
                                ...newSections[0].periods[idx()],
                                start: e.target.value,
                              };
                              return newSections;
                            })
                          }
                        />
                        <input
                          type="time"
                          value={period.end}
                          onChange={(e) =>
                            setCourseSections((prev) => {
                              const newSections = [...prev];
                              newSections[0].periods[idx()] = {
                                ...newSections[0].periods[idx()],
                                end: e.target.value,
                              };
                              return newSections;
                            })
                          }
                        />
                        <button
                          onClick={() =>
                            setCourseSections((prev) => {
                              const newSections = [...prev];
                              newSections[0].periods.splice(idx(), 1);
                              return newSections;
                            })
                          }
                        >
                          del
                        </button>
                      </label>
                    </div>
                  )}
                </For>
                <div>
                  <button
                    onClick={() =>
                      setCourseSections((prev) => {
                        const newSections = [...prev];
                        newSections[0].periods.push({ start: "", end: "" });
                        return newSections;
                      })
                    }
                  >
                    add
                  </button>
                </div>
              </div>
            </div>
            <div>
              <h4>下午</h4>
              <div>
                <For each={courseSections()[1].periods}>
                  {(period, idx) => (
                    <div>
                      <label>
                        第 {idx() + 1} 节 :
                        <input
                          type="time"
                          value={period.start}
                          onChange={(e) =>
                            setCourseSections((prev) => {
                              const newSections = [...prev];
                              newSections[1].periods[idx()] = {
                                ...newSections[1].periods[idx()],
                                start: e.target.value,
                              };
                              return newSections;
                            })
                          }
                        />
                        <input
                          type="time"
                          value={period.end}
                          onChange={(e) =>
                            setCourseSections((prev) => {
                              const newSections = [...prev];
                              newSections[1].periods[idx()] = {
                                ...newSections[1].periods[idx()],
                                end: e.target.value,
                              };
                              return newSections;
                            })
                          }
                        />
                        <button
                          onClick={() =>
                            setCourseSections((prev) => {
                              const newSections = [...prev];
                              newSections[1].periods.splice(idx(), 1);
                              return newSections;
                            })
                          }
                        >
                          del
                        </button>
                      </label>
                    </div>
                  )}
                </For>
                <div>
                  <button
                    onClick={() =>
                      setCourseSections((prev) => {
                        const newSections = [...prev];
                        newSections[1].periods.push({ start: "", end: "" });
                        return newSections;
                      })
                    }
                  >
                    add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3>课程安排</h3>
          <For each={courses()}>
            {(course, idx) => (
              <div>
                <h4>课程 {idx() + 1}</h4>
                <label>
                  课程名称:
                  <input
                    type="text"
                    value={course.name}
                    onChange={(e) =>
                      setCourses((prev) => {
                        const newCourses = [...prev];
                        newCourses[idx()] = {
                          ...newCourses[idx()],
                          name: e.target.value,
                        };
                        return newCourses;
                      })
                    }
                  />
                </label>
                <label>
                  课程班级:
                  <input
                    type="text"
                    value={course.className}
                    onChange={(e) =>
                      setCourses((prev) => {
                        const newCourses = [...prev];
                        newCourses[idx()] = {
                          ...newCourses[idx()],
                          className: e.target.value,
                        };
                        return newCourses;
                      })
                    }
                  />
                </label>
                <label>
                  课程颜色:
                  <input
                    type="color"
                    value={course.color}
                    onChange={(e) =>
                      setCourses((prev) => {
                        const newCourses = [...prev];
                        newCourses[idx()] = {
                          ...newCourses[idx()],
                          color: e.target.value,
                        };
                        return newCourses;
                      })
                    }
                  />
                </label>
                <label>
                  课程节次 (0开始):
                  <textarea
                    value={course.sections.join(",")}
                    onChange={(e) =>
                      setCourses((prev) => {
                        const newCourses = [...prev];
                        newCourses[idx()] = {
                          ...newCourses[idx()],
                          sections: e.target.value.split(","),
                        };
                        return newCourses;
                      })
                    }
                  />
                </label>
              </div>
            )}
          </For>
          <div>
            <button
              onClick={() =>
                setCourses((prev) => [
                  ...prev,
                  { name: "", className: "", sections: [], color: "" },
                ])
              }
            >
              add
            </button>
          </div>
        </div>
      </div>
      <div>
        <a href={generateLink()} target="_blank" rel="noopener noreferrer">
          打开链接
        </a>
      </div>
    </div>
  );
}
