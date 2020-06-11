async function test() {
  while (true) {
    console.log("Hello");
    var time = getRandomIntInclusive(1000, 5000);
    console.log(`休息一会哦：${time}`)
    await sleep(time);
    console.log(`休息结束，起床干活了......`)
    console.log("world!");
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

test();
