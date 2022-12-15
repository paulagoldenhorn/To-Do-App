// SEGURIDAD: Si no se encuentra en localStorage info del usuario
// no lo deja acceder a la página, redirigiendo al login inmediatamente.
if (!localStorage.jwt) { location.replace('./index.html') }

window.onload = () => {
  renderizarSkeletons(3, ".tareas-pendientes");
};    

/* ------ comienzan las funcionalidades una vez que carga el documento ------ */
window.addEventListener('load', function () {

  /* ---------------- variables globales y llamado a funciones ---------------- */
  const endpoint = 'http://todo-api.ctd.academy:3000/v1/'
  const endpointTareas = `${endpoint}tasks`
  const endpointUsuario = `${endpoint}users/getMe`
  const token = JSON.parse(localStorage.jwt)

  const formCrearTarea = document.querySelector('.nueva-tarea')
  const nuevaTarea = document.querySelector('#nuevaTarea')
  const btnCerrarSesion = document.querySelector('#closeApp')

  obtenerNombreUsuario()
  consultarTareas()
  
  /* -------------------------------------------------------------------------- */
  /*                          FUNCIÓN 1 - Cerrar sesión                         */
  /* -------------------------------------------------------------------------- */

  btnCerrarSesion.addEventListener('click', function () {
    
    //const cerrarSesion = confirm('¿Desea cerrar sesión?')

    // Eliminar info localStorage y redirigir al main   
    Swal.fire({
      title: '¿Desea cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Sesión cerrada correctamente','Nos vemos!','success')
        localStorage.clear()
        location.replace('./index.html')
      }
    })

  });

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 2 - Obtener nombre de usuario [GET]                */
  /* -------------------------------------------------------------------------- */

  function obtenerNombreUsuario() {

    // Configuracion del request
    const settings = {
      method: 'GET',
      headers: {
        authorization: token
      }
    }

    // Renderizar nombre de usuario
   fetch(endpointUsuario, settings)
    .then(response => response.json())
    .then(data => {
      const nombreUsuario = document.querySelector('.user-info p')
      nombreUsuario.innerText = data.firstName
    })
    .catch(error => console.log(error));

  };


  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 3 - Obtener listado de tareas [GET]                */
  /* -------------------------------------------------------------------------- */

  function consultarTareas() {
    
    // Configuracion del request
    const settings = {
      method: 'GET',
      headers: {
        authorization: token
      }
    }

    fetch(endpointTareas, settings) 
      .then(response => response.json())
      .then(tareas => {
        renderizarTareas(tareas)
        botonesCambioEstado()
        botonBorrarTarea()
      })
      .catch(error => console.log(error));

  };

  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 4 - Crear nueva tarea [POST]                    */
  /* -------------------------------------------------------------------------- */

  formCrearTarea.addEventListener('submit', function (event) {
    
    event.preventDefault()

     // Cuerpo del request de la tarea
    const tarea = {
      description: nuevaTarea.value.trim(),
    }

    // Configuracion del request
    const settings = {
      method: 'POST',
      body: JSON.stringify(tarea),
      headers: {
        'Content-type': 'application/json',
        authorization: token
      }
    }

    fetch(endpointTareas, settings)
      .then(response => response.json())
      .then(tareas => {
        if (tareas.status === 400) console.log('Alguno de los datos requeridos está incompleto');
        if (tareas.status === 401) console.log('Requiere Autorización');
        if (tareas.status === 500) console.log('Error del servidor');        
        removerSkeleton('.tareas-pendientes')
        consultarTareas()
      })
      .catch(error => {
        console.log(error)
        removerSkeleton('.tareas-pendientes') 
      });

    // Limpiar form
    formCrearTarea.reset()
   
  });


  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 5 - Renderizar tareas en pantalla                 */
  /* -------------------------------------------------------------------------- */
  function renderizarTareas(listado) {

    const tareasPendientes = document.querySelector('.tareas-pendientes')
    const tareasTerminadas = document.querySelector('.tareas-terminadas')
    
    // Capturar contador de tareas finalizadas
    const numeroDeTareas = document.getElementById('cantidad-finalizadas')
    let contador = 0

    // Limpiar caja cada vez que renderiza
    tareasPendientes.innerHTML = ""
    tareasTerminadas.innerHTML = ""


    listado.forEach(tarea => {
      
      let fecha = new Date(tarea.createdAt)
      
      // Verificar si la tarea esta completa
      if (tarea.completed) {
        contador++

        tareasTerminadas.innerHTML += `
        <li class="tarea">
          <div class="hecha">
            <i class="fa-regular fa-circle-check"></i>
          </div>
          <div class="descripcion">
            <p class="nombre">${tarea.description}</p>
            <div class="cambios-estados">
              <button class="change completa" id="${tarea.id}"><i class="fa-solid fa-rotate-left"></i></button>
              <button class="borrar" id="${tarea.id}"><i class="fa-regular fa-trash-can"></i></button>
            </div>
          </div>
        </li>
        `
      }
      else {
        tareasPendientes.innerHTML += `
        <li class="tarea">
          <button class="change" id="${tarea.id}"><i class="fa-regular fa-circle"></i></button>
          <div class="descripcion">
            <p class="nombre">${tarea.description}</p>
            <p class="timestamp">${fecha.toLocaleDateString()}</p>
          </div>
        </li>
        `
      }

    })
    
    // Rellenar contador
    numeroDeTareas.innerText = contador

  };

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 6 - Cambiar estado de tarea [PUT]                 */
  /* -------------------------------------------------------------------------- */
  function botonesCambioEstado() {
    
    const btnCambioEstado = document.querySelectorAll('.change')

    btnCambioEstado.forEach(boton => {

      boton.addEventListener('click', function () {

        const id = boton.id
        const url = `${endpointTareas}/${id}`
        const payload = {}

        // TOGGLE: Si el boton esta completo, mando al servidor que esta incompleto para renderizarlo correctamente
        if (boton.classList.contains('completa')) payload.completed = false
        else payload.completed = true

        // Cuerpo del request (actualiza valor completed del boton)
        const settings = {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: {
            authorization: token,
            "Content-type": "application/json"
          } 
        }

        fetch(url, settings)
        .then(response => {
          if (response.status === 400) console.log('ID Inválido');
          if (response.status === 401) console.log('Requiere Autorización');
          if (response.status === 404) console.log('Tarea inexistente');
          if (response.status === 500) console.log('Error del servidor');
          // Pedir tareas y re-renderizarlas
          consultarTareas()
        })
    
      })

    })

  }


  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 7 - Eliminar tarea [DELETE]                    */
  /* -------------------------------------------------------------------------- */
  function botonBorrarTarea() {
   
    const btnBorrarTarea = document.querySelectorAll('.borrar')

    btnBorrarTarea.forEach(boton => {

      boton.addEventListener('click', function() {

        const id = boton.id
        const url = `${endpointTareas}/${id}`
        
        const settings = {
          method: 'DELETE',
          headers: {
            authorization: token
          }
        }

        fetch(url, settings)
        .then(response => {
          if (response.status === 400) console.log('ID Inválido');
          if (response.status === 401) console.log('Requiere Autorización');
          if (response.status === 404) console.log('Tarea inexistente');
          if (response.status === 500) console.log('Error del servidor');
          // Pedir tareas y re-renderizarlas
          consultarTareas()
        })

      })

    })
    
  };

});