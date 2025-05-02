let questions = []; // 問題データを格納する配列
let currentQuestionIndex = 0; // 現在の問題のインデックス

/**
 * DOM要素のキャッシュ
 * - 頻繁にアクセスする要素は変数に格納して、パフォーマンスを向上させる
 */
const quizForm = document.getElementById('quiz-form');
const radioQuestionContainer = document.getElementById('radio-question-container');
const radioQuestionTextElement = document.getElementById('radio-question-text');
const radioOptionsContainer = document.getElementById('radio-options-container');
const radioFeedback = document.getElementById('radio-feedback');
const checkboxQuestionContainer = document.getElementById('checkbox-question-container');
const checkboxQuestionTextElement = document.getElementById('checkbox-question-text');
const checkboxOptionsContainer = document.getElementById('checkbox-options-container');
const checkboxFeedback = document.getElementById('checkbox-feedback');
const submitButton = document.getElementById('submit-button');
const resultContainer = document.getElementById('result-container');
const resultTextElement = document.getElementById('result-text');
const nextButton = document.getElementById('next-button');
let userAnswers = {}; // ユーザーの回答を保存するオブジェクト

/**
 * 質問タイプを定数で管理
 */
const QUESTION_TYPE = {
    RADIO: 'radio',
    CHECKBOX: 'checkbox',
    // FILL_IN: 'fill-in' // もし穴埋め問題を追加するならこれも必要
};

/**
 * 質問を表示する関数
 * @param {number} index - 表示する質問のインデックス
 */
function loadQuestion(index) {
    const currentQuestion = questions[index];
    hideAllQuestionContainers(); // すべての質問コンテナを非表示にする
    resultContainer.style.display = 'none'; // 結果表示も非表示にする
    submitButton.style.display = 'block'; // 解答ボタンを表示
    clearFeedbackMessages(); // フィードバックメッセージをクリア

    switch (currentQuestion.type) {
        case QUESTION_TYPE.RADIO:
            loadRadioQuestion(index);
            break;
        case QUESTION_TYPE.CHECKBOX:
            loadCheckboxQuestion(index);
            break;
        // case QUESTION_TYPE.FILL_IN: // もし穴埋め問題を追加するなら
        //     loadFillInQuestion(index);
        //     break;
        default:
            console.error('不明な質問タイプです:', currentQuestion.type); // エラーハンドリング
            // 不明なタイプの場合、エラーメッセージを表示するなどユーザーへの通知を追加検討
    }
}

/**
 * ラジオボタン形式の質問を表示する関数
 * @param {number} index - 表示する質問のインデックス
 */
function loadRadioQuestion(index) {
    const currentQuestion = questions[index];
    // 選択肢の配列をシャッフル（元の配列を直接変更しないようにコピーしてから）
    const options = shuffleArray([...currentQuestion.options]);
    // 質問テキストをinnerHTMLで設定し、HTMLタグを解釈させる
    radioQuestionTextElement.innerHTML = currentQuestion.question; // ★修正箇所★
    radioOptionsContainer.innerHTML = ''; // 選択肢をクリア

    options.forEach((option, i) => {
        const radioOption = document.createElement('div');
        radioOption.className = 'radio-option';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'radio-option'; // 同じname属性でグループ化
        input.value = option;
        input.id = `radio-option-${i}`; // 各選択肢にユニークなIDを設定
        const label = document.createElement('label');
        label.textContent = option; // 選択肢のテキストはtextContentでOK
        label.htmlFor = `radio-option-${i}`; // labelとinputを関連付け
        radioOption.appendChild(input);
        radioOption.appendChild(label);
        radioOptionsContainer.appendChild(radioOption);
    });

    radioQuestionContainer.style.display = 'block'; // ラジオボタンコンテナを表示

    // 以前の回答を復元
    if (userAnswers[index] !== undefined) {
        // userAnswers[index] はラジオボタンの場合は単一の値
        const selectedOption = document.querySelector(`input[type="radio"][value="${userAnswers[index]}"]`);
        if (selectedOption) {
            selectedOption.checked = true;
        }
    }
}

/**
 * チェックボックス形式の質問を表示する関数
 * @param {number} index - 表示する質問のインデックス
 */
function loadCheckboxQuestion(index) {
    const currentQuestion = questions[index];
    // 選択肢の配列をシャッフル（元の配列を直接変更しないようにコピーしてから）
    const options = shuffleArray([...currentQuestion.options]);
     // 質問テキストをinnerHTMLで設定し、HTMLタグを解釈させる
    checkboxQuestionTextElement.innerHTML = currentQuestion.question; // ★修正箇所★
    checkboxOptionsContainer.innerHTML = ''; // 選択肢をクリア

    options.forEach((option, i) => {
        const checkboxOption = document.createElement('div');
        checkboxOption.className = 'checkbox-option';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'checkbox-option'; // チェックボックスは同じnameでも複数選択可能
        input.value = option;
        input.id = `checkbox-option-${i}`; // 各選択肢にユニークなIDを設定
        const label = document.createElement('label');
        label.textContent = option; // 選択肢のテキストはtextContentでOK
        label.htmlFor = `checkbox-option-${i}`; // labelとinputを関連付け
        checkboxOption.appendChild(input);
        checkboxOption.appendChild(label);
        checkboxOptionsContainer.appendChild(checkboxOption);
    });

    checkboxQuestionContainer.style.display = 'block'; // チェックボックスコンテナを表示

    // 以前の回答を復元
    if (userAnswers[index] !== undefined) {
        // userAnswers[index] はチェックボックスの場合は配列
        userAnswers[index].forEach(answer => {
            const selectedCheckbox = document.querySelector(`input[type="checkbox"][value="${answer}"]`);
            if (selectedCheckbox) {
                selectedCheckbox.checked = true;
            }
        });
    }
}

/**
 * 解答をチェックする関数
 */
function checkAnswer() {
    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false; // 正解かどうかを判定する変数
    let feedbackMessage = ''; // フィードバックメッセージ

    switch (currentQuestion.type) {
        case QUESTION_TYPE.RADIO:
            const selectedRadioOption = document.querySelector('input[name="radio-option"]:checked');
            if (selectedRadioOption) {
                userAnswers[currentQuestionIndex] = selectedRadioOption.value; // ユーザーの回答を保存
                isCorrect = selectedRadioOption.value === currentQuestion.answer;
                feedbackMessage = isCorrect ? '正解！' : `不正解。正解は「${getCorrectAnswerText(currentQuestion)}」です。`;
                radioFeedback.textContent = feedbackMessage; // フィードバックを表示
            } else {
                feedbackMessage = '解答を選択してください。';
                radioFeedback.textContent = feedbackMessage; // フィードバックを表示
                return; // 解答がない場合はここで処理を終了
            }
            break;
        case QUESTION_TYPE.CHECKBOX:
            const selectedCheckboxOptions = Array.from(document.querySelectorAll('input[name="checkbox-option"]:checked'))
                .map(checkbox => checkbox.value);
            userAnswers[currentQuestionIndex] = selectedCheckboxOptions; // ユーザーの回答を保存
            const correctAnswer = currentQuestion.answer; // 正解の配列
            // 選択された数と内容が完全に一致するかを判定
            isCorrect = selectedCheckboxOptions.length === correctAnswer.length &&
                selectedCheckboxOptions.every(option => correctAnswer.includes(option));
            feedbackMessage = isCorrect ? '正解！' : `不正解。正解は「${getCorrectAnswerText(currentQuestion)}」です。`;
            checkboxFeedback.textContent = feedbackMessage; // フィードバックを表示
            break;
        // case QUESTION_TYPE.FILL_IN: // もし穴埋め問題を追加するなら
        //     const fillInInput = document.getElementById('fill-in-answer-input');
        //     const userAnswer = fillInInput.value.trim(); // 前後の空白を除去
        //     userAnswers[currentQuestionIndex] = userAnswer; // ユーザーの回答を保存
        //     isCorrect = userAnswer === currentQuestion.answer;
        //     feedbackMessage = isCorrect ? '正解！' : `不正解。正解は「${currentQuestion.answer}」です。`;
        //     document.getElementById('fill-in-feedback').textContent = feedbackMessage; // フィードバックを表示
        //     break;
        default:
            console.error('不明な質問タイプです:', currentQuestion.type); // エラーハンドリング
            feedbackMessage = '質問タイプの判定に問題が発生しました。';
            // 適切なフィードバック要素にメッセージを表示することを検討
            return;
    }

    // 結果表示コンテナの制御
    if (isCorrect) {
        resultTextElement.textContent = '正解！';
    } else {
         resultTextElement.textContent = `不正解。正解は「${getCorrectAnswerText(currentQuestion)}」です。`;
    }

    submitButton.style.display = 'none'; // 解答ボタンを非表示
    resultContainer.style.display = 'block'; // 結果表示コンテナを表示
}

/**
 * 次の問題へ進む関数
 */
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion(currentQuestionIndex); // 次の問題をロード
    } else {
        // 全問終了後の処理
        const percentage = calculatePercentage(); // 正解率を計算
        resultTextElement.textContent = `全問終了！あなたの正解率は${percentage.toFixed(2)}%です。`;
        resultContainer.style.display = 'block'; // 結果表示を維持
        hideAllQuestionContainers(); // 問題コンテナを非表示
        nextButton.style.display = 'none'; // 次へボタンを非表示
        submitButton.style.display = 'none'; // 解答ボタンも非表示に
    }
}

/**
 * 正解のテキストを取得する関数
 * @param {object} question - 質問オブジェクト
 * @returns {string} - 正解のテキスト
 */
function getCorrectAnswerText(question) {
    switch (question.type) {
        case QUESTION_TYPE.RADIO:
            return question.answer; // ラジオボタンの正解は単一の値
        case QUESTION_TYPE.CHECKBOX:
            return question.answer.join(', '); // チェックボックスの正解は配列をカンマ区切り文字列に
        // case QUESTION_TYPE.FILL_IN: // もし穴埋め問題を追加するなら
        //     return question.answer;
        default:
            return ''; // 不明なタイプの場合は空文字列
    }
}

/**
 * 正解率を計算する関数
 * @returns {number} - 正解率 (0から100)
 */
function calculatePercentage() {
    let correctCount = 0;
    questions.forEach((question, index) => {
        // ユーザーが回答している問題のみを対象とする
        if (userAnswers[index] !== undefined) {
            switch (question.type) {
                case QUESTION_TYPE.RADIO:
                    if (userAnswers[index] === question.answer) {
                        correctCount++;
                    }
                    break;
                case QUESTION_TYPE.CHECKBOX:
                    const selectedOptions = userAnswers[index]; // ユーザーの回答 (配列)
                    const correctAnswer = question.answer; // 正解 (配列)
                    // 選択された数と内容が完全に一致する場合に正解
                    if (selectedOptions.length === correctAnswer.length &&
                        selectedOptions.every(option => correctAnswer.includes(option))) {
                        correctCount++;
                    }
                    break;
                // case QUESTION_TYPE.FILL_IN: // もし穴埋め問題を追加するなら
                //     if (userAnswers[index] === question.answer) {
                //         correctCount++;
                //     }
                //     break;
            }
        }
    });
     // 問題数が0の場合は正解率も0とする（エラー回避）
    if (questions.length === 0) {
        return 0;
    }
    return (correctCount / questions.length) * 100;
}

/**
 * すべての質問コンテナを非表示にする関数
 */
function hideAllQuestionContainers() {
    radioQuestionContainer.style.display = 'none';
    checkboxQuestionContainer.style.display = 'none';
    // if (document.getElementById('fill-in-question-container')) { // もし穴埋め問題を追加するなら
    //     document.getElementById('fill-in-question-container').style.display = 'none';
    // }
}

/**
 * フィードバックメッセージをクリアする関数
 */
function clearFeedbackMessages() {
    radioFeedback.textContent = '';
    checkboxFeedback.textContent = '';
    // if (document.getElementById('fill-in-feedback')) { // もし穴埋め問題を追加するなら
    //     document.getElementById('fill-in-feedback').textContent = '';
    // }
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
    submitButton.addEventListener('click', checkAnswer); // 解答ボタンにイベントリスナーを設定
    nextButton.addEventListener('click', nextQuestion); // 次へボタンにイベントリスナーを設定
}

/**
 * 初期化関数
 * - ページのロードが完了したときに実行される
 * - イベントリスナーを設定し、questions.jsonを読み込む
 */
function init() {
    setupEventListeners(); // イベントリスナーを設定
    // questions.json ファイルをフェッチして問題データを取得
    fetch('questions.json')
        .then(response => {
            // レスポンスが正常かどうかを確認
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // JSONとしてパース
        })
        .then(data => {
            questions = data; // 取得したデータをquestions配列に格納
            // 問題をランダムに並び替える
            questions = shuffleArray(questions);
            if (questions.length > 0) {
                loadQuestion(currentQuestionIndex); // 最初の問題をロード
            } else {
                // 問題データが空の場合の処理
                const errorElement = document.createElement('p');
                errorElement.textContent = '問題データがありません。questions.jsonファイルを確認してください。';
                quizForm.appendChild(errorElement);
                 submitButton.style.display = 'none'; // 問題がないのでボタンを非表示
            }
        })
        .catch(error => {
            // データ読み込み失敗時のエラーハンドリング
            console.error('問題データの読み込みに失敗しました:', error);
            const errorElement = document.createElement('p');
            errorElement.textContent = `問題データの読み込みに失敗しました。エラー: ${error.message}`;
            quizForm.appendChild(errorElement);
            submitButton.style.display = 'none'; // 問題が読み込めないのでボタンを非表示
        });
}

/**
 * 配列をシャッフルする関数 (Fisher-Yates (aka Knuth) Shuffle)
 * @param {Array} array - シャッフルする配列
 * @returns {Array} - シャッフルされた新しい配列 (元の配列は変更しないようにコピーを渡すことを推奨)
 */
function shuffleArray(array) {
    // 配列のコピーを作成して元の配列を変更しないようにする
    const shuffledArray = [...array];
    let currentIndex = shuffledArray.length;
    let randomIndex;

    // まだシャッフルされていない要素がある間繰り返す
    while (currentIndex != 0) {
        // 残っている要素からランダムなインデックスを選ぶ
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // 現在の要素とランダムに選んだ要素を交換する
        [shuffledArray[currentIndex], shuffledArray[randomIndex]] = [
            shuffledArray[randomIndex], shuffledArray[currentIndex]];
    }
    return shuffledArray; // シャッフルされた配列を返す
}


// ページのロードが完了したら初期化処理を実行
window.onload = init;
