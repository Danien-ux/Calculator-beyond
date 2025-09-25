// --- Button Layouts ---
const standardButtons = [
  ['7','8','9','/'],
  ['4','5','6','*'],
  ['1','2','3','-'],
  ['0','.','=','+'],
  ['C','⌫','±','MC']
];
const scientificButtons = [
  ['sin','cos','tan','^'],
  ['ln','log','√','%'],
  ['(',')','π','e'],
  ['exp','ans','MR','MS'],
  ...standardButtons
];

let mode = 'standard'; // 'standard' or 'scientific'
let history = [];
let memory = 0;
let ans = 0;

// --- DOM Elements ---
const buttonsDiv = document.getElementById('buttons');
const calcInput = document.getElementById('calc-input');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const standardBtn = document.getElementById('standardMode');
const scientificBtn = document.getElementById('scientificMode');
const onlineIndicator = document.getElementById('connection-indicator');

// --- Online/Offline Detection ---
function updateOnlineStatus() {
  if (navigator.onLine) {
    onlineIndicator.classList.remove('offline');
    onlineIndicator.title = "Online";
  } else {
    onlineIndicator.classList.add('offline');
    onlineIndicator.title = "Offline";
  }
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
document.addEventListener('DOMContentLoaded', updateOnlineStatus);

// --- Render Buttons ---
function renderButtons(mode) {
  buttonsDiv.innerHTML = '';
  let btns = mode === 'standard' ? standardButtons : scientificButtons;
  btns.forEach(row => {
    row.forEach(label => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.classList.add('calc-btn');
      btn.onclick = () => handleButton(label);
      buttonsDiv.appendChild(btn);
    });
  });
  buttonsDiv.className = mode;
}
renderButtons(mode);

// --- Mode Switching ---
standardBtn.onclick = () => {
  mode = 'standard';
  standardBtn.classList.add('active');
  scientificBtn.classList.remove('active');
  renderButtons('standard');
};
scientificBtn.onclick = () => {
  mode = 'scientific';
  standardBtn.classList.remove('active');
  scientificBtn.classList.add('active');
  renderButtons('scientific');
};

// --- Button Handler ---
function handleButton(label) {
  let val = calcInput.value;
  switch(label) {
    case 'C': calcInput.value = ''; break;
    case '⌫': calcInput.value = val.slice(0, -1); break;
    case '±': calcInput.value = val ? (val[0] === '-' ? val.slice(1) : '-' + val) : val; break;
    case '=': calculate(); break;
    case 'MC': memory = 0; break;
    case 'MR': calcInput.value = memory.toString(); break;
    case 'MS': memory = parseFloat(val) || 0; break;
    case 'ans': calcInput.value += ans.toString(); break;
    case 'π': calcInput.value += 'π'; break;
    case 'e': calcInput.value += 'e'; break;
    case '^': calcInput.value += '^'; break;
    case '√': calcInput.value += 'sqrt('; break;
    case 'sin': calcInput.value += 'sin('; break;
    case 'cos': calcInput.value += 'cos('; break;
    case 'tan': calcInput.value += 'tan('; break;
    case 'ln': calcInput.value += 'log('; break;
    case 'log': calcInput.value += 'log10('; break;
    case 'exp': calcInput.value += 'exp('; break;
    case '%': calcInput.value += '/100'; break;
    default:
      calcInput.value += label;
  }
}

// --- Calculation Logic ---
function calculate() {
  let expr = calcInput.value;
  // Symbol replacements for math.js
  expr = expr.replace(/÷/g, '/')
             .replace(/×/g, '*')
             .replace(/π/g, 'pi')
             .replace(/e/g, 'e');
  // DO NOT replace ^ with ** for math.js

  // Convert sin(45), cos(45), tan(45) to degrees for user-friendliness
  expr = expr.replace(/(sin|cos|tan)\(([^()]+)\)/g, (match, fn, val) => {
    if (val.trim().endsWith('deg')) return match;
    return `${fn}(${val} deg)`;
  });

  try {
    let result = math.evaluate(expr);
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      ans = result;
      history.push(calcInput.value + ' = ' + result);
      updateHistory();
      calcInput.value = result;
    } else {
      throw new Error("Invalid result");
    }
  } catch (e) {
    calcInput.value = 'Error';
  }
}

// --- History UI ---
function updateHistory() {
  historyList.innerHTML = history.slice(-4).map(h => h).join(' &nbsp;|&nbsp; ');
  clearHistoryBtn.style.visibility = history.length ? 'visible' : 'hidden';
}

// --- Clear History ---
clearHistoryBtn.onclick = function() {
  history = [];
  updateHistory();
};

// --- Keyboard Support ---
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') calculate();
  else if (e.key === 'Backspace') handleButton('⌫');
  else if (e.key === 'Escape') handleButton('C');
  else if (!isNaN(e.key) || "+-*/().".includes(e.key)) calcInput.value += e.key;
});

// --- Accessibility: Focus Trap ---
calcInput.tabIndex = -1;

// --- Initialization ---
calcInput.value = '';
updateHistory();
