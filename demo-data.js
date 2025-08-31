"https://lzyable.com/c#" +
  encodeURIComponent(
    JSON.stringify({
      calendar: {
        start: "2025-09-01",
        end: "2026-02-08",
      },

      // color为css颜色字符串
      // sections的格式为 <星期-上下午-节>，都是从0开始
      course: [
        {
          name: "数学",
          className: "六(1)班",
          room: "A101",
          sections: ["1-0-1", "2-1-0", "3-0-3", "4-0-0", "4-0-3"],
          color: "hsla(0, 66%, 86%, 0.9)",
        },
        {
          name: "数学",
          className: "六(2)班",
          room: "A102",
          sections: ["0-1-2", "1-0-0", "2-0-2", "2-1-2", "3-0-2"],
          color: "hsla(29, 66%, 86%, 0.9)",
        },
        {
          name: "校本课程(数)",
          className: "六(1)班",
          room: "A101",
          sections: ["2-1-3"],
          color: "hsla(60, 61%, 86%, 0.9)",
        },
        {
          name: "校本课程(数)",
          className: "六(2)班",
          room: "A102",
          sections: ["4-1-0"],
          color: "hsla(60, 61%, 86%, 0.9)",
        },
      ],
      centerImage: undefined,
      backgroundImage: "https://w.wallhaven.cc/full/po/wallhaven-po2vg3.jpg",
    })
  );
