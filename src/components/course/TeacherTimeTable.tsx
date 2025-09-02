// TeacherTimetable.tsx
import { For, type JSX, createMemo } from "solid-js";
import "./TeacherTimeTable.css";

export type Section = { title: string; periods: number };
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
  { title: "上午", periods: 4 },
  { title: "下午", periods: 4 },
];

const k = (d: number, s: number, p: number) => `${d}-${s}-${p}`;

export default function TeacherTimetable(props: TeacherTimetableProps) {
  const weekdays = () => props.weekdays ?? defaultWeekdays;
  const sections = () => props.sections ?? defaultSections;
  const data = () => props.data ?? {};

  // 计算因跨节(rowspan)而需要在后续行隐藏的单元格
  const skipSet = createMemo(() => {
    const s = new Set<string>();
    const secs = sections();
    const wdCount = weekdays().length;
    for (let d = 0; d < wdCount; d++) {
      secs.forEach((sec, si) => {
        for (let p = 1; p <= sec.periods; p++) {
          const cell = data()[k(d, si, p - 1)];
          const span = cell?.span ?? 1;
          if (span > 1) {
            for (let off = 1; off < span && p + off <= sec.periods; off++) {
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
              {(wd) => <th class="tt-colhead">{wd}</th>}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={sections()}>
            {(sec, si) => (
              <For each={Array.from({ length: sec.periods }, (_, i) => i + 1)}>
                {(p) => {
                  let courseNO = p;

                  if (si() !== 0) {
                    for (let i = 0; i < si(); i++) {
                      const prevSec = sections()[i];
                      courseNO += prevSec.periods;
                    }
                  }

                  return (
                    <tr>
                      {p === 1 && (
                        <th class="tt-rowhead tt-section" rowspan={sec.periods}>
                          {sec.title}
                        </th>
                      )}
                      <th class="tt-rowhead tt-period">
                        <div class="tt-period-wrapper" data-n={courseNO}></div>
                      </th>
                      <For each={weekdays()}>
                        {(_, d) => {
                          const key = k(d(), si(), p - 1);
                          if (skipSet().has(key)) return null; // 被上方跨节覆盖
                          const cell = data()[key];
                          const span = cell?.span ?? 1;
                          const style = cell?.color
                            ? { "background-color": cell.color }
                            : {};
                          return (
                            <td
                              class={"tt-slot" + (cell ? " has" : "")}
                              rowspan={span}
                              style={style}
                              onClick={() =>
                                props.onCellClick?.(
                                  { day: d(), section: si(), period: p },
                                  cell
                                )
                              }
                            >
                              {cell ? (
                                renderCell(cell)
                              ) : (
                                <span class="tt-emptytext">—</span>
                              )}
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
