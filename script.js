// グローバル変数
let questions = []; // 問題データを格納する配列
let currentQuestionIndex = 0; // 現在表示中の問題のインデックス (0から始まる)
let userAnswers = {}; // ユーザーの回答を問題インデックスをキーとして保存するオブジェクト (キー: 問題インデックス, 値: ユーザーの回答)
let questionResults = {}; // 各問題の正誤結果を問題インデックスをキーとして保存するオブジェクト (キー: 問題インデックス, 値: boolean - trueなら正解)

// --- 設定 ---
const POINTS_PER_QUESTION = 5; // 1問あたりの点数
const PASSING_SCORE = 80;      // 合格点
// -------------

/**
 * DOM要素のキャッシュ
 * - 頻繁にアクセスする要素への参照を保持し、DOMアクセス回数を減らすことでパフォーマンスを向上させる
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
const submitButton = document.getElementById('submit-button'); // 解答ボタン
const resultContainer = document.getElementById('result-container'); // 最終結果表示コンテナ
const resultTextElement = document.getElementById('result-text'); // 最終結果テキスト要素
const nextButton = document.getElementById('next-button'); // 最終結果画面で表示されるボタン (現在機能なし)
const progressDisplayElement = document.getElementById('progress-display'); // 進行状況表示用の要素

/**
 * 質問タイプを定数で管理
 * - 問題JSONのtypeフィールドと対応させる
 */
const QUESTION_TYPE = {
    RADIO: 'radio',      // ラジオボタン形式
    CHECKBOX: 'checkbox', // チェックボックス形式
};

/**
 * 指定されたインデックスの問題をロードし、表示する関数
 * @param {number} index - ロードする問題のインデックス (0から始まる)
 */
function loadQuestion(index) {
    // 問題インデックスが有効範囲外の場合はエラー処理
    if (index < 0 || index >= questions.length) {
        console.error('エラー: 無効な問題インデックスが指定されました。', index);
        displayErrorMessage('問題の表示に問題が発生しました。'); // ユーザー向けエラー表示
        hideAllQuestionContainers(); // 問題コンテナを非表示
        submitButton.style.display = 'none'; // 解答ボタンを非表示
        nextButton.style.display = 'none'; // 次へボタンも非表示
        progressDisplayElement.textContent = ''; // 進行状況もクリア
        return; // 処理中断
    }

    const currentQuestion = questions[index]; // 現在の問題データを取得
    hideAllQuestionContainers(); // 他の質問コンテナをすべて非表示に
    resultContainer.style.display = 'none'; // 最終結果表示コンテナを非表示に
    submitButton.style.display = 'block'; // 解答ボタンを表示
    nextButton.style.display = 'none'; // 次へボタンは非表示 (全問終了まで)
    clearFeedbackMessages(); // 各問題ごとのフィードバックメッセージをクリア

    // 進行状況表示を更新 (例: 問題 1 / 20)
    updateProgressDisplay();

    // 質問タイプに応じて適切な表示処理を呼び出す
    switch (currentQuestion.type) {
        case QUESTION_TYPE.RADIO:
            loadRadioQuestionContent(currentQuestion); // ラジオボタン問題の内容を表示
            radioQuestionContainer.style.display = 'block'; // ラジオボタンコンテナを表示
            break;
        case QUESTION_TYPE.CHECKBOX:
            loadCheckboxQuestionContent(currentQuestion); // チェックボックス問題の内容を表示
            checkboxQuestionContainer.style.display = 'block'; // チェックボックスコンテナを表示
            break;
        default:
            // 未知の質問タイプの場合のエラー処理
            console.error('エラー: 未知の質問タイプです。', currentQuestion.type);
            displayErrorMessage('問題の表示に問題が発生しました。'); // ユーザー向けエラー表示
            hideAllQuestionContainers(); // 問題コンテナを非表示
            submitButton.style.display = 'none'; // 解答ボタンを非表示
            progressDisplayElement.textContent = ''; // 進行状況もクリア
    }

    // 以前の回答の選択状態を復元する処理は、ここでは行わない（正誤判定のみ記録するため）
}

/**
 * ラジオボタン形式の質問内容をDOMに表示する関数
 * @param {object} question - 表示する質問オブジェクト
 */
function loadRadioQuestionContent(question) {
    // 選択肢の配列をシャッフル（元の配列を直接変更しないようにコピーしてから）
    const options = shuffleArray([...question.options]);
    // 質問テキストをinnerHTMLで設定し、HTMLタグを解釈させる
    radioQuestionTextElement.innerHTML = question.question;
    radioOptionsContainer.innerHTML = ''; // 既存の選択肢をすべてクリア

    // 各選択肢を生成し、DOMに追加
    options.forEach((option, i) => {
        const radioOption = document.createElement('div');
        radioOption.className = 'radio-option'; // スタイリング用のクラス
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'radio-option'; // 同じname属性でラジオボタングループを作成
        input.value = option; // 選択肢の値を設定
        input.id = `radio-option-${i}`; // 各選択肢にユニークなIDを設定 (labelとの関連付け用)
        const label = document.createElement('label');
        label.textContent = option; // 選択肢のテキストを設定
        label.htmlFor = `radio-option-${i}`; // labelとinputを関連付け (クリック領域拡大)
        radioOption.appendChild(input);
        radioOption.appendChild(label);
        radioOptionsContainer.appendChild(radioOption); // コンテナに追加
    });
}

/**
 * チェックボックス形式の質問内容をDOMに表示する関数
 * @param {object} question - 表示する質問オブジェクト
 */
function loadCheckboxQuestionContent(question) {
    // 選択肢の配列をシャッフル（元の配列を直接変更しないようにコピーしてから）
    const options = shuffleArray([...question.options]);
     // 質問テキストをinnerHTMLで設定し、HTMLタグを解釈させる
    checkboxQuestionTextElement.innerHTML = question.question;
    checkboxOptionsContainer.innerHTML = ''; // 既存の選択肢をすべてクリア

    // 各選択肢を生成し、DOMに追加
    options.forEach((option, i) => {
        const checkboxOption = document.createElement('div');
        checkboxOption.className = 'checkbox-option'; // スタイリング用のクラス
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'checkbox-option'; // チェックボックスは同じnameでも複数選択可能
        input.value = option; // 選択肢の値を設定
        input.id = `checkbox-option-${i}`; // 各選択肢にユニークなIDを設定 (labelとの関連付け用)
        const label = document.createElement('label');
        label.textContent = option; // 選択肢のテキストを設定
        label.htmlFor = `checkbox-option-${i}`; // labelとinputを関連付け (クリック領域拡大)
        checkboxOption.appendChild(input);
        checkboxOption.appendChild(label);
        checkboxOptionsContainer.appendChild(checkboxOption); // コンテナに追加
    });
}


/**
 * ユーザーの解答をチェックし、正誤を記録して次の問題へ自動遷移する関数
 * - 解答ボタンがクリックされたときに呼び出される
 */
function checkAnswer() {
    const currentQuestion = questions[currentQuestionIndex]; // 現在の問題データを取得
    let isCorrect = false; // 正解かどうかを判定するフラグ
    let userAnswer = undefined; // ユーザーの回答を一時的に保持

    // 各問題ごとのフィードバックメッセージをクリア
    clearFeedbackMessages();

    // 質問タイプに応じてユーザーの回答を取得し、正誤を判定
    switch (currentQuestion.type) {
        case QUESTION_TYPE.RADIO:
            const selectedRadioOption = document.querySelector('input[name="radio-option"]:checked');
            if (selectedRadioOption) {
                userAnswer = selectedRadioOption.value; // 選択されたラジオボタンの値を取得
                isCorrect = (userAnswer === currentQuestion.answer); // 正解と比較
            } else {
                // ラジオボタンで何も選択されていない場合はフィードバックを表示して処理中断
                radioFeedback.textContent = '解答を選択してください。';
                return;
            }
            break;
        case QUESTION_TYPE.CHECKBOX:
            // 選択されたすべてのチェックボックスの値を取得し配列にする
            const selectedCheckboxOptions = Array.from(document.querySelectorAll('input[name="checkbox-option"]:checked'))
                .map(checkbox => checkbox.value);
            userAnswer = selectedCheckboxOptions; // ユーザーの回答として配列を保存
            const correctAnswer = currentQuestion.answer; // 正解の配列
            // 正解とする条件: 選択されたオプションの数と内容が、正解の配列と完全に一致する
            isCorrect = selectedCheckboxOptions.length === correctAnswer.length &&
                        selectedCheckboxOptions.every(option => correctAnswer.includes(option));

            // チェックボックスで何も選択されていない場合の正誤判定の考慮
            // 正解が空配列の場合は何も選択されていなければ正解、それ以外の場合は不正解
            if (selectedCheckboxOptions.length === 0) {
                 isCorrect = (correctAnswer.length === 0);
            }
            break;
        default:
            // 未知の質問タイプの場合のエラー処理
            console.error('エラー: 解答チェック時に未知の質問タイプを検出しました。', currentQuestion.type);
            displayErrorMessage('解答処理中に問題が発生しました。'); // ユーザー向けエラー表示
            submitButton.style.display = 'none'; // 解答ボタンを非表示
            return; // 処理中断
    }

    // ユーザーの回答と正誤結果を保存
    userAnswers[currentQuestionIndex] = userAnswer;
    questionResults[currentQuestionIndex] = isCorrect;

    // 各問題ごとのフィードバック表示は行わないため、ここでは何も表示しない

    // 次の問題へ進むか、全問終了処理へ移行
    if (currentQuestionIndex < questions.length - 1) {
        // 次の問題がある場合
        currentQuestionIndex++; // 次の問題のインデックスに更新
        loadQuestion(currentQuestionIndex); // 次の問題をロードして表示
    } else {
        // 全問終了の場合
        displayFinalResult(); // 最終結果を表示
    }
}

/**
 * 進行状況表示を更新する関数
 * - 現在の問題番号と全問題数を表示する
 */
function updateProgressDisplay() {
    // 現在の問題番号 (1から始まる) / 全問題数 の形式で表示
    progressDisplayElement.textContent = `問題 ${currentQuestionIndex + 1} / ${questions.length}`;
}


/**
 * 全問終了後に最終結果（合計点と合否）を表示する関数
 */
function displayFinalResult() {
    const correctCount = getCorrectAnswerCount(); // 正解した問題の数を取得
    const totalScore = correctCount * POINTS_PER_QUESTION; // 合計点を計算
    const totalQuestions = questions.length; // 全問題数
    const totalPossibleScore = totalQuestions * POINTS_PER_QUESTION; // 満点

    // 合否判定
    const isPassed = totalScore >= PASSING_SCORE;

    // 最終結果メッセージを作成
    let finalMessage = `全問終了！\n`;
    finalMessage += `あなたの得点: ${totalScore}点 / ${totalPossibleScore}点\n`;
    finalMessage += `合否: ${isPassed ? '合格' : '不合格'}`;

    // 結果表示コンテナにメッセージを設定
    resultTextElement.textContent = finalMessage; // textContentで改行も反映される

    resultContainer.style.display = 'block'; // 最終結果表示コンテナを表示
    hideAllQuestionContainers(); // 問題コンテナを非表示
    submitButton.style.display = 'none'; // 解答ボタンを非表示に
    nextButton.style.display = 'none'; // 最終結果画面では「次へ」ボタンを非表示にする

    // 進行状況表示を最終結果表示中は完了を示す表示に更新
    progressDisplayElement.textContent = `完了 (${totalQuestions}問中)`;
}


/**
 * 正解した問題の数を計算する関数
 * @returns {number} - 正解した問題の数
 */
function getCorrectAnswerCount() {
    let correctCount = 0;
    // questionResults オブジェクトを反復処理し、値が true の数を数える
    // questionResultsは問題インデックスをキーとするオブジェクト
    for (const index in questionResults) {
        // hasOwnPropertyでプロトタイプチェーン上の不要なプロパティを除外
        if (Object.hasOwnProperty.call(questionResults, index)) {
            if (questionResults[index] === true) {
                correctCount++;
            }
        }
    }
    return correctCount;
}


/**
 * すべての質問コンテナを非表示にする関数
 */
function hideAllQuestionContainers() {
    radioQuestionContainer.style.display = 'none';
    checkboxQuestionContainer.style.display = 'none';
}

/**
 * 各問題ごとのフィードバックメッセージ表示要素の内容をクリアする関数
 */
function clearFeedbackMessages() {
    radioFeedback.textContent = '';
    checkboxFeedback.textContent = '';
}

/**
 * ユーザー向けにエラーメッセージを表示する関数
 * @param {string} message - 表示するエラーメッセージ
 */
function displayErrorMessage(message) {
    resultTextElement.textContent = `エラー: ${message}`;
    resultContainer.style.display = 'block'; // 結果表示コンテナを使ってエラーを表示
}


/**
 * イベントリスナーの設定を行う関数
 * - DOMContentLoadedイベント内で呼び出される想定
 */
function setupEventListeners() {
    // 解答ボタンがクリックされたら checkAnswer 関数を実行
    submitButton.addEventListener('click', checkAnswer);

    // nextButtonは最終結果表示後に表示されるが、今回は機能を持たせないためイベントリスナーは設定しない
    // もし「最初からやり直す」などの機能をつけたい場合は、別途イベントリスナーを設定
    // nextButton.addEventListener('click', restartQuiz); // 例: リスタート機能を追加する場合
}

/**
 * クイズの初期化処理を行う関数
 * - ページのロードが完了したときに呼び出される
 * - イベントリスナーを設定し、questions.jsonを読み込む
 */
function init() {
    setupEventListeners(); // イベントリスナーを設定

    // questions.json ファイルをフェッチして問題データを取得
    fetch('questions.json')
        .then(response => {
            // レスポンスが正常かどうかを確認 (HTTPステータスコード 200-299)
            if (!response.ok) {
                // HTTPエラーが発生した場合
                throw new Error(`HTTPエラー! ステータス: ${response.status}`);
            }
            return response.json(); // JSON形式でデータをパース
        })
        .then(data => {
            // データが配列であり、かつ空でないかを確認
            if (!Array.isArray(data) || data.length === 0) {
                 throw new Error('問題データが空または不正な形式です。');
            }
            questions = data; // 取得したデータをquestions配列に格納

            // 問題をランダムに並び替える
            questions = shuffleArray(questions);

            // 最初の問題を表示
            currentQuestionIndex = 0; // 最初の問題インデックスを0に設定
            loadQuestion(currentQuestionIndex); // 最初の問題をロードして表示

            // userAnswersとquestionResultsは最初の問題ロード時に初期化されるため、ここでは不要
        })
        .catch(error => {
            // データ読み込み失敗時またはデータ形式不正時のエラーハンドリング
            console.error('エラー: 問題データの読み込みまたは処理に失敗しました。', error);
            displayErrorMessage(`問題データの読み込みに失敗しました。エラー: ${error.message}`);
            submitButton.style.display = 'none'; // 問題が読み込めないのでボタンを非表示
            progressDisplayElement.textContent = ''; // 進行状況もクリア
        });
}

/**
 * 配列をシャッフルする関数 (Fisher-Yates (aka Knuth) Shuffle アルゴリズム)
 * - 元の配列を変更せず、シャッフルされた新しい配列を返す
 * @param {Array} array - シャッフルする配列
 * @returns {Array} - シャッフルされた新しい配列
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

        // 現在の要素 (currentIndex) とランダムに選んだ要素 (randomIndex) を交換する
        [shuffledArray[currentIndex], shuffledArray[randomIndex]] = [
            shuffledArray[randomIndex], shuffledArray[currentIndex]];
    }
    return shuffledArray; // シャッフルされた配列を返す
}


// ページのロードが完了したら初期化処理を実行
// DOMContentLoaded でも良いが、ここでは伝統的にwindow.onloadを使用
window.onload = init;
