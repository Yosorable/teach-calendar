// TeacherTimetable.tsx
import {
  type Accessor,
  For,
  type JSX,
  createMemo,
  createSignal,
  onMount,
} from "solid-js";
import "./TeacherTimeTable.css";

export type Section = {
  title: string;
  periods: { start: string; end: string }[];
};

export type CourseCell = {
  course: string;
  className?: string; // 班级（老师视角更常用）
  room?: string; // 教室
  color?: string; // 可选背景色
  span?: number; // 在同一时段内跨多少节（默认1）
};
export type CellsMap = Record<string, CourseCell>;

export type TeacherTimetableProps = {
  weekdays?: string[]; // 默认 周一~周日
  sections?: Section[]; // 默认 上午4节 / 下午4节
  data: CellsMap; // key: `${day}-${section}-${period}`
  renderCell?: (cell: CourseCell) => JSX.Element; // 自定义渲染
  onCellClick?: (
    key: { day: number; section: number; period: number },
    cell?: CourseCell
  ) => void;
  currentTime?: Accessor<Date>;
};

const defaultWeekdays = [
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
  "星期日",
];

const defaultSections: Section[] = [
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
];

const k = (d: number, s: number, p: number) => `${d}-${s}-${p}`;
const pad = (n: number) => String(n).padStart(2, "0");

function getTimePercentage(start: string, end: string, current: string) {
  // 将 "HH:mm" 转成分钟数
  function toMinutes(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  const curMin = toMinutes(current);

  if (curMin <= startMin) return 0; // 在开始之前
  if (curMin >= endMin) return 100; // 在结束之后

  const percent = ((curMin - startMin) / (endMin - startMin)) * 100;
  return percent;
}

export default function TeacherTimetable(props: TeacherTimetableProps) {
  const weekdays = () => props.weekdays ?? defaultWeekdays;
  const sections = () => props.sections ?? defaultSections;
  const data = () => props.data ?? {};

  const currentTime = props.currentTime;
  const [_currentTime, setCurrentTime] = createSignal(new Date());

  const dayIdx = createMemo(() => {
    const curr = currentTime ? currentTime() : _currentTime();
    return (curr.getDay() + 6) % 7; // 周一=0, 周日=6
  });

  function getTimelineStyle(sec: Section, d: number, si: number, p: number) {
    const timeStampStyle: { [key: string]: string } = {};

    const curr = currentTime ? currentTime() : _currentTime();
    // 星期
    if (d === (curr.getDay() + 6) % 7) {
      const hm = `${pad(curr.getHours())}:${pad(curr.getMinutes())}`;
      const inactive = "linear-gradient(90deg, #9aa3b2, #6b7280)";
      if (hm >= sec.periods[p - 1].start && hm < sec.periods[p - 1].end) {
        timeStampStyle["display"] = "block";

        const pec =
          getTimePercentage(
            sec.periods[p - 1].start,
            sec.periods[p - 1].end,
            hm
          ) + "%";
        timeStampStyle["top"] = `max(0px, ${pec} - 3px)`;
      } else if (si === 0 && p === 1 && hm < sec.periods[0].start) {
        timeStampStyle["display"] = "block";
        timeStampStyle["top"] = "-3px";
        timeStampStyle["box-shadow"] = "none";
        timeStampStyle["background"] = inactive;
      } else if (
        hm >= sec.periods[p - 1].end &&
        ((p < sec.periods.length && hm < sec.periods[p].start) ||
          p === sec.periods.length)
      ) {
        if (
          (si < sections().length - 1 &&
            hm < sections()[si + 1].periods[0].start) ||
          si === sections().length - 1
        ) {
          timeStampStyle["display"] = "block";
          timeStampStyle["top"] = "calc(100% - 3px)";
          timeStampStyle["box-shadow"] = "none";
          timeStampStyle["background"] = inactive;
        }
      } else {
        timeStampStyle["display"] = "none";
      }
    }

    return timeStampStyle;
  }

  onMount(() => {
    if (!currentTime) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

      return () => clearInterval(interval);
    }
  });

  // 计算因跨节(rowspan)而需要在后续行隐藏的单元格
  const skipSet = createMemo(() => {
    const s = new Set<string>();
    const secs = sections();
    const wdCount = weekdays().length;
    for (let d = 0; d < wdCount; d++) {
      secs.forEach((sec, si) => {
        for (let p = 1; p <= sec.periods.length; p++) {
          const cell = data()[k(d, si, p - 1)];
          const span = cell?.span ?? 1;
          if (span > 1) {
            for (
              let off = 1;
              off < span && p + off <= sec.periods.length;
              off++
            ) {
              s.add(k(d, si, p + off));
            }
          }
        }
      });
    }
    return s;
  });

  const renderCell = (cell: CourseCell) => {
    if (props.renderCell) return props.renderCell(cell);
    return (
      <div class="tt-cell">
        <div class="tt-course">{cell.course}</div>
        <div class="tt-meta">
          <span>{(cell.className ?? "") + " " + (cell.room ?? "")}</span>
        </div>
      </div>
    );
  };

  return (
    <div class="tt-wrapper">
      <table class="tt-table">
        <thead>
          <tr>
            <th class="tt-empty tt-colhead" colspan={2}>
              时间
            </th>
            <For each={weekdays()}>
              {(wd, idx) => {
                return (
                  <th
                    class="tt-colhead"
                    style={{
                      color: idx() === dayIdx() ? "#00B883" : undefined,
                      "box-shadow":
                        idx() === dayIdx()
                          ? "inset 0 0 0 2px #00B883"
                          : undefined,
                    }}
                  >
                    {wd}
                  </th>
                );
              }}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={sections()}>
            {(sec, si) => (
              <For
                each={Array.from(
                  { length: sec.periods.length },
                  (_, i) => i + 1
                )}
              >
                {(p) => {
                  let courseNO = p;
                  const timeRange = `${sec.periods[p - 1].start} ~ ${
                    sec.periods[p - 1].end
                  }`;

                  const st = sec.periods[p - 1].start;
                  const et = sec.periods[p - 1].end;

                  if (si() !== 0) {
                    for (let i = 0; i < si(); i++) {
                      const prevSec = sections()[i];
                      courseNO += prevSec.periods.length;
                    }
                  }

                  return (
                    <tr>
                      {p === 1 && (
                        <th
                          class="tt-rowhead tt-section"
                          rowspan={sec.periods.length}
                        >
                          {sec.title}
                        </th>
                      )}
                      <th class="tt-rowhead tt-period">
                        <div class="tt-period-wrapper" data-n={courseNO}></div>
                        <div
                          class="tt-period-time-range"
                          data-st={st}
                          data-et={et}
                        ></div>
                      </th>
                      <For each={weekdays()}>
                        {(_, d) => {
                          const key = k(d(), si(), p - 1);
                          if (skipSet().has(key)) return null; // 被上方跨节覆盖
                          const cell = data()[key];
                          const span = cell?.span ?? 1;
                          const backgroundColor = cell?.color
                            ? { "background-color": cell.color }
                            : {};

                          return (
                            <td
                              class={
                                "tt-slot timeline-container" +
                                (cell ? " has" : "")
                              }
                              rowspan={span}
                              style={{
                                ...backgroundColor,
                              }}
                              onClick={() =>
                                props.onCellClick?.(
                                  { day: d(), section: si(), period: p },
                                  cell
                                )
                              }
                            >
                              <div
                                class={
                                  si() === 0 && p === 1
                                    ? "tt-tooltip-top"
                                    : "tt-tooltip"
                                }
                              >
                                {timeRange}
                              </div>
                              <div class="timeline-content">
                                {cell ? (
                                  renderCell(cell)
                                ) : (
                                  <span class="tt-emptytext">—</span>
                                )}
                              </div>

                              <div
                                style={getTimelineStyle(sec, d(), si(), p)}
                                class="timeline-line"
                              >
                                <div class="timeline-line-time-info">
                                  {(() => {
                                    const curr = currentTime ?? _currentTime;
                                    return `${pad(curr().getHours())}:${pad(
                                      curr().getMinutes()
                                    )}`;
                                  })()}
                                </div>
                              </div>
                            </td>
                          );
                        }}
                      </For>
                    </tr>
                  );
                }}
              </For>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}
