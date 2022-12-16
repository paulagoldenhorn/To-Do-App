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
      errorTexto.id = 'errores'
      errorTexto.innerText = error
      errorTexto.style = 'display: flex; color: #ff4949; font-size: 12px; margin-bottom: 1rem '
      posicion.insertAdjacentElement('afterend', errorTexto)
    }
    /* -------------------------- Resetear errores --------------------------- */
    function resetearErrores() {
      const errores = document.querySelectorAll('#errores')
      errores.forEach(err => { form.removeChild(err) });
    }
    /* -------------------------- Logica icono ver contraseña --------------------------- */
    let iconoVerPassword
    let containerInput
    
    function toggleIcon(campo) {
      iconoVerPassword.addEventListener('click', e => {
        e.preventDefault()
        const typePassword = campo.getAttribute('type')
        if ( typePassword === 'password')  {
          campo.setAttribute('type', 'text') 
        } else {
          campo.setAttribute('type', 'password')
        } 
      })
    }
    
    function crearContainer(campo) {
      // Crear icono
      iconoVerPassword = document.createElement('a')
      iconoVerPassword.innerHTML = '<i class="fa-regular fa-eye"></i>'
      
      // Crear container
      containerInput = document.createElement('div')
      containerInput.setAttribute('id', `container-${campo.id}`)
        
      // Estilos css al container
      containerInput.style = 'display: flex; justify-content: end; align-items: center; margin-bottom: 1rem; width: fit-content'
      
      // Estilos css al input
      campo.style = 'margin-bottom: 0rem; padding: 0.3rem 7rem 0.3rem 1rem'
      
      // Estilos css al icono
      iconoVerPassword.style = 'color: blue; cursor: pointer; position: absolute; padding: 1rem'
     
      toggleIcon(campo)
    }
    
    function inyectarContainer(campo, posicion) {
      crearContainer(campo)
      // Inyectar input al container
      containerInput.appendChild(campo)
      
      // Inyectar icono al container
      containerInput.appendChild(iconoVerPassword)

      // Capturar label correspondiente     
      function capturarLabel() { 
        let label
        form.childNodes.forEach(childLabel => childLabel === posicion ? label = childLabel : '')
        return label
      }
      
      // Inyectar container al form
      capturarLabel().insertAdjacentElement('afterend', containerInput)
    }

    let labelPassword
    form.querySelectorAll('label').forEach(label => label.innerText === 'Contraseña' ? labelPassword = label : '')
    let labelPasswordRepetida
    form.querySelectorAll('label').forEach(label => label.innerText === 'Repetir contraseña' ? labelPasswordRepetida = label : '')

    inyectarContainer(campoPassword, labelPassword)
    inyectarContainer(campoPasswordRepetida, labelPasswordRepetida)

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
        renderizarError('La contraseña debe contener como mínimo 8 caracteres', campoPassword.parentNode)
        datosCorrectos = false
      } 
      
      if (!compararContrasenias(campoPassword.value, campoPasswordRepetida.value)) {
        renderizarError('Por favor, repita la contraseña correctamente', campoPasswordRepetida.parentNode)
        datosCorrectos = false
      }

      return datosCorrectos
    }

    /* -------------------------------------------------------------------------- */
    /*            FUNCIÓN 1: Escuchamos el submit y preparamos el envío           */
    /* -------------------------------------------------------------------------- */ 
    form.addEventListener('submit', function (event) {
      
      event.preventDefault()
      
      resetearErrores()

      // Validar datos antes de crear request
      if (validarDatos()) {
        
        // Mostrar spinner para indicar que se ha iniciado el proceso de registro
        mostrarSpinner()

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
            Swal.fire('El usuario ya se encuentra registrado')
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

        } )
        .catch( error => {
          console.log('Promesa rechazada')
          console.log(error)
          ocultarSpinner()
        });

    };


});