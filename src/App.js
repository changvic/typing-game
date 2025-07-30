import React, { useState, useRef } from "react";

const SENTENCES = [
  "Hello world",
  "Coding is fun!",
  "React makes UI easy",
  "小確幸從今天開始",
  "12345 67890",
  "打字遊戲加油！",
];

function getRandomSentence() {
  return SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
}

function App() {
  const [sentence, setSentence] = useState(getRandomSentence());
  const [input, setInput] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [time, setTime] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [best, setBest] = useState(
    () => localStorage.getItem("best_time") || null
  );
  const [composing, setComposing] = useState(false);

  const inputRef = useRef(null);

  // 中文注音輸入組字狀態
  const handleCompositionStart = () => setComposing(true);
  const handleCompositionEnd = () => setComposing(false);

  // 只在「非組字狀態」時才做錯誤判斷
  const handleChange = (e) => {
    const val = e.target.value;

    // 只有在不是組字狀態時才進行判斷
    if (!composing) {
      // 只檢查新輸入的那個字
      if (val.length > input.length && val.length <= sentence.length) {
        const lastIndex = val.length - 1;
        if (val[lastIndex] !== sentence[lastIndex]) {
          setMistakes((m) => m + 1);
        }
      }
    }

    setInput(val);

    if (startTime === null && val.length === 1) {
      setStartTime(Date.now());
    }
    if (val === sentence) {
      const used = Number(((Date.now() - startTime) / 1000).toFixed(2));
      setTime(used);
      setCompleted(true);
      if (!best || used < Number(best)) {
        setBest(used);
        localStorage.setItem("best_time", used);
      }
    }
  };

  const handleRestart = () => {
    setSentence(getRandomSentence());
    setInput("");
    setMistakes(0);
    setStartTime(null);
    setTime(null);
    setCompleted(false);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 200);
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "60px auto",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 2px 8px #aaa",
        textAlign: "center",
      }}
    >
      <h2>趣味打字遊戲</h2>
      <div style={{ fontSize: 20, margin: 20, color: "#333" }}>{sentence}</div>
      <input
        ref={inputRef}
        value={input}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onPaste={(e) => e.preventDefault()}
        disabled={completed}
        style={{
          width: "90%",
          fontSize: 18,
          padding: 8,
          border: input === sentence ? "2px solid green" : "2px solid #aaa",
          outline: "none",
          borderRadius: 8,
        }}
        placeholder="開始打字吧"
      />
      <div style={{ marginTop: 12, color: "#c00" }}>錯誤次數：{mistakes}</div>
      {completed && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ color: "#009966" }}>🎉 挑戰成功！</h3>
          <div>用時：{time} 秒</div>
          <div>錯誤次數：{mistakes}</div>
          {best && <div>最佳紀錄：{Number(best).toFixed(2)} 秒</div>}
          <button onClick={handleRestart} style={{ marginTop: 16 }}>
            再來一題
          </button>
        </div>
      )}
      {!completed && (
        <div style={{ marginTop: 16, color: "#666" }}>輸入正確才能過關！</div>
      )}
    </div>
  );
}

export default App;
