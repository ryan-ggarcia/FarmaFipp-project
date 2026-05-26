
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const passwordToggle = document.getElementById('passwordToggle');
const successMessage = document.getElementById('successMessage');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

// Password toggle
passwordToggle.addEventListener('click', function () {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    this.innerHTML = isPassword
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';

    // Animation
    this.style.transform = 'scale(1.2)';
    setTimeout(() => {
        this.style.transform = 'scale(1)';
    }, 200);
});

// Prevent form submission
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
});

// Input validation and focus effects
emailInput.addEventListener('focus', function () {
    this.parentElement.style.transform = 'translateY(-2px)';
});

emailInput.addEventListener('blur', function () {
    this.parentElement.style.transform = 'translateY(0)';
});

passwordInput.addEventListener('focus', function () {
    this.parentElement.style.transform = 'translateY(-2px)';
});

passwordInput.addEventListener('blur', function () {
    this.parentElement.style.transform = 'translateY(0)';
});

// Validate email format
emailInput.addEventListener('input', function () {
    const email = this.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
        this.classList.add('error');
        emailError.textContent = 'E-mail inválido';
        emailError.classList.add('show');
    } else {
        this.classList.remove('error');
        emailError.classList.remove('show');
    }
});

// Validate password length
passwordInput.addEventListener('input', function () {
    if (this.value && this.value.length < 6) {
        this.classList.add('error');
        passwordError.textContent = 'Mínimo 6 caracteres';
        passwordError.classList.add('show');
    } else {
        this.classList.remove('error');
        passwordError.classList.remove('show');
    }
});

// Login button click
loginBtn.addEventListener('click', function () {
    const email = emailInput.value;
    const password = passwordInput.value;
    const useFor = document.querySelector('input[name="usefor"]:checked').value;

    // Reset errors
    emailError.classList.remove('show');
    passwordError.classList.remove('show');
    emailInput.classList.remove('error');
    passwordInput.classList.remove('error');

    let hasError = false;

    // Validate
    if (!email) {
        emailError.textContent = 'E-mail obrigatório';
        emailError.classList.add('show');
        emailInput.classList.add('error');
        hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = 'E-mail inválido';
        emailError.classList.add('show');
        emailInput.classList.add('error');
        hasError = true;
    }

    if (!password) {
        passwordError.textContent = 'Senha obrigatória';
        passwordError.classList.add('show');
        passwordInput.classList.add('error');
        hasError = true;
    } else if (password.length < 6) {
        passwordError.textContent = 'Mínimo 6 caracteres';
        passwordError.classList.add('show');
        passwordInput.classList.add('error');
        hasError = true;
    }

    if (hasError) return;

    // Show loading state
    loginBtn.disabled = true;
    loginBtn.classList.add('loading');
    loginBtn.textContent = '';

    // FETCH
    fetch("/login/efetuarLogin", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            senha: password
        })
    }).then(function (res) {
        return res.json()
    }).then(function (result) {
        if (result) {
            if (result.ok) {
                successMessage.classList.add('show');

                // Aguarda 2 segundos e redireciona
                if (result.perfil == 1) {
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 2000);
                }
                if(result.perfil == 3){
                    setTimeout(() => {
                        window.location.href = "/admin/";
                    }, 2000);
                }
            } else {
                Swal.fire({
                    title: "Erro...",
                    text: result.msg,
                    icon: "error",
                    timer: 1500
                })
                loginBtn.disabled = false;
                loginBtn.classList.remove('loading');
                loginBtn.textContent = 'Entrar';
            }
        } else {
            Swal.fire({
                icon: "error",
                title: "Erro no envio de dados",
                text: "Resposta inesperada do servidor",
                timer: 1500
            })
            loginBtn.disabled = false;
            loginBtn.classList.remove('loading');
            loginBtn.textContent = 'Entrar';
        }
    }).catch(function (error) {
        console.error('Erro na requisição de login:', error);
        Swal.fire({
            icon: "error",
            title: "Erro de conexão",
            text: "Não foi possível conectar ao servidor. Tente novamente.",
            timer: 2500
        })
        loginBtn.disabled = false;
        loginBtn.classList.remove('loading');
        loginBtn.textContent = 'Entrar';
    })

    // // Simulate login process
    // setTimeout(() => {
    //     // Show success message
    //     successMessage.classList.add('show');

    //     // Reset button
    //     loginBtn.disabled = false;
    //     loginBtn.classList.remove('loading');
    //     loginBtn.textContent = 'Entrar';

    //     // Log info (you can replace with API call)
    //     console.log({
    //         email: email,
    //         password: '***',
    //         useFor: useFor,
    //         timestamp: new Date().toLocaleTimeString('pt-BR')
    //     });

    //     // Clear form
    //     setTimeout(() => {
    //         emailInput.value = '';
    //         passwordInput.value = '';
    //         successMessage.classList.remove('show');
    //     }, 2000);
    // }, 1500);
});

// Enter key to login
passwordInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

// Radio button selection animation
document.querySelectorAll('input[name="usefor"]').forEach(radio => {
    radio.addEventListener('change', function () {
        const label = this.nextElementSibling;
        label.style.transform = 'scale(0.95)';
        setTimeout(() => {
            label.style.transform = 'scale(1)';
        }, 200);
    });
});