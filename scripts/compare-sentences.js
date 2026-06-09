import { client } from "../lib/openai.js";
import { EMBEDDING_MODEL } from "../lib/qdrant.js";
import readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// 🧮 核心演算法：計算兩個向量的內積
function cosineSimilarity(vecA, vecB) {
  return vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
}

// 🌐 呼叫 OpenAI API 取得文字的向量
async function getEmbedding(text) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}

async function main() {
  console.log("=== 🤖 歡迎使用【三句文字】語意相似度交叉比對工具 ===\n");

  try {
    // 1. 讓使用者輸入三個句子
    const s1 = await askQuestion("請輸入第一個句子 (A)：");
    const s2 = await askQuestion("請輸入第二個句子 (B)：");
    const s3 = await askQuestion("請輸入第三個句子 (C)：");

    if (!s1.trim() || !s2.trim() || !s3.trim()) {
      console.log("❌ 任何一個句子都不能為空，程式結束。");
      rl.close();
      return;
    }

    console.log("\n---------------------------------------------------");
    console.log("🔄 正在平行計算三組句子的向量庫...");

    // 2. 同時轉換三個句子的向量（使用 Promise.all 速度更快）
    const [vecA, vecB, vecC] = await Promise.all([
      getEmbedding(s1),
      getEmbedding(s2),
      getEmbedding(s3),
    ]);

    // 3. 兩兩計算相似度
    const scoreAB = cosineSimilarity(vecA, vecB);
    const scoreBC = cosineSimilarity(vecB, vecC);
    const scoreAC = cosineSimilarity(vecA, vecC);

    // 4. 以表格化（Matrix）與清單方式呈現結果
    console.log("\n📊 【交叉比對結果清單】");
    console.log(`• 句子 (A) vs (B) 相似度: ${scoreAB.toFixed(4)}`);
    console.log(`• 句子 (B) vs (C) 相似度: ${scoreBC.toFixed(4)}`);
    console.log(`• 句子 (A) vs (C) 相似度: ${scoreAC.toFixed(4)}`);

    console.log("\n📐 【相似度對照矩陣圖】");
    console.table([
      { "交叉比對": "句子 (A)", "句子 (A)": "1.0000", "句子 (B)": scoreAB.toFixed(4), "句子 (C)": scoreAC.toFixed(4) },
      { "交叉比對": "句子 (B)", "句子 (A)": scoreAB.toFixed(4), "句子 (B)": "1.0000", "句子 (C)": scoreBC.toFixed(4) },
      { "交叉比對": "句子 (C)", "句子 (A)": scoreAC.toFixed(4), "句子 (B)": scoreBC.toFixed(4), "句子 (C)": "1.0000" }
    ]);

    // 5. 找出最接近的一組
    const maxScore = Math.max(scoreAB, scoreBC, scoreAC);
    let bestMatch = "";
    if (maxScore === scoreAB) bestMatch = "(A) 與 (B)";
    else if (maxScore === scoreBC) bestMatch = "(B) 與 (C)";
    else bestMatch = "(A) 與 (C)";

    console.log(`\n💡 綜合分析：在這三個句子中，語意最接近的是 ${bestMatch}，分數達 ${maxScore.toFixed(4)}。`);

  } catch (error) {
    console.error("\n❌ 計算過程中出現錯誤:", error.message);
  } finally {
    rl.close();
    console.log("\n感謝使用，再會！");
  }
}

main();