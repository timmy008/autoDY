import axios, { AxiosResponse } from "axios";
import fs from "fs";
import path from "path";
const girlDir = path.join(__dirname, "girl");

interface PageList<T> {
  page?: number;
  data?: T[];
  page_count?: number;
  status?: number;
  total_counts?: number;
}

interface girlInfo {
  _id: string;
  author: string;
  category: string;
  createdAt: string;
  desc: string;
  images: string[];
  likeCounts: number;
  publishedAt: string;
  stars: number;
  title: string;
  type: string;
  url: string;
  views: number;
}

async function run() {
  if (!fs.existsSync(girlDir)) {
    console.log(`======存放图片目录不存在，创建目录：${girlDir}=======`);
    fs.mkdirSync(girlDir);
  }
  let page = 1;
  let flag = true;
  while (flag) {
    console.log(`page ===========${page}`)
    let { data } = await axios.get<PageList<girlInfo>>(
      `https://gank.io/api/v2/data/category/Girl/type/Girl/page/${page}/count/10`
    );
    console.log(data.data)
    if (data.data?.length===0) {
      flag = false;
     return
    }
    data.data?.map((item: girlInfo) => {
      let { images, _id } = item;
      console.log(images);
      images.map((imgUrl: string) => {
        console.log(`当前需要下载的图片地址:${imgUrl}`);
        let last = imgUrl.lastIndexOf("/");
        let imgName = imgUrl.substr(last + 1, imgUrl.length - 1);
        console.log(imgName);
        let girlLocalPath = path.join(girlDir, `${imgName}.jpg`);
        console.log(girlLocalPath);
        downloadImg(imgUrl, girlLocalPath);
      });
    });
    page++;
  }
}

async function downloadImg(imgUrl: string, imgLocalPath: string) {
  let writer = fs.createWriteStream(imgLocalPath);
  let response = await axios({
    url: imgUrl,
    method: "GET",
    responseType: "stream",
  });
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

run();
