/* ---------------------------------- texto --------------------------------- */
function validarTexto(texto) {
    return texto.length > 1 && texto.length < 20
}

function normalizarTexto(texto) {
    return texto.trim().toLowerCase()
}

/* ---------------------------------- email --------------------------------- */
function validarEmail(email) {
    const regex = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
    return regex.test(email)
}

function normalizarEmail(email) {
    return email.toLowerCase()
}

/* -------------------------------- password -------------------------------- */
function validarContrasenia(contrasenia) {
    return contrasenia.length > 8
}

function compararContrasenias(contrasenia_1, contrasenia_2) {
    return contrasenia_1 === contrasenia_2
}

