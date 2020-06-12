const child_process = require("child_process");
const readline = require("readline");
const stream = require("stream");

var index = 0;

function autoAdb() {
  console.log(`自动滑动第${++index}`);

  var cmdStr = child_process.execSync(`adb devices`);

  var bufferStream = new stream.PassThrough();
  bufferStream.end(cmdStr);

  var rl = readline.createInterface({ input: bufferStream });

  var count = 0;

  rl.on("line", (line) => {
    if (count > 0 && line.indexOf("device") != -1) {
      var devicesId = line.replace("device", "").trim();
      console.log(`当前正在唤醒的设备id：${devicesId}`);
      try {
        child_process.execSync(
          `adb -s ${devicesId} shell  input swipe 540 1300 450 500 100`
        );
      } catch (error) {
        console.log(`执行滑动指令失败....`);
      }
    }
    count++;
  });
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
