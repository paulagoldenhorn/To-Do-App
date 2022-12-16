window.addEventListener('load', function () {
    /* ---------------------- obtenemos variables globales ---------------------- */
    const form = document.forms[0]
    const campoEmail = document.getElementById('inputEmail')
    const campoPassword = document.getElementById('inputPassword')
    const endpoint = 'http://todo-api.ctd.academy:3000/v1/users/login'
    const btnIngresar = document.querySelector('button')   
    const contenedorError = document.createElement('div') 
    
    /* ---------------------- Renderizar errores ---------------------- */
    function renderizarError(error, posicion) {
        const errorTexto = document.createElement('p')
        errorTexto.innerText = error
        errorTexto.style = 'display: flex; color: #ff4949; font-size: 14px; margin-top: 1rem '
        posicion.appendChild(errorTexto)
    }

    /* -------------------------------------------------------------------------- */
    /*            FUNCIÓN 1: Escuchamos el submit y preparamos el envío           */
    /* -------------------------------------------------------------------------- */
    form.addEventListener('submit', function (event) {
       
        event.preventDefault()

        // Mostrar spinner para indicar que se ha iniciado el proceso de registro
        mostrarSpinner()

        // Cuerpo del request
        const payload = {
            email: campoEmail.value,
            password: campoPassword.value
        }

        // Configuracion del request
        const settings = {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-type': 'application/json'
            }
        }

        // Enviar request a la API
        realizarLogin(settings)

        // Limpiar campos del form
        form.reset()

    });


    /* -------------------------------------------------------------------------- */
    /*                     FUNCIÓN 2: Realizar el login [POST]                    */
    /* -------------------------------------------------------------------------- */
    function realizarLogin(settings) {
        
        fetch(endpoint, settings)
            .then( response => { 
                // Insertar contenedor de errores y limpiarlo
                btnIngresar.insertAdjacentElement('afterend', contenedorError)
                contenedorError.innerHTML = ' '
                
                // Renderizar errores
                if (response.status === 400) {
                    Swal.fire({ icon: 'error', title: 'Contraseña incorrecta' })
                } 
                if (response.status === 404) {
                    Swal.fire('El usuario no existe')
                } 
                if (response.status === 500) {
                    Swal.fire('Error del servidor')
                } 
                // Ocultamos el spinner
                ocultarSpinner()
                return response.json() 
            })
            .then( data => {                

                if (data.jwt) {
                    console.log('Promesa aceptada') 
                    // Guardar JWT en local storage
                    localStorage.setItem('jwt', JSON.stringify(data.jwt))
                    // Redirigir a pagina de tareas
                    location.replace('./mis-tareas.html')
                }

            })
            .catch( error => {
                console.log('Promesa rechazada')
                console.log(error)
                ocultarSpinner()
            });
    
    };

});
