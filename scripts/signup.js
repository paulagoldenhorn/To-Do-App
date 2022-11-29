window.addEventListener('load', function () {
    /* ---------------------- obtenemos variables globales ---------------------- */
    const form = this.document.forms[0]
    const campoNombre = document.getElementById('inputNombre')
    const campoApellido = document.getElementById('inputApellido')
    const campoEmail = document.getElementById('inputEmail')
    const campoPassword = document.getElementById('inputPassword')
    const campoPasswordRepetida = document.getElementById('inputPasswordRepetida')
    const endpoint = 'http://todo-api.ctd.academy:3000/v1/users'

    /* -------------------------- Renderizar errores --------------------------- */
    function renderizarError(error, posicion) {
      const errorTexto = document.createElement('p')
      errorTexto.innerText = error
      errorTexto.style = 'display: flex; color: #ff4949; font-size: 12px; margin-bottom: 1rem '
      posicion.insertAdjacentElement('afterend', errorTexto)
    }
    /* ---------------------------- Validar datos ---------------------------- */
    function validarDatos() {
      let datosCorrectos = true

      if (!validarTexto(campoNombre.value)) {
        renderizarError('El campo Nombre no puede contener mas de 20 caracteres', campoNombre)          
        datosCorrectos = false
      }
      
      if (!validarTexto(campoApellido.value)) {     
        renderizarError('El campo Apellido no puede contener mas de 20 caracteres', campoApellido)       
        datosCorrectos = false
      }

      if (!validarEmail(campoEmail.value)) {
        renderizarError('El formato del correo es incorrecto', campoEmail)
        datosCorrectos = false
      }  

      if (!validarContrasenia(campoPassword.value)) {
        renderizarError('La contraseña debe contener como mínimo 8 caracteres', campoPassword)
        datosCorrectos = false
      } 
      
      if (!compararContrasenias(campoPassword.value, campoPasswordRepetida.value)) {
        renderizarError('Por favor, repita la contraseña correctamente', campoPasswordRepetida)
        datosCorrectos = false
      }

      return datosCorrectos
    }

    /* -------------------------------------------------------------------------- */
    /*            FUNCIÓN 1: Escuchamos el submit y preparamos el envío           */
    /* -------------------------------------------------------------------------- */ 
    form.addEventListener('submit', function (event) {
      
      event.preventDefault()

      // Validar datos antes de crear request
      if (validarDatos()) {

        // Cuerpo del request
        const payload = {
          firstName: normalizarTexto(campoNombre.value),
          lastName: normalizarTexto(campoApellido.value),
          email: normalizarEmail(campoEmail.value),
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
        realizarRegister(settings)
  
        // Limpiar campos del form
        form.reset()
      
      }

    });

    /* -------------------------------------------------------------------------- */
    /*                    FUNCIÓN 2: Realizar el signup [POST]                    */
    /* -------------------------------------------------------------------------- */
    function realizarRegister(settings) {
        
      fetch(endpoint, settings)
        .then( response => {
           
          if (response.status === 400) {
            alert('El usuario ya se encuentra registrado')
          }
          if (response.status === 500) {
            alert('Error del servidor')
          }

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

        } )
        .catch( error => {
          console.log('Promesa rechazada')
          console.log(error)
        });

    };


});