import {
  type Accessor,
  type Component,
  For,
  Show,
  createMemo,
  onMount,
} from "solid-js";
import "./TeachingCalendar.css";

/** 休息/调休 标记 */
export type SpecialDay =
  | { date: string; name?: string; type: "holiday" } // 放假
  | { date: string; name?: string; type: "makeup" }; // 调休（周末上班）

interface TeachingCalendarProps {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  specialDays?: SpecialDay[];
  locale?: string;
  weekdayLabels?: string[]; // 长度 7，从周一开始

  /** 是否在渲染后自动滚动到今天（默认 true） */
  autoScrollToToday?: boolean;
  /** 是否高亮今天（默认 true） */
  highlightToday?: boolean;
  /** 用于测试/演示：覆盖“今天”的日期（YYYY-MM-DD）。不传则取系统今天 */
  todayOverride?: string;

  maxHeight?: string;

  hideYear?: boolean;

  currentTime?: Accessor<Date>;

  /** 暴露方法给父组件 */
  onReady?: (api: {
    scrollToDate: (dateLike: string | Date, behavior?: ScrollBehavior) => void;
    scrollToToday: (behavior?: ScrollBehavior) => void;
  }) => void;
}

/* -------------------- 日期工具 -------------------- */
function toDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function addDays(d: Date, n: number) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}
function startOfWeekMonday(d: Date) {
  const i = (d.getDay() + 6) % 7;
  return addDays(d, -i);
}
function endOfWeekMonday(d: Date) {
  return addDays(startOfWeekMonday(d), 6);
}
function inRange(d: Date, a: Date, b: Date) {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const s = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const e = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return t >= s && t <= e;
}
function monthKey(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}
function generateWeeks(start: Date, end: Date) {
  const out: Date[][] = [];
  let cur = startOfWeekMonday(start);
  const guard = endOfWeekMonday(end);
  while (cur <= guard) {
    const w: Date[] = [];
    for (let i = 0; i < 7; i++) w.push(addDays(cur, i));
    out.push(w);
    cur = addDays(cur, 7);
  }
  return out;
}

/* -------------------- 组件 -------------------- */
export const TeachingCalendar: Component<TeachingCalendarProps> = (props) => {
  const locale = () => props.locale ?? "zh-CN";
  const weekdayLabels = () =>
    props.weekdayLabels ?? [
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六",
      "星期日",
    ];
  const highlightToday = () => props.highlightToday ?? true;
  const autoScrollToToday = () => props.autoScrollToToday ?? true;

  const startDate = createMemo(() => toDate(props.start));
  const endDate = createMemo(() => toDate(props.end));

  const maxHeight = createMemo(() => props.maxHeight ?? "100vh");
  const hideYear = createMemo(() => props.hideYear ?? false);

  const currentTime = props.currentTime;

  const todayKey = createMemo(() => {
    if (props.todayOverride) return props.todayOverride;
    const now = currentTime ? currentTime() : new Date(); // 本地时区
    return ymd(now);
  });

  const specialMap = createMemo(() => {
    const m = new Map<string, SpecialDay>();
    (props.specialDays ?? []).forEach((sd) => m.set(sd.date, sd));
    return m;
  });

  const allWeeks = createMemo(() => generateWeeks(startDate(), endDate()));
  const weeks = createMemo(() =>
    allWeeks().filter((w) => w.some((d) => inRange(d, startDate(), endDate())))
  );

  const teachingWeekNumbers = createMemo(() => {
    const base = startOfWeekMonday(startDate());
    return weeks().map((w) => {
      const monday = w[0];
      const diff = Math.floor((monday.getTime() - base.getTime()) / 86400000);
      return Math.floor(diff / 7) + 1;
    });
  });

  const weekMonthKeys = createMemo(() => {
    return weeks().map((w) => {
      const cnt = new Map<string, number>();
      for (const d of w) {
        if (!inRange(d, startDate(), endDate())) continue;
        const mk = monthKey(d);
        cnt.set(mk, (cnt.get(mk) ?? 0) + 1);
      }
      if (cnt.size === 0) return monthKey(w[0]);
      let best = "",
        n = -1;
      cnt.forEach((v, k) => {
        if (v > n) {
          n = v;
          best = k;
        }
      });
      return best;
    });
  });

  const monthGroups = createMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale(), {
      year: hideYear() ? undefined : "numeric",
      month: "short",
    });
    const by = new Map<string, { label: string; weekIdxs: number[] }>();
    weekMonthKeys().forEach((mk, idx) => {
      const [y, m] = mk.split("-").map(Number);
      const label = fmt.format(new Date(y, m - 1, 1));
      if (!by.has(mk)) by.set(mk, { label, weekIdxs: [] });
      by.get(mk)!.weekIdxs.push(idx);
    });
    return [...by.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, v]) => ({ key, ...v }));
  });

  function cellClass(d: Date, weekdayIdx: number) {
    const cls = ["tc-cell"];
    const key = ymd(d);
    const sp = specialMap().get(key);
    const within = inRange(d, startDate(), endDate());
    if (!within) cls.push("tc-outside");
    const isWeekend = weekdayIdx >= 5;
    if (sp?.type === "makeup") cls.push("tc-makeup");
    else if (sp?.type === "holiday") cls.push("tc-holiday");
    else if (isWeekend) cls.push("tc-weekend");
    else cls.push("tc-weekday");

    if (highlightToday() && key === todayKey()) cls.push("tc-today");
    return cls.join(" ");
  }

  function specialDayName(d: Date) {
    const key = ymd(d);
    const sp = specialMap().get(key);
    return sp?.name;
  }

  /* -------------------- 滚动定位 API -------------------- */
  let scrollerRef: HTMLDivElement | undefined;
  let tableRef: HTMLTableElement | undefined;

  function getStickyOffsets() {
    // 头部高度 & 左边两列总宽度（根据实际渲染测量，避免和样式不同步）
    const thead = tableRef?.tHead as HTMLTableElement | undefined;
    const headerH = thead?.offsetHeight ?? 0;
    const firstRow = thead?.rows?.[0];
    const monthTh = firstRow?.cells?.[0] as HTMLElement | undefined;
    const weekTh = firstRow?.cells?.[1] as HTMLElement | undefined;
    const leftSticky = (monthTh?.offsetWidth ?? 0) + (weekTh?.offsetWidth ?? 0);
    return { headerH, leftSticky };
  }

  function scrollToDate(
    dateLike: string | Date,
    behavior: ScrollBehavior = "smooth"
  ) {
    const key = typeof dateLike === "string" ? dateLike : ymd(dateLike);
    const td = tableRef?.querySelector(
      `td[data-date="${key}"]`
    ) as HTMLElement | null;
    const scroller = scrollerRef;
    if (!td || !scroller) return;

    const { headerH, leftSticky } = getStickyOffsets();

    // 计算目标相对 scroller 的可视位置
    const tdRect = td.getBoundingClientRect();
    const scRect = scroller.getBoundingClientRect();
    const targetLeft =
      scroller.scrollLeft + (tdRect.left - scRect.left) - leftSticky - 8; // 额外腾出 8px
    const targetTop =
      scroller.scrollTop + (tdRect.top - scRect.top) - headerH - 8;

    scroller.scrollTo({
      left: Math.max(0, targetLeft),
      top: Math.max(0, targetTop),
      behavior,
    });
  }

  function scrollToToday(behavior: ScrollBehavior = "smooth") {
    // 只有“今天在学期范围内”才滚动
    const tk = todayKey();
    const td = tableRef?.querySelector(`td[data-date="${tk}"]`);
    if (td) scrollToDate(tk, behavior);
  }

  onMount(() => {
    props.onReady?.({ scrollToDate, scrollToToday });
    if (autoScrollToToday()) scrollToToday("auto");
  });

  return (
    <div
      class="tc-wrap"
      style={
        hideYear()
          ? {
              "--col-month-w": "60px",
              "--col-week-w": "55px",
            }
          : {}
      }
    >
      <div class="tc-frame">
        <div
          style={{ "max-height": maxHeight() }}
          class="tc-scroller"
          ref={(el) => (scrollerRef = el)}
        >
          <table class="tc-table" ref={(el) => (tableRef = el)}>
            <thead>
              <tr>
                {/* 顶部左两格：既 sticky-left，又 sticky-top */}
                <th class="tc-th tc-col-month tc-sticky tc-sticky-top">月份</th>
                <th class="tc-th tc-col-week  tc-sticky-2 tc-sticky-top">
                  周次
                </th>
                {/* 星期列：仅 top sticky */}
                <For each={weekdayLabels()}>
                  {(lab) => <th class="tc-th tc-sticky-top">{lab}</th>}
                </For>
              </tr>
            </thead>

            <tbody>
              <For each={monthGroups()}>
                {(mg) => {
                  const weeksOfMonth = mg.weekIdxs.map((i) => weeks()[i]);
                  const weekNumsOfMonth = mg.weekIdxs.map(
                    (i) => teachingWeekNumbers()[i]
                  );
                  return (
                    <>
                      <For each={weeksOfMonth}>
                        {(week, idx) => (
                          <tr>
                            {/* 月份：仅首行渲染，rowSpan=该月周数；左 sticky */}
                            <Show when={idx() === 0}>
                              <th
                                class="tc-th tc-col-month tc-rowhead tc-sticky"
                                rowSpan={weeksOfMonth.length}
                              >
                                {mg.label}
                              </th>
                            </Show>

                            {/* 周次：第二列，也左 sticky */}
                            <th class="tc-th tc-col-week tc-rowhead tc-sticky-2">
                              第 {weekNumsOfMonth[idx()]} 周
                            </th>

                            {/* 一周 7 天 */}
                            <For each={week}>
                              {(d, dayIdx) => {
                                const key = ymd(d);
                                const sp = specialMap().get(key);
                                const within = inRange(
                                  d,
                                  startDate(),
                                  endDate()
                                );
                                return (
                                  <td
                                    class={`tc-td ${cellClass(d, dayIdx())}`}
                                    title={sp?.name ?? ""}
                                    data-date={key}
                                  >
                                    <div class="tc-date">
                                      {d.getMonth() + 1}/{d.getDate()}
                                    </div>
                                    {within && specialDayName(d) && (
                                      <div class="tc-badge">
                                        {specialDayName(d)}
                                      </div>
                                    )}
                                  </td>
                                );
                              }}
                            </For>
                          </tr>
                        )}
                      </For>
                    </>
                  );
                }}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeachingCalendar;
