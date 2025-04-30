let questions = []; // 問題データを格納する配列
let currentQuestionIndex = 0; // 現在の問題のインデックス
const quizForm = document.getElementById('quiz-form');
const radioQuestionContainer = document.getElementById('radio-question-container');
const radioQuestionTextElement = document.getElementById('radio-question-text');
const radioOptionsContainer = document.getElementById('radio-options-container');
const radioFeedback = document.getElementById('radio-feedback');
const checkboxQuestionContainer = document.getElementById('checkbox-question-container');
const checkboxQuestionTextElement = document.getElementById('checkbox-question-text');
const checkboxOptionsContainer = document.getElementById('checkbox-options-container');
const checkboxFeedback = document.getElementById('checkbox-feedback');
const fillInQuestionContainer = document.getElementById('fill-in-question-container');
const fillInQuestionTextElement = document.getElementById('fill-in-question-text');
const fillInAnswerInput = document.getElementById('fill-in-answer-input');
const fillInFeedback = document.getElementById('fill-in-feedback');
const submitButton = document.getElementById('submit-button');
const resultContainer = document.getElementById('result-container');
const resultTextElement = document.getElementById('result-text');
const nextButton = document.getElementById('next-button');
let userAnswers = {}; // ユーザーの回答を保存するオブジェクト
function loadQuestion(index) {
    const currentQuestion = questions[index];
    radioQuestionContainer.style.display = 'none';
    checkboxQuestionContainer.style.display = 'none';
    fillInQuestionContainer.style.display = 'none';
    resultContainer.style.display = 'none';
    submitButton.style.display = 'block';
    radioFeedback.textContent = '';
    checkboxFeedback.textContent = '';
    fillInFeedback.textContent = '';
    if (currentQuestion.type === 'radio') {
        loadRadioQuestion(index);
    } else if (currentQuestion.type === 'checkbox') {
        loadCheckboxQuestion(index);
    } else if (currentQuestion.type === 'fill-in') {
        loadFillInQuestion(index);
    }
}
function loadRadioQuestion(index) {
    const currentQuestion = questions[index];
    radioQuestionTextElement.textContent = currentQuestion.question;
    radioOptionsContainer.innerHTML = ''; // Clear previous options
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
function loadCheckboxQuestion(index) {
    const currentQuestion = questions[index];
    checkboxQuestionTextElement.textContent = currentQuestion.question;
    checkboxOptionsContainer.innerHTML = ''; // Clear previous options
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
function loadFillInQuestion(index) {
    const currentQuestion = questions[index];
    fillInQuestionTextElement.textContent = currentQuestion.question;
    fillInAnswerInput.value = '';
    fillInQuestionContainer.style.display = 'block';
    // 以前の回答を復元
    if (userAnswers[index] !== undefined) {
        fillInAnswerInput.value = userAnswers[index];
    }
}
function checkAnswer() {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.type === 'radio') {
        const selectedOption = document.querySelector('input[name="radio-option"]:checked');
        if (selectedOption) {
            userAnswers[currentQuestionIndex] = selectedOption.value;
            if (selectedOption.value === currentQuestion.answer) {
                resultTextElement.textContent = '正解！';
            } else {
                resultTextElement.textContent = `不正解。正解は「${currentQuestion.answer}」です。`;
            }
        } else {
            resultTextElement.textContent = '解答を選択してください。';
            return;
        }
    } else if (currentQuestion.type === 'checkbox') {
        const selectedOptions = Array.from(document.querySelectorAll('input[name="checkbox-option"]:checked'))
            .map(checkbox => checkbox.value);
        userAnswers[currentQuestionIndex] = selectedOptions;
        const correctAnswer = currentQuestion.answer;
        if (selectedOptions.length === correctAnswer.length &&
            selectedOptions.every(option => correctAnswer.includes(option))) {
            resultTextElement.textContent = '正解！';
        } else {
            resultTextElement.textContent = `不正解。正解は「${correctAnswer.join(', ')}」です。`;
        }
    } else if (currentQuestion.type === 'fill-in') {
        const userAnswer = fillInAnswerInput.value.trim();
        userAnswers[currentQuestionIndex] = userAnswer;
        if (currentQuestion.answer.includes(userAnswer)) {
            resultTextElement.textContent = '正解！';
        } else {
            resultTextElement.textContent = `不正解。正解は「${currentQuestion.answer.join(', ')}」です。`;
        }
    }
    submitButton.style.display = 'none';
    resultContainer.style.display = 'block';
}
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion(currentQuestionIndex);
    } else {
        // 全問終了後の処理
        // ここからバックエンドとの通信を削除し、フロントエンドで処理を完結させる
        let correctCount = 0;
        questions.forEach((question, index) => {
            if (question.type === 'radio') {
                if (userAnswers[index] === question.answer) {
                    correctCount++;
                }
            } else if (question.type === 'checkbox') {
                const selectedOptions = userAnswers[index] || [];
                const correctAnswer = question.answer;
                if (selectedOptions.length === correctAnswer.length &&
                    selectedOptions.every(option => correctAnswer.includes(option))) {
                    correctCount++;
                }
            } else if (question.type === 'fill-in') {
                const userAnswer = userAnswers[index];
                if (question.answer.includes(userAnswer)) {
                    correctCount++;
                }
            }
        });
        const percentage = (correctCount / questions.length) * 100;
        resultTextElement.textContent = `あなたの正解率は${percentage.toFixed(2)}%です。`;
        quizForm.innerHTML = ''; // Clear the form
        resultContainer.style.display = 'block';
        nextButton.style.display = 'none';
    }
}
// イベントリスナー
submitButton.addEventListener('click', checkAnswer);
nextButton.addEventListener('click', nextQuestion);
// 問題データの読み込み (JSON ファイルから)
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
