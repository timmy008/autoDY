const path = require("path");
const child_process = require("child_process");

async function test() {
  const fileName = (Math.random() + "").substr(2, 7) + ".png";
  await adb.screenshot(fileName, path.resolve(__dirname, "images"));
  const file = path.resolve(path.resolve(__dirname, "images", fileName));
  console.log(file);
}

test();

//adb  shell screencap -p  /sdcard/test1111111.png
//adb pull /sdcard/test1111111.png aaaa.png
//adb shell rm -rf /sdcard/test1111111.png
//adb shell input tap 1000 1300 && adb shell input tap 1000 1200
