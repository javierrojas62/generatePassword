// Conjuntos de caracteres
const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: '0Ol1I'
};

// Función para cambiar tema
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const themeToggle = document.querySelector('.theme-toggle');

    if (body.getAttribute('data-theme') === 'light') {
        // Cambiar a modo oscuro
        body.removeAttribute('data-theme');
        themeIcon.className = 'theme-icon-moon';
        themeToggle.title = 'Cambiar a modo claro';
        localStorage.setItem('theme', 'dark');
    } else {
        // Cambiar a modo claro
        body.setAttribute('data-theme', 'light');
        themeIcon.className = 'theme-icon-sun';
        themeToggle.title = 'Cambiar a modo oscuro';
        localStorage.setItem('theme', 'light');
    }
}

// Cargar tema (siempre inicia en oscuro)
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('themeIcon');
    const themeToggle = document.querySelector('.theme-toggle');

    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        themeIcon.className = 'theme-icon-sun';
        themeToggle.title = 'Cambiar a modo oscuro';
    } else {
        // Siempre inicia en modo oscuro
        document.body.removeAttribute('data-theme');
        themeIcon.className = 'theme-icon-moon';
        themeToggle.title = 'Cambiar a modo claro';
    }
}

// Referencias a elementos
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');
const passwordDisplay = document.getElementById('passwordDisplay');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const passwordLength = document.getElementById('passwordLength');
const copyBtn = document.getElementById('copyBtn');

// Actualizar valor de longitud
lengthSlider.addEventListener('input', (e) => {
    lengthValue.textContent = e.target.value;
    generatePassword();
});

// Listeners para checkboxes
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', generatePassword);
});

// Listener para caracteres personalizados
document.getElementById('customChars').addEventListener('input', generatePassword);

function generatePassword() {
    const length = parseInt(lengthSlider.value);
    let charset = '';
    let requiredChars = [];

    // Construir conjunto de caracteres
    if (document.getElementById('uppercase').checked) {
        charset += charSets.uppercase;
        requiredChars.push(getRandomChar(charSets.uppercase));
    }
    if (document.getElementById('lowercase').checked) {
        charset += charSets.lowercase;
        requiredChars.push(getRandomChar(charSets.lowercase));
    }
    if (document.getElementById('numbers').checked) {
        charset += charSets.numbers;
        requiredChars.push(getRandomChar(charSets.numbers));
    }
    if (document.getElementById('symbols').checked) {
        charset += charSets.symbols;
        requiredChars.push(getRandomChar(charSets.symbols));
    }

    // Agregar caracteres personalizados
    const customChars = document.getElementById('customChars').value;
    if (customChars) {
        charset += customChars;
    }

    // Remover caracteres similares si está activado
    if (document.getElementById('avoidSimilar').checked) {
        charset = charset.split('').filter(char => !charSets.similar.includes(char)).join('');
        requiredChars = requiredChars.filter(char => !charSets.similar.includes(char));
    }

    if (charset === '') {
        passwordDisplay.textContent = 'Selecciona al menos un tipo de carácter';
        updateStrengthMeter(0);
        return;
    }

    // Generar contraseña
    let password = '';

    // Agregar caracteres requeridos
    for (const char of requiredChars) {
        password += char;
    }

    // Completar con caracteres aleatorios
    for (let i = password.length; i < length; i++) {
        password += getRandomChar(charset);
    }

    // Mezclar la contraseña
    password = shuffleString(password);

    // Mostrar contraseña
    passwordDisplay.textContent = password;
    passwordDisplay.classList.add('fade-in');
    passwordLength.textContent = `Longitud: ${password.length}`;

    // Evaluar fortaleza
    const strength = calculatePasswordStrength(password);
    updateStrengthMeter(strength);

    // Remover clase de animación después de la animación
    setTimeout(() => {
        passwordDisplay.classList.remove('fade-in');
    }, 500);
}

function getRandomChar(string) {
    const crypto = window.crypto || window.msCrypto;
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return string.charAt(array[0] % string.length);
}

function shuffleString(string) {
    const array = string.split('');
    const crypto = window.crypto || window.msCrypto;

    for (let i = array.length - 1; i > 0; i--) {
        const randomArray = new Uint32Array(1);
        crypto.getRandomValues(randomArray);
        const j = randomArray[0] % (i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array.join('');
}

function calculatePasswordStrength(password) {
    let score = 0;
    const length = password.length;

    // Puntos por longitud
    if (length >= 12) score += 25;
    else if (length >= 8) score += 15;
    else if (length >= 6) score += 10;
    else score += 5;

    // Puntos por variedad de caracteres
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

    const varietyCount = [hasUpper, hasLower, hasNumbers, hasSymbols].filter(Boolean).length;
    score += varietyCount * 15;

    // Bonificación por longitud extra
    if (length >= 16) score += 10;
    if (length >= 20) score += 10;

    // Penalización por patrones repetitivos
    if (/(.)\1{2,}/.test(password)) score -= 10;
    if (/123|abc|qwe/i.test(password)) score -= 15;

    return Math.min(100, Math.max(0, score));
}

function updateStrengthMeter(strength) {
    let strengthClass = '';
    let strengthLabel = '';

    if (strength < 30) {
        strengthClass = 'strength-weak';
        strengthLabel = 'Débil';
    } else if (strength < 60) {
        strengthClass = 'strength-medium';
        strengthLabel = 'Media';
    } else if (strength < 80) {
        strengthClass = 'strength-strong';
        strengthLabel = 'Fuerte';
    } else {
        strengthClass = 'strength-very-strong';
        strengthLabel = 'Muy Fuerte';
    }

    strengthFill.className = `strength-fill ${strengthClass}`;
    strengthFill.style.width = `${strength}%`;
    strengthText.textContent = `Seguridad: ${strengthLabel} (${strength}%)`;
}

function copyPassword() {
    const password = passwordDisplay.textContent;

    if (password === 'Haz clic en "Generar" para crear tu contraseña' ||
        password === 'Selecciona al menos un tipo de carácter') {
        return;
    }

    navigator.clipboard.writeText(password).then(() => {
        // Feedback visual
        const originalContent = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> ¡Copiada!';
        copyBtn.classList.add('pulse');
        copyBtn.style.background = 'var(--success-color)';

        setTimeout(() => {
            copyBtn.innerHTML = originalContent;
            copyBtn.classList.remove('pulse');
            copyBtn.style.background = 'var(--primary-color)';
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar: ', err);
        // Fallback para navegadores más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = password;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        // Mostrar feedback de éxito
        const originalContent = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> ¡Copiada!';
        copyBtn.style.background = 'var(--success-color)';

        setTimeout(() => {
            copyBtn.innerHTML = originalContent;
            copyBtn.style.background = 'var(--primary-color)';
        }, 2000);
    });
}

function clearPassword() {
    passwordDisplay.textContent = 'Haz clic en "Generar" para crear tu contraseña';
    updateStrengthMeter(0);
    passwordLength.textContent = 'Longitud: 0';
}

// Generar contraseña inicial
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    generatePassword();
});