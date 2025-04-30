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
        default:
            console.error('不明な質問タイプです:', currentQuestion.type); // エラーハンドリング
    }
}

/**
 * ラジオボタン形式の質問を表示する関数
 * @param {number} index - 表示する質問のインデックス
 */
function loadRadioQuestion(index) {
    const currentQuestion = questions[index];
    radioQuestionTextElement.textContent = currentQuestion.question;
    radioOptionsContainer.innerHTML = ''; // 選択肢をクリア

    currentQuestion.options.forEach((option, i) => {
        const radioOption = document.createElement('div');
        radioOption.className = 'radio-option';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'radio-option';
        input.value = option;
        input.id = `radio-option-${i}`;
        const label = document.createElement('label');
        label.textContent = option;
        label.htmlFor = `radio-option-${i}`;
        radioOption.appendChild(input);
        radioOption.appendChild(label);
        radioOptionsContainer.appendChild(radioOption);
    });

    radioQuestionContainer.style.display = 'block';

    // 以前の回答を復元
    if (userAnswers[index] !== undefined) {
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
    checkboxQuestionTextElement.textContent = currentQuestion.question;
    checkboxOptionsContainer.innerHTML = ''; // 選択肢をクリア

    currentQuestion.options.forEach((option, i) => {
        const checkboxOption = document.createElement('div');
        checkboxOption.className = 'checkbox-option';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'checkbox-option';
        input.value = option;
        input.id = `checkbox-option-${i}`;
        const label = document.createElement('label');
        label.textContent = option;
        label.htmlFor = `checkbox-option-${i}`;
        checkboxOption.appendChild(input);
        checkboxOption.appendChild(label);
        checkboxOptionsContainer.appendChild(checkboxOption);
    });

    checkboxQuestionContainer.style.display = 'block';

    // 以前の回答を復元
    if (userAnswers[index] !== undefined) {
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

    switch (currentQuestion.type) {
        case QUESTION_TYPE.RADIO:
            const selectedOption = document.querySelector('input[name="radio-option"]:checked');
            if (selectedOption) {
                userAnswers[currentQuestionIndex] = selectedOption.value;
                isCorrect = selectedOption.value === currentQuestion.answer;
            } else {
                resultTextElement.textContent = '解答を選択してください。';
                return; // 解答がない場合はここで処理を終了
            }
            break;
        case QUESTION_TYPE.CHECKBOX:
            const selectedOptions = Array.from(document.querySelectorAll('input[name="checkbox-option"]:checked'))
                .map(checkbox => checkbox.value);
            userAnswers[currentQuestionIndex] = selectedOptions;
            const correctAnswer = currentQuestion.answer;
            isCorrect = selectedOptions.length === correctAnswer.length &&
                selectedOptions.every(option => correctAnswer.includes(option));
            break;
        default:
            console.error('不明な質問タイプです:', currentQuestion.type); // エラーハンドリング
            return;
    }

    // 結果表示
    resultTextElement.textContent = isCorrect ? '正解！' : `不正解。正解は「${getCorrectAnswerText(currentQuestion)}」です。`;
    submitButton.style.display = 'none';
    resultContainer.style.display = 'block';
}

/**
 * 次の問題へ進む関数
 */
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion(currentQuestionIndex);
    } else {
        // 全問終了後の処理
        const percentage = calculatePercentage();
        resultTextElement.textContent = `あなたの正解率は${percentage.toFixed(2)}%です。`;
        resultContainer.style.display = 'block';
        hideAllQuestionContainers(); // 問題コンテナを非表示
        nextButton.style.display = 'none';
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
        return question.answer;
      case QUESTION_TYPE.CHECKBOX:
        return question.answer.join(', ');
      default:
        return '';
    }
}
/**
 * 正解率を計算する関数
 * @returns {number} - 正解率
 */
function calculatePercentage() {
    let correctCount = 0;
    questions.forEach((question, index) => {
        if (question.type === QUESTION_TYPE.RADIO) {
            if (userAnswers[index] === question.answer) {
                correctCount++;
            }
        } else if (question.type === QUESTION_TYPE.CHECKBOX) {
            const selectedOptions = userAnswers[index] || [];
            const correctAnswer = question.answer;
            if (selectedOptions.length === correctAnswer.length &&
                selectedOptions.every(option => correctAnswer.includes(option))) {
                correctCount++;
            }
        }
    });
    return (correctCount / questions.length) * 100;
}

/**
 * すべての質問コンテナを非表示にする関数
 */
function hideAllQuestionContainers() {
    radioQuestionContainer.style.display = 'none';
    checkboxQuestionContainer.style.display = 'none';
}

/**
 * フィードバックメッセージをクリアする関数
 */
function clearFeedbackMessages() {
    radioFeedback.textContent = '';
    checkboxFeedback.textContent = '';
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
    submitButton.addEventListener('click', checkAnswer);
    nextButton.addEventListener('click', nextQuestion);
}

/**
 * 初期化関数
 */
function init() {
    setupEventListeners();
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            if (questions.length > 0) {
                loadQuestion(currentQuestionIndex); // 最初の問題をロード
            } else {
                const errorElement = document.createElement('p');
                errorElement.textContent = '問題データがありません。';
                quizForm.appendChild(errorElement);
            }
        })
        .catch(error => {
            console.error('問題データの読み込みに失敗しました:', error);
            const errorElement = document.createElement('p');
            errorElement.textContent = '問題データの読み込みに失敗しました。';
            quizForm.appendChild(errorElement);
        });
}

// ページのロードが完了したら初期化処理を実行
window.onload = init;

