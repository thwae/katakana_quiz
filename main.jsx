
import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const KATAKANA_DATA = [
  { katakana: "ア", korean: "아", hiragana: "あ" },
  { katakana: "イ", korean: "이", hiragana: "い" },
  { katakana: "ウ", korean: "우", hiragana: "う" },
  { katakana: "エ", korean: "에", hiragana: "え" },
  { katakana: "オ", korean: "오", hiragana: "お" },
  { katakana: "カ", korean: "카", hiragana: "か" },
  { katakana: "キ", korean: "키", hiragana: "き" },
  { katakana: "ク", korean: "쿠", hiragana: "く" },
  { katakana: "ケ", korean: "케", hiragana: "け" },
  { katakana: "コ", korean: "코", hiragana: "こ" },
  { katakana: "サ", korean: "사", hiragana: "さ" },
  { katakana: "シ", korean: "시", hiragana: "し" },
  { katakana: "ス", korean: "스", hiragana: "す" },
  { katakana: "セ", korean: "세", hiragana: "せ" },
  { katakana: "ソ", korean: "소", hiragana: "そ" },
  { katakana: "タ", korean: "타", hiragana: "た" },
  { katakana: "チ", korean: "치", hiragana: "ち" },
  { katakana: "ツ", korean: "츠", hiragana: "つ" },
  { katakana: "テ", korean: "테", hiragana: "て" },
  { katakana: "ト", korean: "토", hiragana: "と" },
  { katakana: "ナ", korean: "나", hiragana: "な" },
  { katakana: "ニ", korean: "니", hiragana: "に" },
  { katakana: "ヌ", korean: "누", hiragana: "ぬ" },
  { katakana: "ネ", korean: "네", hiragana: "ね" },
  { katakana: "ノ", korean: "노", hiragana: "の" },
  { katakana: "ハ", korean: "하", hiragana: "は" },
  { katakana: "ヒ", korean: "히", hiragana: "ひ" },
  { katakana: "フ", korean: "후", hiragana: "ふ" },
  { katakana: "ヘ", korean: "헤", hiragana: "へ" },
  { katakana: "ホ", korean: "호", hiragana: "ほ" },
  { katakana: "マ", korean: "마", hiragana: "ま" },
  { katakana: "ミ", korean: "미", hiragana: "み" },
  { katakana: "ム", korean: "무", hiragana: "む" },
  { katakana: "メ", korean: "메", hiragana: "め" },
  { katakana: "モ", korean: "모", hiragana: "も" },
  { katakana: "ヤ", korean: "야", hiragana: "や" },
  { katakana: "ユ", korean: "유", hiragana: "ゆ" },
  { katakana: "ヨ", korean: "요", hiragana: "よ" },
  { katakana: "ラ", korean: "라", hiragana: "ら" },
  { katakana: "リ", korean: "리", hiragana: "り" },
  { katakana: "ル", korean: "루", hiragana: "る" },
  { katakana: "レ", korean: "레", hiragana: "れ" },
  { katakana: "ロ", korean: "로", hiragana: "ろ" },
  { katakana: "ワ", korean: "와", hiragana: "わ" },
  { katakana: "ヲ", korean: "오", hiragana: "を" },
  { katakana: "ン", korean: "응", hiragana: "ん" },
];

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getAnswerValue(item, mode) {
  return mode === "korean" ? item.korean : item.hiragana;
}

function buildQuizOptions(current, mode) {
  const correct = getAnswerValue(current, mode);
  const pool = KATAKANA_DATA
    .filter((entry) => entry.katakana !== current.katakana)
    .map((entry) => getAnswerValue(entry, mode))
    .filter((value, index, arr) => arr.indexOf(value) === index && value !== correct);

  const similar = pool.filter((value) => {
    if (mode === "korean") return value[0] === correct[0] || value.length === correct.length;
    return true;
  });

  const source = similar.length >= 3 ? similar : pool;
  const distractors = shuffleArray(source).slice(0, 3);
  return shuffleArray([correct, ...distractors]);
}

function speakSlowJapanese(text) {
  if (!("speechSynthesis" in window)) {
    alert("이 브라우저는 음성 재생을 지원하지 않습니다.");
    return;
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const play = () => {
    const voices = synth.getVoices();
    const japaneseVoice =
      voices.find((voice) => voice.lang === "ja-JP") ||
      voices.find((voice) => voice.lang && voice.lang.startsWith("ja")) ||
      null;

    const createUtterance = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.55;
      utterance.pitch = 1;
      utterance.volume = 1;
      if (japaneseVoice) utterance.voice = japaneseVoice;
      return utterance;
    };

    const first = createUtterance();
    const second = createUtterance();

    first.onend = () => {
      setTimeout(() => synth.speak(second), 400);
    };

    synth.speak(first);
  };

  const voices = synth.getVoices();
  if (voices.length === 0) {
    synth.onvoiceschanged = play;
  } else {
    play();
  }
}

function App() {
  const [stage, setStage] = useState("nickname");
  const [nicknameInput, setNicknameInput] = useState("");
  const [nickname, setNickname] = useState("");
  const [studyMode, setStudyMode] = useState(null);
  const [quizItems, setQuizItems] = useState(KATAKANA_DATA);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [answerState, setAnswerState] = useState("idle");
  const [records, setRecords] = useState([]);
  const [reviewItems, setReviewItems] = useState([]);

  const currentItem = quizItems[currentIndex];
  const totalCount = quizItems.length;
  const solvedCount = currentIndex;
  const correctCount = records.filter((record) => record.correct).length;
  const wrongRecords = records.filter((record) => !record.correct);

  const options = useMemo(() => {
    if (!currentItem || !studyMode) return [];
    return buildQuizOptions(currentItem, studyMode);
  }, [currentItem, studyMode, currentIndex]);

  const correctAnswer = currentItem && studyMode ? getAnswerValue(currentItem, studyMode) : "";

  const handleNicknameConfirm = () => {
    const trimmed = nicknameInput.trim();
    if (!trimmed) return;
    setNickname(trimmed);
    setStage("mode");
  };

  const startMode = (mode) => {
    setStudyMode(mode);
    setStage("count");
  };

  const startQuiz = (count) => {
    setQuizItems(shuffleArray(KATAKANA_DATA).slice(0, Math.min(count, KATAKANA_DATA.length)));
    setCurrentIndex(0);
    setSelectedChoice(null);
    setAnswerState("idle");
    setRecords([]);
    setReviewItems([]);
    setStage("quiz");
  };

  const handleChoice = (choice) => {
    if (!currentItem || !studyMode || answerState !== "idle") return;

    const isCorrect = choice === correctAnswer;
    setSelectedChoice(choice);
    setAnswerState(isCorrect ? "correct" : "wrong");
    setRecords((prev) => [
      ...prev,
      {
        item: currentItem,
        chosen: choice,
        correct: isCorrect,
        correctAnswer,
        mode: studyMode,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= quizItems.length) {
      setStage("result");
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedChoice(null);
    setAnswerState("idle");
  };

  const resetToMode = () => {
    setStage("mode");
    setStudyMode(null);
    setQuizItems(KATAKANA_DATA);
    setCurrentIndex(0);
    setSelectedChoice(null);
    setAnswerState("idle");
    setRecords([]);
    setReviewItems([]);
  };

  const retryWrongOnly = () => {
    const wrongOnlyItems = wrongRecords.map((record) => record.item);
    if (!wrongOnlyItems.length) return;
    setQuizItems(shuffleArray(wrongOnlyItems));
    setCurrentIndex(0);
    setSelectedChoice(null);
    setAnswerState("idle");
    setRecords([]);
    setStage("quiz");
  };

  const openReview = () => {
    setReviewItems(wrongRecords);
    setStage("review");
  };

  return (
    <main className="app">
      <div className="pattern" />
      <div className="banana banana1">🍌</div>
      <div className="banana banana2">🍌</div>
      <div className="banana banana3">🍌</div>
      <div className="banana banana4">🍌</div>

      <section className="shell">
        {stage === "nickname" && (
          <div className="card pink">
            <div className="cardHeader">
              <p className="label">KATAKANA QUIZ</p>
              <h1>닉네임을 입력하세요.</h1>
            </div>
            <div className="cardBody">
              <div className="formBox">
                <input
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNicknameConfirm()}
                  placeholder="예: 하루"
                  className="nicknameInput"
                />
                <button onClick={handleNicknameConfirm} className="mainButton pinkButton">
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === "mode" && (
          <div className="card yellow">
            <div className="cardHeader">
              <p className="label">PRESS START</p>
              <h2>자, 가타카나 학습을 시작해 볼까요?</h2>
            </div>
            <div className="cardBody">
              <div className="buttonGrid single">
                <button onClick={() => startMode("korean")} className="bigButton pinkButton">
                  한국어로 학습하기
                </button>
                <button onClick={() => startMode("hiragana")} className="bigButton orangeButton">
                  히라가나로 학습하기
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === "count" && (
          <div className="card orange">
            <div className="cardHeader">
              <p className="label">QUIZ COUNT</p>
              <h2>몇 개의 퀴즈를 풀어볼까요?</h2>
            </div>
            <div className="cardBody">
              <div className="buttonGrid">
                {[
                  { value: 10, label: "10개" },
                  { value: 20, label: "20개" },
                  { value: 30, label: "30개" },
                  { value: 40, label: "40개" },
                  { value: 50, label: "46개(전체)" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => startQuiz(option.value)}
                    className="bigButton orangeButton"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {stage === "quiz" && currentItem && (
          <div className="card blue">
            <div className="quizTop">
              <span className="pill">{solvedCount}/{totalCount}</span>
              <div className="progressOuter">
                <div
                  className="progressInner"
                  style={{ width: `${(solvedCount / totalCount) * 100}%` }}
                />
              </div>
              <span className="pill yellowPill">
                {studyMode === "korean" ? "한국어 모드" : "히라가나 모드"}
              </span>
            </div>

            <div className="cardBody">
              <div className="kanaArea">
                <div className="kanaBox">{currentItem.katakana}</div>
                {studyMode === "hiragana" && (
                  <button
                    className="soundButton"
                    onClick={() => speakSlowJapanese(currentItem.hiragana)}
                  >
                    발음 듣기
                  </button>
                )}
              </div>

              <div className="choices">
                {options.map((choice) => {
                  const isSelected = selectedChoice === choice;
                  const isCorrectChoice = choice === correctAnswer;
                  let className = "choice";

                  if (answerState !== "idle") {
                    if (isCorrectChoice) className += " correct";
                    else if (isSelected && !isCorrectChoice) className += " wrong";
                    else className += " muted";
                  }

                  return (
                    <button
                      key={choice}
                      disabled={answerState !== "idle"}
                      onClick={() => handleChoice(choice)}
                      className={className}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>

              <div className="messageArea">
                {answerState === "correct" && <div className="message correctMsg">맞았습니다!</div>}
                {answerState === "wrong" && <div className="message wrongMsg">틀렸습니다.</div>}
              </div>

              <button
                onClick={handleNext}
                disabled={answerState === "idle"}
                className="mainButton blueButton nextButton"
              >
                다음 문제로
              </button>
            </div>
          </div>
        )}

        {stage === "result" && (
          <div className="card green">
            <div className="cardHeader">
              <p className="label">RESULT</p>
              <h2 className="resultTitle">
                {nickname} 님,<br />
                {correctCount}문제 맞추고 {wrongRecords.length}문제 틀렸습니다.
              </h2>
            </div>
            <div className="cardBody">
              <div className="scoreGrid">
                <div className="scoreBox correctScore">
                  <p>맞은 개수</p>
                  <strong>{correctCount}</strong>
                </div>
                <div className="scoreBox wrongScore">
                  <p>틀린 개수</p>
                  <strong>{wrongRecords.length}</strong>
                </div>
              </div>

              <div className="buttonGrid single">
                <button onClick={resetToMode} className="bigButton pinkButton">
                  전체 다시 풀기
                </button>
                <button
                  onClick={retryWrongOnly}
                  disabled={!wrongRecords.length}
                  className="bigButton orangeButton"
                >
                  틀린 문제만 다시 풀기
                </button>
                <button
                  onClick={openReview}
                  disabled={!wrongRecords.length}
                  className="bigButton blueButton"
                >
                  틀린 문제 복습하기
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === "review" && (
          <div className="card purple">
            <div className="cardHeader">
              <p className="label">WRONG NOTE</p>
              <h2>틀린 문제 복습하기</h2>
            </div>
            <div className="cardBody">
              <div className="reviewList">
                {reviewItems.map((record, index) => (
                  <div key={`${record.item.katakana}-${index}`} className="reviewItem">
                    <div className="reviewKana">{record.item.katakana}</div>
                    <div>
                      <p className="smallLabel">내가 고른 답</p>
                      <strong className="wrongText">{record.chosen}</strong>
                    </div>
                    <div>
                      <p className="smallLabel">정답</p>
                      <strong className="correctText">{record.correctAnswer}</strong>
                      <p className="subText">히라가나: {record.item.hiragana} · 한글: {record.item.korean}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="buttonGrid">
                <button onClick={() => setStage("result")} className="bigButton darkButton">
                  결과 화면으로
                </button>
                <button onClick={retryWrongOnly} className="bigButton purpleButton">
                  틀린 문제 다시 풀기
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
