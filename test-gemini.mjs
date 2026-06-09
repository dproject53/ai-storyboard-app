import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCXPlFMutP9bU_osDmVYMsC090FT2SpSf8");

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("hello");
    console.log(result.response.text());
  } catch (e) {
    console.error("1.5-flash Error:", e.message);
  }
}
run();
