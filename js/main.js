// =====================
// Canvas取得
// =====================

const waveCanvas = document.getElementById("waveCanvas");
const waveCtx = waveCanvas.getContext("2d");

const samplingCanvas = document.getElementById("samplingCanvas");
const samplingCtx = samplingCanvas.getContext("2d");

const quantizationCanvas = document.getElementById("quantizationCanvas");
const quantizationCtx = quantizationCanvas.getContext("2d");

const encodingCanvas = document.getElementById("encodingCanvas");
const encodingCtx = encodingCanvas.getContext("2d");

// =====================
// UI取得
// =====================

const frequencySlider = document.getElementById("frequency");
const amplitudeSlider = document.getElementById("amplitude");

const sampleSlider = document.getElementById("sampleCount");
const showOriginalWaveCheckbox =
  document.getElementById("showOriginalWave");

const bitDepthSlider =
  document.getElementById("bitDepth");

const quantizationEnabledCheckbox =
  document.getElementById("quantizationEnabled");

const encodingEnabledCheckbox =
  document.getElementById(
    "encodingEnabled"
  );

// =====================
// 状態
// =====================

const state = {
  frequency: 3,
  amplitude: 60,
  sampleCount: 16,
  bitDepth: 3,
  showOriginalWave: true,
  quantizationEnabled: true,
  encodingEnabled: false
};

// =====================
// 共通関数
// =====================

function getWaveValue(t) {
  return (
    state.amplitude *
    Math.sin(
      t *
      state.frequency *
      Math.PI *
      2
    )
  );
}

function getSamplePoints() {

  const points = [];

  for (
    let i = 0;
    i < state.sampleCount;
    i++
  ) {

    const t =
      i /
      (state.sampleCount - 1);

    points.push({
      t,
      value: getWaveValue(t)
    });
  }

  return points;
}

function quantize(value) {

  const levels =
    2 ** state.bitDepth;

  const normalized =
    (value + state.amplitude)
    /
    (2 * state.amplitude);

  return Math.round(
    normalized *
    (levels - 1)
  );
}

function dequantize(level) {

  const levels =
    2 ** state.bitDepth;

  const normalized =
    level /
    (levels - 1);

  return (
    normalized *
    (2 * state.amplitude)
  ) - state.amplitude;
}

function drawOriginalWave(
  ctx,
  canvas
) {

  ctx.beginPath();

  for (
    let x = 0;
    x < canvas.width;
    x++
  ) {

    const t =
      x / canvas.width;

    const y =
      canvas.height / 2 -
      getWaveValue(t);

    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.strokeStyle =
    "#0066cc";

  ctx.lineWidth = 2;

  ctx.stroke();
}

// =====================
// ❶ 波形
// =====================

function drawWaveSection() {

  waveCtx.clearRect(
    0,
    0,
    waveCanvas.width,
    waveCanvas.height
  );

  drawOriginalWave(
    waveCtx,
    waveCanvas
  );
}

// =====================
// ❷① 標本化
// =====================

function drawSamplingSection() {

  samplingCtx.clearRect(
    0,
    0,
    samplingCanvas.width,
    samplingCanvas.height
  );

  if (
    state.showOriginalWave
  ) {
    drawOriginalWave(
      samplingCtx,
      samplingCanvas
    );
  }

  const points =
    getSamplePoints();

  points.forEach(
    point => {

      const x =
        point.t *
        samplingCanvas.width;

      const y =
        samplingCanvas.height / 2 -
        point.value;

      // 縦線

      samplingCtx.beginPath();

      samplingCtx.moveTo(
        x,
        0
      );

      samplingCtx.lineTo(
        x,
        samplingCanvas.height
      );

      samplingCtx.strokeStyle =
        "#dddddd";

      samplingCtx.stroke();

      // 点

      samplingCtx.beginPath();

      samplingCtx.arc(
        x,
        y,
        5,
        0,
        Math.PI * 2
      );

      samplingCtx.fillStyle =
        "red";

      samplingCtx.fill();
    }
  );
}

// =====================
// ❷② 量子化
// =====================

function drawQuantizationSection() {

  quantizationCtx.clearRect(
    0,
    0,
    quantizationCanvas.width,
    quantizationCanvas.height
  );

  drawOriginalWave(
    quantizationCtx,
    quantizationCanvas
  );

  const levels =
    2 ** state.bitDepth;

  // 横線
if (state.quantizationEnabled) {
  for (
    let i = 0;
    i < levels;
    i++
  ) {

    const value =
      dequantize(i);

    const y =
      quantizationCanvas.height / 2 -
      value;

    quantizationCtx.beginPath();

    quantizationCtx.moveTo(
      0,
      y
    );

    quantizationCtx.lineTo(
      quantizationCanvas.width,
      y
    );

    quantizationCtx.strokeStyle =
      "#dddddd";

    quantizationCtx.stroke();
  }
}
  const points =
    getSamplePoints();

  points.forEach(
    point => {

      const x =
        point.t *
        quantizationCanvas.width;

      const originalY =
        quantizationCanvas.height / 2 -
        point.value;

      const level =
        quantize(
          point.value
        );

      const quantizedValue =
        dequantize(
          level
        );

      const quantizedY =
        quantizationCanvas.height / 2 -
        quantizedValue;

      const drawY =
        state.quantizationEnabled
          ? quantizedY
          : originalY;

      quantizationCtx.beginPath();

      quantizationCtx.arc(
        x,
        drawY,
        5,
        0,
        Math.PI * 2
      );

      quantizationCtx.fillStyle =
        "green";

      quantizationCtx.fill();

      quantizationCtx.fillStyle =
        "black";

      quantizationCtx.font =
        "12px sans-serif";

    }
  );
}

// =====================
// ❷③ 符号化
// =====================

function drawEncodingSection() {

  encodingCtx.clearRect(
    0,
    0,
    encodingCanvas.width,
    encodingCanvas.height
  );

  const levels =
    2 ** state.bitDepth;

  // 横線（量子化レベル）
  for (
    let i = 0;
    i < levels;
    i++
  ) {

    const value =
      dequantize(i);

    const y =
      encodingCanvas.height / 2 -
      value;

    encodingCtx.beginPath();

    encodingCtx.moveTo(
      0,
      y
    );

    encodingCtx.lineTo(
      encodingCanvas.width,
      y
    );

    encodingCtx.strokeStyle =
      "#dddddd";

    encodingCtx.stroke();
  }

  const points =
    getSamplePoints();

  points.forEach(
    point => {

      const x =
        point.t *
        encodingCanvas.width;

      const level =
        quantize(
          point.value
        );

      const quantizedValue =
        dequantize(
          level
        );

      const y =
        encodingCanvas.height / 2 -
        quantizedValue;

      let displayText;

      if (
        state.encodingEnabled
      ) {

        displayText =
          level
            .toString(2)
            .padStart(
              state.bitDepth,
              "0"
            );

      } else {

        displayText =
          level.toString();

      }

      // 点
      encodingCtx.beginPath();

      encodingCtx.arc(
        x,
        y,
        5,
        0,
        Math.PI * 2
      );

      encodingCtx.fillStyle =
        "green";

      encodingCtx.fill();

      // 数値
      encodingCtx.fillStyle =
        "black";

      encodingCtx.font =
        "12px sans-serif";

      encodingCtx.fillText(
        displayText,
        x + 8,
        y - 8
      );

    }
  );
}
// =====================
// 再描画
// =====================

function render() {

  drawWaveSection();

  drawSamplingSection();

  drawQuantizationSection();

  drawEncodingSection();
}

// =====================
// イベント
// =====================

frequencySlider.addEventListener(
  "input",
  e => {
    state.frequency =
      Number(
        e.target.value
      );
    render();
  }
);

amplitudeSlider.addEventListener(
  "input",
  e => {
    state.amplitude =
      Number(
        e.target.value
      );
    render();
  }
);

sampleSlider.addEventListener(
  "input",
  e => {
    state.sampleCount =
      Number(
        e.target.value
      );
    render();
  }
);

bitDepthSlider.addEventListener(
  "input",
  e => {
    state.bitDepth =
      Number(
        e.target.value
      );
    render();
  }
);

showOriginalWaveCheckbox.addEventListener(
  "change",
  e => {
    state.showOriginalWave =
      e.target.checked;
    render();
  }
);

quantizationEnabledCheckbox.addEventListener(
  "change",
  e => {
    state.quantizationEnabled =
      e.target.checked;
    render();
  }
);

encodingEnabledCheckbox.addEventListener(
  "change",
  e => {

    state.encodingEnabled =
      e.target.checked;

    render();

  }
);

// 初回描画

render();