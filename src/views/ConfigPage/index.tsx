import { createSignal, For } from "solid-js";
import { type AppConfig } from "../../App";
import { btoaUtf8 } from "../../utils/base64";

export default function ConfigPage() {
  const [calendar, setCalendar] = createSignal<AppConfig["calendar"]>({
    start: "2025-09-01",
    end: "2026-02-08",
  });
  const [courses, setCourses] = createSignal<AppConfig["course"]>([
    {
      name: "数学",
      className: "六(1)班",
      sections: ["1-0-1", "2-1-0", "3-0-1", "4-0-0", "4-0-3"],
    },
    {
      name: "数学",
      className: "六(2)班",
      sections: ["0-1-2", "1-0-0", "2-0-3", "2-1-2", "3-0-2"],
    },
    {
      name: "校本课程(数)",
      className: "六(1)班",
      sections: ["0-1-3"],
    },
    {
      name: "校本课程(数)",
      className: "六(2)班",
      sections: ["4-1-1"],
    },
  ]);
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
  const [backgroundImage, setBackgroundImage] = createSignal<
    AppConfig["backgroundImage"]
  >("https://w.wallhaven.cc/full/po/wallhaven-po2vg3.jpg");

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

  const configJsonStr = () => {
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

    return JSON.stringify(config, null, 2);
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          right: "20px",
        }}
      >
        <a href={generateLink()} target="_blank" rel="noopener noreferrer">
          打开链接
        </a>
      </div>
      <div
        style={{
          display: "flex",
          "flex-direction": "row",
          "justify-content": "space-between",
          padding: 0,
          margin: 0,
        }}
      >
        <div
          style={{
            height: "100vh",
            overflow: "auto",
          }}
        >
          <h1>配置页面</h1>
          <div>
            <h2>图片（可不配置）</h2>
            <label>
              背景图片地址:
              <input
                style={{ width: "30vw" }}
                type="url"
                value={backgroundImage() ?? ""}
                onChange={(e) =>
                  setBackgroundImage(
                    e.target.value === "" ? undefined : e.target.value
                  )
                }
              />
            </label>
            <br />
            <label>
              中间图片地址:
              <input
                style={{ width: "30vw" }}
                type="url"
                value={centerImage() ?? ""}
                onChange={(e) =>
                  setCenterImage(
                    e.target.value === "" ? undefined : e.target.value
                  )
                }
              />
            </label>
          </div>
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
                  <div style={{ border: "1px solid #ccc", margin: "10px" }}>
                    <h5>
                      课程 {idx() + 1}{" "}
                      <button
                        onClick={() => {
                          setCourses((prev) =>
                            prev.filter((_, i) => i !== idx())
                          );
                        }}
                      >
                        del
                      </button>
                    </h5>
                    <div>
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
                        教室（可不填）:
                        <input
                          type="text"
                          value={course.room ?? ""}
                          onChange={(e) => {
                            setCourses((prev) => {
                              const newCourses = [...prev];
                              newCourses[idx()] = {
                                ...newCourses[idx()],
                                room:
                                  e.target.value === ""
                                    ? undefined
                                    : e.target.value,
                              };
                              return newCourses;
                            });
                          }}
                        />
                      </label>
                      <div>
                        <label>
                          课程节次:
                          <div>
                            <For each={course.sections}>
                              {(section, sidx) => {
                                const sps = section.split("-");
                                const [weekday, setWeekday] = createSignal(
                                  sps.length === 3 ? sps[0] : ""
                                );
                                const [daytime, setDaytime] = createSignal(
                                  sps.length === 3 ? sps[1] : ""
                                );
                                const [period, setPeriod] = createSignal(
                                  sps.length === 3 ? sps[2] : ""
                                );

                                const handleChange = () => {
                                  const val = `${weekday()}-${daytime()}-${period()}`;
                                  setCourses((prev) => {
                                    const newCourses = [...prev];
                                    newCourses[idx()] = {
                                      ...newCourses[idx()],
                                      sections: [...newCourses[idx()].sections],
                                    };
                                    newCourses[idx()].sections[sidx()] = val;
                                    return newCourses;
                                  });
                                };

                                return (
                                  <div>
                                    <label>
                                      星期:
                                      <select
                                        id="weekday"
                                        name="weekday"
                                        required
                                        value={weekday()}
                                        onChange={(e) => {
                                          setWeekday(e.target.value);
                                          handleChange();
                                        }}
                                      >
                                        <option value="" disabled selected>
                                          请选择
                                        </option>
                                        <option value="0">周一</option>
                                        <option value="1">周二</option>
                                        <option value="2">周三</option>
                                        <option value="3">周四</option>
                                        <option value="4">周五</option>
                                      </select>
                                    </label>
                                    {/* 上午下午 */}
                                    <label>
                                      上下午:
                                      <select
                                        id="daytime"
                                        name="daytime"
                                        required
                                        value={daytime()}
                                        onChange={(e) => {
                                          setDaytime(e.target.value);
                                          handleChange();
                                        }}
                                      >
                                        <option value="" disabled selected>
                                          请选择
                                        </option>
                                        <option value="0">上午</option>
                                        <option value="1">下午</option>
                                      </select>
                                    </label>
                                    <label>
                                      节次:
                                      <select
                                        id="period"
                                        name="period"
                                        required
                                        value={period()}
                                        onChange={(e) => {
                                          setPeriod(e.target.value);
                                          handleChange();
                                        }}
                                      >
                                        <option value="" disabled selected>
                                          请选择
                                        </option>
                                        <For
                                          each={
                                            courseSections()[
                                              daytime() === "1" ? 1 : 0
                                            ].periods
                                          }
                                        >
                                          {(_, pidx) => (
                                            <option value={pidx()}>
                                              {`第${pidx() + 1}节`}
                                            </option>
                                          )}
                                        </For>
                                      </select>
                                    </label>
                                    <button
                                      onClick={() => {
                                        setCourses((prev) => {
                                          const newCourses = [...prev];
                                          newCourses[idx()] = {
                                            ...newCourses[idx()],
                                            sections: newCourses[
                                              idx()
                                            ].sections.filter(
                                              (_, i) => i !== sidx()
                                            ),
                                          };
                                          return newCourses;
                                        });
                                      }}
                                    >
                                      del
                                    </button>
                                  </div>
                                );
                              }}
                            </For>
                          </div>
                          <div>
                            <button
                              onClick={() =>
                                setCourses((prev) => {
                                  const newCourses = [...prev];
                                  newCourses[idx()] = {
                                    ...newCourses[idx()],
                                    sections: [
                                      ...newCourses[idx()].sections,
                                      "",
                                    ],
                                  };
                                  return newCourses;
                                })
                              }
                            >
                              +
                            </button>
                          </div>
                        </label>
                      </div>
                    </div>
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
        </div>
        <div style={{ flex: 1, height: "100vh", overflow: "auto" }}>
          <pre>{configJsonStr()}</pre>
        </div>
      </div>
    </>
  );
}
