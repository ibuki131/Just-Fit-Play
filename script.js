document.addEventListener('DOMContentLoaded', () => {
  // すべての .calendar クラスを持つ要素を取得
  const calendarEls = document.querySelectorAll('.calendar'); 

  // 各カレンダー要素に FullCalendar を適用
  calendarEls.forEach(calendarEl => {
      const calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'timeGridWeek',
          events: [
              {
                  title: 'バスケットボール',
                  daysOfWeek: [4], // 木曜日
                  startTime: '20:00:00',
                  endTime: '22:00:00',
                  display: 'block'
              },
              {
                  title: 'ソフトボール',
                  daysOfWeek: [3], // 水曜日
                  startTime: '16:00:00',
                  endTime: '18:00:00',
                  display: 'block'
              },
              {
                  title: 'サッカー',
                  daysOfWeek: [0], // 日曜日
                  startTime: '9:00:00',
                  endTime: '11:00:00',
                  display: 'block'
              },
              {
                  title: 'タグラグビー',
                  daysOfWeek: [6], // 土曜日
                  startTime: '10:00:00',
                  endTime: '12:00:00',
                  display: 'block'
              },
              {
                  url: 'index(参加申し込み).html',
                  title: 'バレーボール',
                  daysOfWeek: [2], // 火曜日
                  startTime: '20:00:00',
                  endTime: '22:00:00',
                  display: 'block'
              },
              {
                  title: 'バスケットボール',
                  daysOfWeek: [0], // 日曜日
                  startTime: '19:00:00',
                  endTime: '22:00:00',
                  display: 'block'
              },
          ]
      });

      calendar.render();
  });
});
