const child_process = require("child_process");
const readline = require("readline");
const stream = require("stream");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
var qs = require("qs");
var images = require("images");

const imgDir = path.join(__dirname, "image");
const api_key = "5Fh54qOs0PnDvt_m2CEcBOdzopYQ9q0Z";
const api_secret = "j_4B3doAlXij3Ciu7Rlu3Kg5vFV2_Kah";

var index = 0;

function autoAdb() {
  console.log(`自动滑动第${++index}`);

  var cmdStr = child_process.execSync(`adb devices`);

  var bufferStream = new stream.PassThrough();
  bufferStream.end(cmdStr);

  var rl = readline.createInterface({ input: bufferStream });

  var count = 0;

  rl.on("line", (line) => {
    if (count > 0) {
      var lineArr = line.split("\t");
      var devicesId = lineArr[0].trim();
      if (devicesId.length > 0) {
        console.log(`当前正在唤醒的设备id：${devicesId}`);
        try {
          child_process.execSync(
            `adb -s ${devicesId} shell input tap 500 800 `
          );

          let imgName = `${devicesId}-${new Date().getTime()}.png`;
          console.log(`imgName:${imgName}`);
          child_process.execSync(
            `adb -s ${devicesId} shell screencap -p /sdcard/${imgName}`
          );

          child_process.execSync(
            `adb -s ${devicesId} shell input tap 500 800 `
          );

          let localImgName = path.join(imgDir, imgName);
          console.log(`保存在本地的图片 ${localImgName}`);
          child_process.execSync(
            `adb  -s ${devicesId} pull /sdcard/${imgName} ${localImgName} `
          );

          child_process.execSync(
            `adb  -s ${devicesId} shell rm -rf /sdcard/${imgName}`
          );
          recognitionImage(devicesId, localImgName);
        } catch (error) {
          console.error(`截屏失败....`);
        }
      }
    }
    count++;
  });
}

async function loop() {
  if (!fs.existsSync(imgDir)) {
    console.log(`======存放图片目录不存在，创建目录：${imgDir}=======`);
    fs.mkdirSync(imgDir);
  }

  //  recognitionImage(path.join(imgDir, "timg.jpg"));
  autoAdb();
  // while (true) {
  //   autoAdb();
  // }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
let isCheck = false;
/**
 * 本地图片上传到face++做识别
 * @param {*} imgPath
 */
async function recognitionImage(devicesId, imgPath) {
  console.log(`当前正在识别的图片路径${imgPath}`);
  let isGoodScore = false;
  try {
    // 压缩图片
    // images(imgPath).size(720).save(imgPath);
    let bitmap = images(imgPath).size(720).encode("png");
    console.log(`图片大小:${bitmap.length / 1024}kb`);
    let base64str = Buffer.from(bitmap, "binary").toString("base64"); // base64编码
    let url = "https://api-cn.faceplusplus.com/facepp/v3/detect";

    let { data } = await axios({
      method: "post",
      url: url,
      data: qs.stringify({
        api_key: api_key,
        api_secret: api_secret,
        return_attributes: "gender,beauty",
        image_base64: base64str,
      }),
    });

    let { faces } = data;
    if (faces.length > 0) {
      faces.forEach((element) => {
        let { face_token, attributes } = element;
        let { gender, beauty } = attributes;
        if (gender === undefined) {
          fs.unlinkSync(localImgName);
          console.log(`未检测到性别${localImgName}`);
        } else {
          console.log(`检测到性别：${gender}`);
          let { value } = gender;
          let { male_score, female_score } = beauty;
          console.log(
            `性别:${value} 男性评分:${male_score} 女性评分:${female_score}`
          );
          if (value === "Female") {
            if (male_score >= 75 && female_score >= 70) {
              console.log(`关注这个妹子.......`);
              if (!isGoodScore) {
                child_process.execSync(
                  `adb -s ${devicesId} shell input tap 1000 1300 `
                );
              }
              isGoodScore = true;
            } else {
              console.log(`妹子评分不够-------`);
              if (!isGoodScore) {
                isGoodScore = false;
              }
            }
          } else {
            console.log(`男，删除--------------------`);
          }
        }
      });
      if (!isGoodScore) {
        console.log(`评分不够，删除---------`);
      }
    } else {
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
      if (isCheck) {
        console.log(`执行第二次任务，未识别人脸，滑动到下一个视频`);
      } else {
        console.log(`未匹配到人脸,重新在执行一次任务`);
        await sleep(1000);
        autoAdb();
        isCheck = true;
        return;
      }
    }
  } catch (e) {
    console.log(`====${e}====`);
  }
  console.log(`===========isCheck:${isCheck}==============`);
  isCheck = false;
  if (isGoodScore) {
    await sleep(1000);
  } else {
    if (fs.existsSync(imgPath)) {
      try {
        fs.unlinkSync(imgPath);
      } catch (e) {
        console.error(e);
      }
    }
  }

  child_process.execSync(
    `adb -s ${devicesId} shell  input swipe 540 1300 450 500 100`
  );
  var time = getRandomIntInclusive(1000, 2500);
  console.log(`休息一会哦：${time}`);
  await sleep(isGoodScore ? time : 100);
  console.log(`休息结束，起床干活了......`);
  autoAdb();
}

loop();
