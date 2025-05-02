let questions = []; // 問題データを格納する配列
let currentQuestionIndex = 0; // 現在の問題のインデックス (0から始まる)
let userAnswers = {}; // ユーザーの回答を保存するオブジェクト (キー: 問題インデックス, 値: ユーザーの回答)
let questionResults = {}; // 各問題の正誤結果を保存するオブジェクト (キー: 問題インデックス, 値: boolean - trueなら正解)

// --- 設定 ---
const POINTS_PER_QUESTION = 5; // 1問あたりの点数
const PASSING_SCORE = 80;      // 合格点
// -------------

/**
 * DOM要素のキャッシュ
 * - 頻繁にアクセスする要素は変数に格納して、パフォーマンスを向上させる
 */
const quizForm = document.getElementById('quiz-form');
const radioQuestionContainer = document.getElementById('radio-question-container');
const radioQuestionTextElement = document.getElementById('radio-question-text');
const radioOptionsContainer = document.getElementById('radio-options-container');
const radioFeedback = document.getElementById('radio-feedback'); // 各問題ごとのフィードバックは表示しないが要素は残しておく
const checkboxQuestionContainer = document.getElementById('checkbox-question-container');
const checkboxQuestionTextElement = document.getElementById('checkbox-question-text');
const checkboxOptionsContainer = document.getElementById('checkbox-options-container');
const checkboxFeedback = document.getElementById('checkbox-feedback'); // 各問題ごとのフィードバックは表示しないが要素は残しておく
const submitButton = document.getElementById('submit-button');
const resultContainer = document.getElementById('result-container');
const resultTextElement = document.getElementById('result-text');
const nextButton = document.getElementById('next-button'); // 全問終了後に表示（今回は非表示に修正）
const progressDisplayElement = document.getElementById('progress-display'); // 進行状況表示用の要素

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
 * @param {number} index - 表示する質問のインデックス (0から始まる)
 */
function loadQuestion(index) {
    // 問題インデックスが有効範囲外の場合は処理を中断
    if (index < 0 || index >= questions.length) {
        console.error('エラー: 無効な問題インデックスです。', index);
        resultTextElement.textContent = '問題の表示に問題が発生しました。'; // ユーザー向けエラー表示
        resultContainer.style.display = 'block';
        submitButton.style.display = 'none';
        nextButton.style.display = 'none'; // 次へボタンも非表示
        progressDisplayElement.textContent = ''; // 進行状況もクリア
        return;
    }

    const currentQuestion = questions[index];
    hideAllQuestionContainers(); // すべての質問コンテナを非表示にする
    resultContainer.style.display = 'none'; // 結果表示も非表示にする
    submitButton.style.display = 'block'; // 解答ボタンを表示
    nextButton.style.display = 'none'; // 次へボタンは非表示 (全問終了まで)
    clearFeedbackMessages(); // フィードバックメッセージをクリア

    // 進行状況を更新 (例: 1/20)
    updateProgressDisplay();


    switch (currentQuestion.type) {
        case QUESTION_TYPE.RADIO:
            loadRadioQuestionContent(currentQuestion); // 内容表示処理を分離
            radioQuestionContainer.style.display = 'block';
            break;
        case QUESTION_TYPE.CHECKBOX:
            loadCheckboxQuestionContent(currentQuestion); // 内容表示処理を分離
            checkboxQuestionContainer.style.display = 'block';
            break;
        // case QUESTION_TYPE.FILL_IN: // もし穴埋め問題を追加するなら
        //     loadFillInQuestionContent(currentQuestion);
        //     fillInQuestionContainer.style.display = 'block';
        //     break;
        default:
            console.error('エラー: 不明な質問タイプです。', currentQuestion.type);
            resultTextElement.textContent = '問題の表示に問題が発生しました。'; // ユーザー向けエラー表示
            resultContainer.style.display = 'block';
            submitButton.style.display = 'none';
            progressDisplayElement.textContent = ''; // 進行状況もクリア
    }

    // 以前の回答の選択状態を復元（必要であれば）
    // 今回は正誤判定のみ記録するため、回答自体の表示は復元しない
}

/**
 * ラジオボタン形式の質問内容を表示する関数
 * @param {object} question - 質問オブジェクト
 */
function loadRadioQuestionContent(question) {
    const options = shuffleArray([...question.options]); // 選択肢の配列をシャッフル
    radioQuestionTextElement.innerHTML = question.question; // HTMLタグを解釈させる
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
}

/**
 * チェックボックス形式の質問内容を表示する関数
 * @param {object} question - 質問オブジェクト
 */
function loadCheckboxQuestionContent(question) {
    const options = shuffleArray([...question.options]); // 選択肢の配列をシャッフル
    checkboxQuestionTextElement.innerHTML = question.question; // HTMLタグを解釈させる
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
}


/**
 * 解答をチェックし、正誤を記録して次の問題へ進む関数
 */
function checkAnswer() {
    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false; // 正解かどうかを判定する変数
    let userAnswer = undefined; // ユーザーの回答を一時的に保持

    // フィードバックメッセージをクリア
    clearFeedbackMessages();

    switch (currentQuestion.type) {
        case QUESTION_TYPE.RADIO:
            const selectedRadioOption = document.querySelector('input[name="radio-option"]:checked');
            if (selectedRadioOption) {
                userAnswer = selectedRadioOption.value;
                isCorrect = selectedRadioOption.value === currentQuestion.answer;
            } else {
                // ラジオボタンで解答が選択されていない場合のみフィードバックを表示
                radioFeedback.textContent = '解答を選択してください。';
                return; // 解答がない場合はここで処理を終了
            }
            break;
        case QUESTION_TYPE.CHECKBOX:
            const selectedCheckboxOptions = Array.from(document.querySelectorAll('input[name="checkbox-option"]:checked'))
                .map(checkbox => checkbox.value);
            userAnswer = selectedCheckboxOptions;
            const correctAnswer = currentQuestion.answer; // 正解の配列
            // 選択された数と内容が完全に一致するかを判定
            isCorrect = selectedCheckboxOptions.length === correctAnswer.length &&
                selectedCheckboxOptions.every(option => correctAnswer.includes(option));

            // チェックボックスで何も選択されていない場合の考慮
            // 正解が空配列の場合は何も選択されていなければ正解、それ以外は不正解
            if (selectedCheckboxOptions.length === 0) {
                 isCorrect = (correctAnswer.length === 0);
            }

            break;
        // case QUESTION_TYPE.FILL_IN: // もし穴埋め問題を追加するなら
        //     const fillInInput = document.getElementById('fill-in-answer-input');
        //     userAnswer = fillInInput.value.trim(); // 前後の空白を除去
        //     isCorrect = userAnswer === currentQuestion.answer;
        //     // 穴埋め問題で空欄の場合の考慮
        //     if (userAnswer === '' && currentQuestion.answer !== '') {
        //          isCorrect = false; // 正解があるのに空欄なら不正解
        //     } else if (userAnswer !== '' && currentQuestion.answer === '') {
        //          isCorrect = false; // 正解が空なのに何か入力されていれば不正解
        //     } else if (userAnswer === '' && currentQuestion.answer === '') {
        //          isCorrect = true; // 正解も空で入力も空なら正解
        //     }
        //     break;
        default:
            console.error('エラー: 不明な質問タイプです。', currentQuestion.type);
            // 不明なタイプの場合、ユーザーへの通知を追加検討
            return; // 不明なタイプの場合は処理を終了
    }

    // ユーザーの回答と正誤結果を保存
    userAnswers[currentQuestionIndex] = userAnswer;
    questionResults[currentQuestionIndex] = isCorrect;

    // 各問題ごとのフィードバック表示はしない
    // 解答を受け付けたメッセージも表示しない

    // 次の問題へ進む、または全問終了処理へ
    if (currentQuestionIndex < questions.length - 1) {
        // 次の問題がある場合
        currentQuestionIndex++; // インデックスをインクリメント
        loadQuestion(currentQuestionIndex); // 次の問題をロード
    } else {
        // 全問終了の場合
        displayFinalResult(); // 最終結果を表示
    }
}

/**
 * 進行状況表示を更新する関数
 */
function updateProgressDisplay() {
    // 現在の問題番号 (1から始まる) / 全問題数
    progressDisplayElement.textContent = `問題 ${currentQuestionIndex + 1} / ${questions.length}`;

    // もし「・・〇・・＋・・・・10・・・・＋・・・・20」のような表示にするなら、
    // ここでより複雑なDOM操作や文字列生成を行う必要があります。
    // 例:
    // let progressString = '';
    // for (let i = 0; i < questions.length; i++) {
    //     if (i in questionResults) { // 解答済みの問題
    //          progressString += questionResults[i] ? '〇' : '×'; // 正誤に応じてマークを変える
    //     } else if (i === currentQuestionIndex) {
    //         progressString += '●'; // 現在の問題
    //     } else {
    //         progressString += '・'; // 未解答
    //     }
    //     if ((i + 1) % 10 === 0 && i < questions.length - 1) { // 10問ごとに区切り
    //         progressString += '＋';
    //     }
    // }
    // progressDisplayElement.textContent = progressString;
}


/**
 * 全問終了後に最終結果（合計点と合否）を表示する関数
 */
function displayFinalResult() {
    const correctCount = getCorrectAnswerCount(); // 正解数を取得
    const totalScore = correctCount * POINTS_PER_QUESTION; // 合計点を計算
    const totalQuestions = questions.length; // 問題数
    const totalPossibleScore = totalQuestions * POINTS_PER_QUESTION; // 満点

    // 合否判定
    const isPassed = totalScore >= PASSING_SCORE;

    // 結果メッセージを作成
    let finalMessage = `全問終了！\n`;
    finalMessage += `あなたの得点: ${totalScore}点 / ${totalPossibleScore}点\n`;
    finalMessage += `合否: ${isPassed ? '合格' : '不合格'}`;

    // 結果表示コンテナにメッセージを設定
    resultTextElement.textContent = finalMessage; // textContentで改行も反映される

    resultContainer.style.display = 'block'; // 結果表示を維持
    hideAllQuestionContainers(); // 問題コンテナを非表示
    submitButton.style.display = 'none'; // 解答ボタンも非表示に
    // nextButton.style.display = 'block'; // 全問終了後のみ「次へ」ボタンを表示（再開用などを想定） - この行を削除またはコメントアウト
    nextButton.style.display = 'none'; // 最終結果画面では「次へ」ボタンを非表示にする ★修正箇所★


    // 進行状況表示を最終結果表示中は非表示にするか、完了を示す表示にするか検討
    progressDisplayElement.textContent = `完了 (${totalQuestions}問中)`; // 例: 完了 (20問中)
}


/**
 * 正解の数を計算する関数
 * @returns {number} - 正解した問題の数
 */
function getCorrectAnswerCount() {
    let correctCount = 0;
    // questionResults オブジェクトを反復処理し、true の数を数える
    // questionResultsは問題インデックスをキーとするオブジェクト
    for (const index in questionResults) {
        // hasOwnPropertyでプロトタイプチェーン上のプロパティを除外
        if (Object.hasOwnProperty.call(questionResults, index)) {
            if (questionResults[index] === true) {
                correctCount++;
            }
        }
    }
    return correctCount;
}


/**
 * 正解のテキストを取得する関数 (今回はユーザーには表示しないが、内部処理やデバッグ用に保持)
 * @param {object} question - 質問オブジェクト
 * @returns {string} - 正解のテキスト
 */
function getCorrectAnswerText(question) {
    switch (question.type) {
        case QUESTION_TYPE.RADIO:
            return question.answer; // ラジオボタンの正解は単一の値
        case QUESTION_TYPE.CHECKBOX:
            // チェックボックスの正解は配列をカンマ区切り文字列に
            // 正解が空配列の場合は「なし」と表示するなど、表示形式を調整しても良い
            return question.answer.join(', ');
        // case QUESTION_TYPE.FILL_IN: // もし穴埋め問題を追加するなら
        //     return question.answer;
        default:
            return ''; // 不明なタイプの場合は空文字列
    }
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
    // nextButtonは最終結果表示後に表示されるが、今回は機能を持たせないためイベントリスナーは設定しない
    // もし「最初からやり直す」などの機能をつけたい場合は、別途イベントリスナーを設定
    // nextButton.addEventListener('click', restartQuiz); // 例: リスタート機能を追加する場合
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
                // エラーメッセージを日本語化
                throw new Error(`HTTPエラー! ステータス: ${response.status}`);
            }
            return response.json(); // JSONとしてパース
        })
        .then(data => {
            questions = data; // 取得したデータをquestions配列に格納
            // 問題をランダムに並び替える
            questions = shuffleArray(questions);
            // userAnswersとquestionResultsを問題数に合わせて初期化（任意だが明示的）
            // questions.forEach((_, index) => { userAnswers[index] = undefined; questionResults[index] = undefined; });

            if (questions.length > 0) {
                currentQuestionIndex = 0; // 最初の問題インデックスを0に設定
                loadQuestion(currentQuestionIndex); // 最初の問題をロード
            } else {
                // 問題データが空の場合の処理を日本語化
                const errorElement = document.createElement('p');
                errorElement.textContent = '問題データがありません。questions.jsonファイルを確認してください。';
                quizForm.appendChild(errorElement);
                submitButton.style.display = 'none'; // 問題がないのでボタンを非表示
                progressDisplayElement.textContent = ''; // 進行状況もクリア
            }
        })
        .catch(error => {
            // データ読み込み失敗時のエラーメッセージを日本語化
            console.error('エラー: 問題データの読み込みに失敗しました。', error);
            const errorElement = document.createElement('p');
            errorElement.textContent = `問題データの読み込みに失敗しました。エラー: ${error.message}`;
            quizForm.appendChild(errorElement);
            submitButton.style.display = 'none'; // 問題が読み込めないのでボタンを非表示
            progressDisplayElement.textContent = ''; // 進行状況もクリア
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
