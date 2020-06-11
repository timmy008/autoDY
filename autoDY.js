const child_process = require("child_process");

var index = 0;

function autoAdb() {
  console.log(`自动滑动第${++index}`);
  child_process.exec(`adb  shell  input swipe 540 1300 450 500 100`);
}

async function loop() {
  while (true) {
    var time = getRandomIntInclusive(2000, 4500);
    console.log(`休息一会哦：${time}`);
    await sleep(time);
    console.log(`休息结束，起床干活了......`);
    autoAdb();
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

loop();
