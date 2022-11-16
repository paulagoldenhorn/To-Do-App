window.addEventListener('load', function () {
    /* ---------------------- obtenemos variables globales ---------------------- */
   
    const campoEmail = document.getElementById('inputEmail')
    const campoPassword = document.getElementById('inputPassword')

    /* -------------------------------------------------------------------------- */
    /*            FUNCIÓN 1: Escuchamos el submit y preparamos el envío           */
    /* -------------------------------------------------------------------------- */
    document.forms[0].addEventListener('submit', function (event) {
       
        event.preventDefault()

    });


    /* -------------------------------------------------------------------------- */
    /*                     FUNCIÓN 2: Realizar el login [POST]                    */
    /* -------------------------------------------------------------------------- */
    function realizarLogin(settings) {
       
        fetch('endpoint')
        .then(res => res.json())
        .then(data => console.log(data))
    
    };


});
