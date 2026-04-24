// Form data tracking
const formData = {};
const totalFields = 12;

// Mapeamento de Estados para UF
const stateToUF = {
    'Acre': 'AC',
    'Alagoas': 'AL',
    'Amapá': 'AP',
    'Amazonas': 'AM',
    'Bahia': 'BA',
    'Ceará': 'CE',
    'Distrito Federal': 'DF',
    'Espírito Santo': 'ES',
    'Goiás': 'GO',
    'Maranhão': 'MA',
    'Mato Grosso': 'MT',
    'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG',
    'Pará': 'PA',
    'Paraíba': 'PB',
    'Paraná': 'PR',
    'Pernambuco': 'PE',
    'Piauí': 'PI',
    'Rio de Janeiro': 'RJ',
    'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS',
    'Rondônia': 'RO',
    'Roraima': 'RR',
    'Santa Catarina': 'SC',
    'São Paulo': 'SP',
    'Sergipe': 'SE',
    'Tocantins': 'TO'
};

// All inputs
const inputs = {
    fullName: document.getElementById('fullName'),
    cpf: document.getElementById('cpf'),
    birthDate: document.getElementById('birthDate'),
    phone: document.getElementById('phone'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword'),
    cep: document.getElementById('cep'),
    street: document.getElementById('street'),
    neighborhood: document.getElementById('neighborhood'),
    city: document.getElementById('city'),
    state: document.getElementById('state'),
    uf: document.getElementById('uf'),
    number: document.getElementById('number'),
    complement: document.getElementById('complement')
};

// Set max date for birthDate (today)
const today = new Date().toISOString().split('T')[0];
inputs.birthDate.setAttribute('max', today);

// Set min date for birthDate (100 years ago)
const minDate = new Date();
minDate.setFullYear(minDate.getFullYear() - 100);
inputs.birthDate.setAttribute('min', minDate.toISOString().split('T')[0]);

// Password toggle - MELHORADO PARA FICAR DENTRO DO INPUT
document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.dataset.target;
        const input = document.getElementById(target);
        const isPassword = input.type === 'password';

        input.type = isPassword ? 'text' : 'password';
        this.innerHTML = isPassword
            ? '<i class="bi bi-eye-slash"></i>'
            : '<i class="bi bi-eye"></i>';

        this.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
    });
});

// ===== VALIDAÇÃO DE CPF COM DÍGITOS VERIFICADORES =====
function validateCPFDigits(cpf) {
    // Remove formatação
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (CPF inválido)
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Calcula primeiro dígito verificador
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    // Calcula segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

// Format CPF
inputs.cpf.addEventListener('input', function () {
    let value = this.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
        value = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6, 9) + '-' + value.slice(9);
    } else if (value.length > 3) {
        value = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6);
    } else if (value.length > 0) {
        value = value.slice(0, 3) + '.' + value.slice(3);
    }

    this.value = value;
});

// Format phone
inputs.phone.addEventListener('input', function () {
    let value = this.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 7) {
        value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7);
    } else if (value.length > 2) {
        value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
    } else if (value.length > 0) {
        value = '(' + value.slice(0, 2);
    }

    this.value = value;
});

// Format CEP
inputs.cep.addEventListener('input', function () {
    let value = this.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);

    if (value.length > 5) {
        value = value.slice(0, 5) + '-' + value.slice(5);
    }

    this.value = value;
    
    // Valida CEP em tempo real quando completa 8 dígitos
    if (value.replace(/\D/g, '').length === 8) {
        validateCEP();
    }
});

// Link entre State e UF
inputs.state.addEventListener('change', function () {
    const uf = stateToUF[this.value];
    if (uf) {
        inputs.uf.value = uf;
        validateUf();
    } else {
        inputs.uf.value = '';
    }
    validateState();
    updateProgress();
});

// ===== FUNÇÕES DE VALIDAÇÃO =====

function validateFullName() {
    const name = inputs.fullName.value.trim();
    const nameRegex = /^[a-záéíóúâêôãõç\s]{3,}$/i;

    if (!name) {
        showError('fullName', 'Nome completo é obrigatório');
        return false;
    } else if (!nameRegex.test(name)) {
        showError('fullName', 'Nome inválido (mínimo 3 caracteres)');
        return false;
    } else {
        clearError('fullName');
        showSuccess('fullName');
        return true;
    }
}

function validateCPF() {
    const cpf = inputs.cpf.value.replace(/\D/g, '');

    if (!cpf) {
        showError('cpf', 'CPF é obrigatório');
        return false;
    } else if (cpf.length !== 11) {
        showError('cpf', 'CPF deve ter 11 dígitos');
        return false;
    } else if (!validateCPFDigits(cpf)) {
        showError('cpf', 'CPF inválido');
        return false;
    }

    clearError('cpf');
    showSuccess('cpf');
    return true;
}

function validateBirthDate() {
    const date = inputs.birthDate.value;

    if (!date) {
        showError('birthDate', 'Data de nascimento é obrigatória');
        return false;
    }

    const birthDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 18) {
        showError('birthDate', 'Você deve ter no mínimo 18 anos');
        return false;
    }

    if (age > 120) {
        showError('birthDate', 'Data de nascimento inválida');
        return false;
    }

    clearError('birthDate');
    showSuccess('birthDate');
    return true;
}

function validatePhone() {
    const phone = inputs.phone.value.replace(/\D/g, '');

    if (!phone) {
        showError('phone', 'Telefone é obrigatório');
        return false;
    } else if (phone.length !== 11) {
        showError('phone', 'Telefone inválido');
        return false;
    }

    clearError('phone');
    showSuccess('phone');
    return true;
}

function validateEmail() {
    const email = inputs.email.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        showError('email', 'E-mail é obrigatório');
        return false;
    } else if (!emailRegex.test(email)) {
        showError('email', 'E-mail inválido');
        return false;
    }

    clearError('email');
    showSuccess('email');
    return true;
}

function validatePassword() {
    const password = inputs.password.value;

    if (!password) {
        showError('password', 'Senha é obrigatória');
        return false;
    } else if (password.length < 8) {
        showError('password', 'Mínimo 8 caracteres');
        return false;
    }

    updatePasswordStrength(password);

    clearError('password');
    showSuccess('password');
    return true;
}

function validateConfirmPassword() {
    const password = inputs.password.value;
    const confirmPassword = inputs.confirmPassword.value;

    if (!confirmPassword) {
        showError('confirmPassword', 'Confirmação de senha é obrigatória');
        return false;
    } else if (password !== confirmPassword) {
        showError('confirmPassword', 'As senhas não coincidem');
        return false;
    }

    clearError('confirmPassword');
    showSuccess('confirmPassword');
    return true;
}

// ===== VALIDAÇÃO DE CEP COM API REAL =====
function validateCEP() {
    const cep = inputs.cep.value.replace(/\D/g, '');

    if (!cep) {
        showError('cep', 'CEP é obrigatório');
        return false;
    } else if (cep.length !== 8) {
        showError('cep', 'CEP inválido');
        return false;
    }

    // Valida com a API ViaCEP em tempo real
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                showError('cep', 'CEP não encontrado');
            } else {
                clearError('cep');
                showSuccess('cep');
            }
        })
        .catch(error => {
            // Se der erro na API, apenas valida o formato
            clearError('cep');
            showSuccess('cep');
        });

    return true;
}

function validateStreet() {
    const street = inputs.street.value.trim();

    if (!street) {
        showError('street', 'Rua/Avenida é obrigatória');
        return false;
    }

    clearError('street');
    showSuccess('street');
    return true;
}

function validateNumber() {
    const number = inputs.number.value.trim();

    if (!number) {
        showError('number', 'Número é obrigatório');
        return false;
    }

    clearError('number');
    showSuccess('number');
    return true;
}

function validateNeighborhood() {
    const neighborhood = inputs.neighborhood.value.trim();

    if (!neighborhood) {
        showError('neighborhood', 'Bairro é obrigatório');
        return false;
    }

    clearError('neighborhood');
    showSuccess('neighborhood');
    return true;
}

function validateCity() {
    const city = inputs.city.value.trim();

    if (!city) {
        showError('city', 'Cidade é obrigatória');
        return false;
    }

    clearError('city');
    showSuccess('city');
    return true;
}

function validateState() {
    const state = inputs.state.value;

    if (!state) {
        showError('state', 'Estado é obrigatório');
        return false;
    }

    clearError('state');
    showSuccess('state');
    return true;
}

function validateUf() {
    const uf = inputs.uf.value;

    if (!uf) {
        showError('uf', 'UF é obrigatório');
        return false;
    }

    clearError('uf');
    showSuccess('uf');
    return true;
}

function updatePasswordStrength(password) {
    const strengthEl = document.getElementById('passwordStrength');
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');

    strengthEl.classList.add('show');

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    strengthBar.className = 'password-strength-bar';
    strengthText.className = 'password-strength-text show';

    if (strength === 1) {
        strengthBar.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.textContent = 'Senha fraca';
    } else if (strength === 2 || strength === 3) {
        strengthBar.classList.add('medium');
        strengthText.classList.add('medium');
        strengthText.textContent = 'Senha média';
    } else {
        strengthBar.classList.add('strong');
        strengthText.classList.add('strong');
        strengthText.textContent = 'Senha forte';
    }
}

function showError(fieldName, message) {
    const input = inputs[fieldName];
    const errorEl = document.getElementById(fieldName + 'Error');
    const checkEl = document.getElementById(fieldName + 'Check');

    input.classList.remove('success');
    input.classList.add('error');
    errorEl.textContent = message;
    errorEl.classList.add('show');
    if (checkEl) checkEl.classList.remove('show');
}

function clearError(fieldName) {
    const errorEl = document.getElementById(fieldName + 'Error');
    errorEl.classList.remove('show');
    errorEl.textContent = '';
}

function showSuccess(fieldName) {
    const input = inputs[fieldName];
    const checkEl = document.getElementById(fieldName + 'Check');

    input.classList.remove('error');
    input.classList.add('success');
    if (checkEl) checkEl.classList.add('show');
}

// ===== EVENT LISTENERS PARA VALIDAÇÃO EM TEMPO REAL =====
inputs.fullName.addEventListener('blur', validateFullName);
inputs.cpf.addEventListener('blur', validateCPF);
inputs.birthDate.addEventListener('blur', validateBirthDate);
inputs.phone.addEventListener('blur', validatePhone);
inputs.email.addEventListener('blur', validateEmail);
inputs.password.addEventListener('blur', validatePassword);
inputs.password.addEventListener('input', function () {
    if (this.value) updatePasswordStrength(this.value);
});
inputs.confirmPassword.addEventListener('blur', validateConfirmPassword);
inputs.password.addEventListener('input', validateConfirmPassword);
inputs.cep.addEventListener('blur', validateCEP);
inputs.street.addEventListener('blur', validateStreet);
inputs.number.addEventListener('blur', validateNumber);
inputs.neighborhood.addEventListener('blur', validateNeighborhood);
inputs.city.addEventListener('blur', validateCity);
inputs.state.addEventListener('blur', validateState);
inputs.uf.addEventListener('blur', validateUf);

// ===== ATUALIZAR BARRA DE PROGRESSO =====
function updateProgress() {
    let filled = 0;

    if (inputs.fullName.classList.contains('success')) filled++;
    if (inputs.cpf.classList.contains('success')) filled++;
    if (inputs.birthDate.classList.contains('success')) filled++;
    if (inputs.phone.classList.contains('success')) filled++;
    if (inputs.email.classList.contains('success')) filled++;
    if (inputs.password.classList.contains('success')) filled++;
    if (inputs.confirmPassword.classList.contains('success')) filled++;
    if (inputs.cep.classList.contains('success')) filled++;
    if (inputs.street.classList.contains('success')) filled++;
    if (inputs.neighborhood.classList.contains('success')) filled++;
    if (inputs.city.classList.contains('success')) filled++;
    if (inputs.uf.classList.contains('success')) filled++;

    const percentage = (filled / 12) * 100;
    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('progressText').textContent = filled + '/12 campos preenchidos';

    if (filled === 12 && !window.alreadyScrolledToTop) {
        // Scroll na janela inteira (mobile)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Scroll no container interno (desktop)
        const contentContainer = document.querySelector('.signup-content');
        if (contentContainer) {
            contentContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        window.alreadyScrolledToTop = true;
    } else if (filled < 12) {
        window.alreadyScrolledToTop = false;
    }
}

// Update progress on input change
Object.values(inputs).forEach(input => {
    if (input) {
        input.addEventListener('change', updateProgress);
        input.addEventListener('input', updateProgress);
    }
});

// ===== BUSCA DE CEP COM PREENCHIMENTO AUTOMÁTICO =====
document.getElementById('searchCepBtn').addEventListener('click', function (e) {
    e.preventDefault();

    const cep = inputs.cep.value.replace(/\D/g, '');
    if (cep.length !== 8) {
        showError('cep', 'CEP inválido');
        return;
    }

    const cepLoading = document.getElementById('cepLoading');
    cepLoading.classList.add('show');
    this.disabled = true;

    // Faz requisição à API ViaCEP
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                showError('cep', 'CEP não encontrado');
                cepLoading.classList.remove('show');
                this.disabled = false;
                return;
            }

            // Preenche os campos com os dados retornados
            inputs.street.value = data.logradouro || '';
            inputs.neighborhood.value = data.bairro || '';
            inputs.city.value = data.localidade || '';
            inputs.state.value = data.uf;
            inputs.uf.value = data.uf;

            // Valida todos os campos preenchidos
            validateStreet();
            validateNeighborhood();
            validateCity();
            validateState();
            validateUf();
            validateCEP();
            updateProgress();

            cepLoading.classList.remove('show');
            this.disabled = false;
        })
        .catch(error => {
            showError('cep', 'Erro ao buscar CEP. Tente novamente.');
            cepLoading.classList.remove('show');
            this.disabled = false;
        });
});

// ===== SUBMIT DO FORMULÁRIO =====
document.getElementById('signupBtn').addEventListener('click', function (e) {
    e.preventDefault();

    // Valida todos os campos
    const validations = [
        validateFullName(),
        validateCPF(),
        validateBirthDate(),
        validatePhone(),
        validateEmail(),
        validatePassword(),
        validateConfirmPassword(),
        validateCEP(),
        validateStreet(),
        validateNumber(),
        validateNeighborhood(),
        validateCity(),
        validateState(),
        validateUf()
    ];

    if (!validations.every(v => v)) {
        return;
    }

    // Show loading
    this.disabled = true;
    this.classList.add('loading');
    this.textContent = '';

    // Envio do formulário
    fetch("/clientes/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nome: inputs.fullName.value,
            cpf: inputs.cpf.value,
            telefone: inputs.phone.value,
            data:inputs.birthDate.value,
            email: inputs.email.value,
            senha: inputs.password.value,
            rua: inputs.street.value,
            numero: inputs.number.value,
            bairro: inputs.neighborhood.value,
            cidade: inputs.city.value,
            estado: inputs.state.value,
            uf: inputs.uf.value,
            cep: inputs.cep.value
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Cadastro realizado!",
                    text: data.msg || "Conta criada com sucesso",
                    timer: 2000,
                    showConfirmButton: false
                });

                setTimeout(() => {
                    window.location.href = "/login/";
                }, 2000);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Erro",
                    text: data.msg || "Erro ao cadastrar",
                    timer: 2500
                });

                // Reseta o botão
                this.disabled = false;
                this.classList.remove('loading');
                this.textContent = '';
                const icon = document.createElement('i');
                icon.className = 'bi bi-check-circle me-2';
                this.appendChild(icon);
                this.appendChild(document.createTextNode('Criar Conta'));
            }
        })
        .catch(error => {
            Swal.fire({
                icon: "error",
                title: "Erro na conexão",
                text: "Erro ao enviar dados. Tente novamente.",
                timer: 2500
            });

            // Reseta o botão
            this.disabled = false;
            this.classList.remove('loading');
            this.textContent = '';
            const icon = document.createElement('i');
            icon.className = 'bi bi-check-circle me-2';
            this.appendChild(icon);
            this.appendChild(document.createTextNode('Criar Conta'));
        });
});

// Prevent form submission
document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();
});