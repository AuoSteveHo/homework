import { input } from "@inquirer/prompts";
import { searchCoffee } from "./lib/qdrant.js"; 
import { spinner } from "./utils/spinner.js";

try {
  while (true) {
    const query = (
      await input({ message: "想喝點什麼？請輸入想搜尋的咖啡風味或關鍵字：" })
    ).trim();

    if (query === "") continue;
    if (query.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    const spin = spinner("正在為您調配搜尋結果...").start();

    const results = await searchCoffee(query, 5);
    spin.stop();

    if (results.length === 0) {
      console.log("\n找不到相關的咖啡，換個關鍵字試試看吧！");
      continue;
    }

  
    for (const [i, r] of results.entries()) {
      console.log(`\n ${i + 1}. ${r.coffee_name} (${r.english_name})`);
      console.log(`   相似度分數：${r.score.toFixed(3)}`);
      console.log(`   成分比例 ：${r.ingredients}`);
      console.log(`   風味說明 ：${r.flavor_description}`);
    }
    console.log("\n----------------------------------");
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}