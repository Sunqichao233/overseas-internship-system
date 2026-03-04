const form = document.getElementById('loginForm');
const statusText = document.getElementById('formStatus');
const sparkles = document.getElementById('sparkles');

const fields = [
    {
        input: document.getElementById('identity'),
        validate(value) {
            if (!value.trim()) {
                return 'Please enter your email or username.';
            }
            return '';
        }
    },
    {
        input: document.getElementById('password'),
        validate(value) {
            if (!value.trim()) {
                return 'Please enter your password.';
            }
            if (value.trim().length < 6) {
                return 'Password must be at least 6 characters.';
            }
            return '';
        }
    }
];

function renderFieldState(input, message) {
    const errorElement = input.parentElement.querySelector('.field__error');
    errorElement.textContent = message;
    input.classList.toggle('is-invalid', Boolean(message));
}

fields.forEach(({ input, validate }) => {
    input.addEventListener('input', () => {
        renderFieldState(input, validate(input.value));
        if (statusText.textContent) {
            statusText.textContent = '';
        }
    });
});

form.addEventListener('submit', (event) => {
    event.preventDefault();

    let hasError = false;

    fields.forEach(({ input, validate }) => {
        const message = validate(input.value);
        renderFieldState(input, message);
        if (message && !hasError) {
            hasError = true;
            input.focus();
        }
    });

    if (hasError) {
        statusText.textContent = 'Please fix the highlighted fields and try again.';
        return;
    }

    statusText.textContent = 'Demo submitted successfully.';
    form.reset();

    fields.forEach(({ input }) => {
        renderFieldState(input, '');
    });
});

for (let i = 0; i < 26; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'sparkle';
    dot.style.left = `${10 + Math.random() * 80}%`;
    dot.style.top = `${8 + Math.random() * 76}%`;
    dot.style.animationDelay = `${Math.random() * 4}s`;
    dot.style.animationDuration = `${3 + Math.random() * 3}s`;
    sparkles.appendChild(dot);
}
