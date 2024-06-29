const consortiumTokenAuth = localStorage.TokenAuth
// const actual_host = location.hostname
axios = axios.create({
    baseUrl: location.host,
    headers: {
    'Authorization': consortiumTokenAuth ? `JWT ${consortiumTokenAuth}` : ''
    }
})

// let username = document.getElementById("id_username").value;
// let password1 = document.getElementById("id_password").value;

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form')
    
    loginForm.addEventListener('submit', function (event) {
        
        // var password = document.getElementById("id_password");
        event.preventDefault()

        axios({
            method:'post',
            url: '/api/token/auth/',
            data:{
                username: document.getElementById("id_username").value,
                password: document.getElementById("id_password").value
            }
            
        })
        .then(function(response){
            
            let tokenauth = response.data.token
            localStorage.setItem('TokenAuth', tokenauth)
            window.location.replace('/solicitudes/dashboard/')
        })
        .catch(function(error){
            console.log({ error })

            document.getElementById('div_error').innerHTML += `<div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>   <li>Nombre de usuario y/o contraseña incorrecta, Por favor inserte los datos correctamente para continuar </li></strong>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>`
        })
        .then(function(){
            console.log('Siempre se ejecuta')
        })
    })

})
