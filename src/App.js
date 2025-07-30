import React, { useState, useRef, useEffect } from "react";

const DEFAULT_SENTENCES = [
  "Hello world",
  "Coding is fun!",
  "React makes UI easy",
  "小確幸從今天開始",
  "12345 67890",
  "打字遊戲加油！",
];

function App() {
  // 自訂題庫
  const [customSentences, setCustomSentences] = useState(() => {
    const data = localStorage.getItem("custom_sentences");
    return data ? JSON.parse(data) : [];
  });
  const [newSentence, setNewSentence] = useState("");
  const [showAddBar, setShowAddBar] = useState(false);
  const allSentences = [...DEFAULT_SENTENCES, ...customSentences];

  // 遊戲狀態
  const [sentence, setSentence] = useState("");
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

  // 題庫同步到 localStorage
  useEffect(() => {
    localStorage.setItem("custom_sentences", JSON.stringify(customSentences));
  }, [customSentences]);

  // 出題
  const getRandomSentence = () => {
    return allSentences[Math.floor(Math.random() * allSentences.length)];
  };

  useEffect(() => {
    setSentence(getRandomSentence());
    // eslint-disable-next-line
  }, [customSentences]);

  // 注音組字
  const handleCompositionStart = () => setComposing(true);
  const handleCompositionEnd = () => setComposing(false);

  // 鍵入判斷
  const handleChange = (e) => {
    const val = e.target.value;
    if (!composing) {
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

  // 再來一題
  const handleRestart = () => {
    setSentence(getRandomSentence());
    setInput("");
    setMistakes(0);
    setStartTime(null);
    setTime(null);
    setCompleted(false);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 200);
  };

  // 新增自訂題庫
  const handleAddSentence = () => {
    const s = newSentence.trim();
    if (!s) return;
    if (allSentences.includes(s)) return;
    setCustomSentences([...customSentences, s]);
    setNewSentence("");
    setShowAddBar(false);
  };

  // 刪除自訂題庫
  const handleDeleteSentence = (index) => {
    setCustomSentences(customSentences.filter((_, i) => i !== index));
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "60px auto",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 2px 8px #aaa",
        textAlign: "center",
      }}
    >
      <h2>趣味打字遊戲</h2>

      {/* 遊戲主體 */}
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

      {/* --- 新增題庫區塊（下方） --- */}
      <div style={{ marginTop: 36 }}>
        {!showAddBar && (
          <button onClick={() => setShowAddBar(true)}>➕ 新增題庫</button>
        )}
        {showAddBar && (
          <div style={{ marginTop: 12 }}>
            <input
              value={newSentence}
              onChange={(e) => setNewSentence(e.target.value)}
              placeholder="請輸入新句子"
              style={{ width: 280, padding: 6, fontSize: 16 }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSentence();
              }}
            />
            <button onClick={handleAddSentence} style={{ marginLeft: 8 }}>
              加入
            </button>
            <button
              onClick={() => {
                setShowAddBar(false);
                setNewSentence("");
              }}
              style={{ marginLeft: 8, color: "#888" }}
            >
              取消
            </button>
          </div>
        )}
        {/* 顯示自訂題庫列表 */}
        <div style={{ margin: "18px 0" }}>
          <b>自訂題庫：</b>
          <ul style={{ textAlign: "left", margin: "12px auto", maxWidth: 400 }}>
            {customSentences.map((s, idx) => (
              <li key={s + idx}>
                {s}
                <button
                  onClick={() => handleDeleteSentence(idx)}
                  style={{ marginLeft: 8, color: "#c00" }}
                >
                  刪除
                </button>
              </li>
            ))}
            {customSentences.length === 0 && (
              <li style={{ color: "#aaa" }}>（尚無自訂題庫）</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
