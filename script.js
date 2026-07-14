const pwInput = document.getElementById('pw');
const toggleBtn = document.getElementById('toggle');
const meter = document.getElementById('meter');
const segs = meter.querySelectorAll('.seg');
const verdictEl = document.getElementById('verdict');
const crackEl = document.getElementById('crack');
const statLen = document.getElementById('statLen');
const statEntropy = document.getElementById('statEntropy');
const statCharset = document.getElementById('statCharset');
const checksList = document.getElementById('checks');

const COMMON_PASSWORDS = new Set([
  '123456','password','123456789','12345678','12345','qwerty','abc123',
  '111111','123123','password1','1234567','1234567890','000000','iloveyou',
  'admin','welcome','monkey','login','letmein','dragon','master','sunshine',
  'football','baseball','princess','qazwsx','trustno1','superman','696969',
  'shadow','michael','jennifer','hunter','buster','soccer','harley','ranger',
  'passw0rd','starwars','freedom','whatever','qwerty123','zaq1zaq1','ninja',
  'azerty','loveme','password123','admin123','root','toor'
]);

const SEQUENCES = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

function charsetSize(pw) {
  let size = 0;
  if (/[a-z]/.test(pw)) size += 26;
  if (/[A-Z]/.test(pw)) size += 26;
  if (/[0-9]/.test(pw)) size += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) size += 33;
  return size;
}

function hasLongRepeat(pw) {
  return /(.)\1\1\1/.test(pw); // same char 4+ times in a row
}

function hasSequence(pw) {
  const lower = pw.toLowerCase();
  for (const seq of SEQUENCES) {
    for (let i = 0; i <= seq.length - 4; i++) {
      const chunk = seq.slice(i, i + 4);
      const rev = chunk.split('').reverse().join('');
      if (lower.includes(chunk) || lower.includes(rev)) return true;
    }
  }
  return false;
}

function isCommon(pw) {
  const lower = pw.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) return true;
  // strip trailing digits, check base word too (e.g. password99)
  const base = lower.replace(/[0-9]+$/, '');
  return COMMON_PASSWORDS.has(base);
}

function entropyBits(pw) {
  const size = charsetSize(pw);
  if (size === 0 || pw.length === 0) return 0;
  return pw.length * Math.log2(size);
}

function crackTimeLabel(bits, penalized) {
  if (penalized) return 'crackable almost instantly';
  // assume 10 billion guesses/sec (offline fast hash) as a conservative-fast attacker
  const guesses = Math.pow(2, bits);
  const seconds = guesses / 1e10;
  const units = [
    [60, 'seconds'],
    [60, 'minutes'],
    [24, 'hours'],
    [365, 'days'],
    [100, 'years'],
    [10, 'centuries'],
  ];
  if (seconds < 1) return 'instantly';
  let value = seconds;
  let label = 'seconds';
  for (const [factor, name] of units) {
    if (value < factor) { label = name; break; }
    value /= factor;
    label = name;
  }
  if (label === 'centuries' && value > 1000) return 'longer than the universe has existed';
  const rounded = value < 10 ? value.toFixed(1) : Math.round(value);
  return `~${rounded} ${label} to crack`;
}

function evaluate(pw) {
  const checks = {
    len8: pw.length >= 8,
    len12: pw.length >= 12,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    digit: /[0-9]/.test(pw),
    symbol: /[^a-zA-Z0-9]/.test(pw),
    nocommon: pw.length > 0 && !isCommon(pw),
    norepeat: pw.length > 0 && !hasLongRepeat(pw),
    noseq: pw.length > 0 && !hasSequence(pw),
  };

  const bits = entropyBits(pw);
  const penalized = pw.length > 0 && (isCommon(pw) || (hasLongRepeat(pw) && pw.length < 16));

  // score 0-4
  let score;
  if (pw.length === 0) {
    score = -1;
  } else if (penalized) {
    score = 0;
  } else if (bits < 28) {
    score = 0;
  } else if (bits < 45) {
    score = 1;
  } else if (bits < 60) {
    score = 2;
  } else if (bits < 80) {
    score = 3;
  } else {
    score = 4;
  }

  return { checks, bits, score, penalized };
}

const VERDICTS = [
  { label: 'very weak', color: 'var(--red)' },
  { label: 'weak', color: 'var(--red)' },
  { label: 'fair', color: 'var(--amber)' },
  { label: 'strong', color: 'var(--cyan)' },
  { label: 'very strong', color: 'var(--green)' },
];

function render(pw) {
  const { checks, bits, score, penalized } = evaluate(pw);

  statLen.textContent = pw.length;
  statEntropy.innerHTML = `${bits.toFixed(1)} <small>bits</small>`;
  statCharset.textContent = charsetSize(pw) || 0;

  segs.forEach((seg, i) => {
    if (score >= 0 && i <= score) {
      const v = VERDICTS[Math.max(score, 0)];
      seg.style.background = v.color;
    } else {
      seg.style.background = '';
    }
  });

  if (pw.length === 0) {
    verdictEl.textContent = '—';
    verdictEl.style.color = '';
    crackEl.textContent = '';
  } else {
    const v = VERDICTS[Math.max(score, 0)];
    verdictEl.textContent = v.label;
    verdictEl.style.color = v.color;
    crackEl.textContent = crackTimeLabel(bits, penalized);
  }

  checksList.querySelectorAll('li').forEach(li => {
    const key = li.dataset.key;
    li.classList.toggle('ok', !!checks[key]);
  });
}

pwInput.addEventListener('input', () => render(pwInput.value));

toggleBtn.addEventListener('click', () => {
  const isPw = pwInput.type === 'password';
  pwInput.type = isPw ? 'text' : 'password';
  toggleBtn.textContent = isPw ? 'hide' : 'show';
  pwInput.focus();
});

render('');
