moment.locale('es')
flatpickr.localize(flatpickr.l10ns.es);
axios.create({
    baseUrl: location.origin,
})

var monthsName = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Aug","Sep","Oct","Nov","Dec"];

const initializeFlatpickr = (_id) => {
    flatpickr(document.getElementById(_id), {
        dateFormat: 'd-m-Y',
        "disable": [
            function(date) {
                // return true to disable
                return (date.getDay() === 0 || date.getDay() === 6);
            }
        ],
    });
}

document.addEventListener("DOMContentLoaded", function(){                
    // Handler when the DOM is fully loaded
    ResetChart();
    $("#slc_user_month").select2({
        width: '100%',
        theme: 'bootstrap4',
        placeholder: "Seleccione un usuario",
        allowClear: true,
        // multiple: true
    });

    initializeFlatpickr('txt_start')
    initializeFlatpickr('txt_end')
    initializeFlatpickr('fecha_inicio_mensajero');
    initializeFlatpickr('fecha_fin_mensajero');
});

function ResetChart(){
    getEncargosByMensajero()
    EncargosPerZone();
    PriorityByUser();
    EncargoPerUser();
    EncargoPerUserPerMonth();
}


function ClearChart(_parent, _child, _type){
    event.preventDefault()
    var parent = document.getElementById(_parent);
    var child = document.getElementById(_child);
    parent.removeChild(child)
    parent.innerHTML = `<canvas id="${_child}" width="350px" height="250px"></canvas>`

    if(_type == 'zone'){
        var parent = document.getElementById(_parent);
        var child = document.getElementById(_child);
        parent.removeChild(child)
        parent.innerHTML = `<canvas id="${_child}" width="390px" height="250px"></canvas>`
    }
}


function Changes(){
    var pk = document.getElementById('slc_user_month').value;
    var start_date = document.getElementById('txt_start').value;
    start_date != '' ? start_date = moment(start_date, 'DD-MM-Y').format('Y-MM-DD') : ''
    var end_date = document.getElementById('txt_end').value;
    end_date != '' ? end_date = moment(end_date, 'DD-MM-Y').format('Y-MM-DD') : ''
    var team = document.getElementById('slc_team').value;

    EncargoPerUserPerMonth();
    PriorityByUser(pk, start_date, end_date, team);
    EncargoPerUser(pk, start_date, end_date, team);
    EncargosPerZone(pk, start_date, end_date, team);
    document.getElementById('insert-detail-encargos').innerHTML = '';
}

const getEncargos = async (_params) => {
    try {
        return axios.get(`/solicitudes/api/month/users/`, {
                    params: _params 
                })
    } catch (error) {
        console.log({error});
    }
}

const getData = async (_url, _params)  => {
    try {
        return axios.get(_url, {
            params: _params
        })
    } catch (error) {
        console.log({error})
    }
}

async function EncargoPerUserPerMonth(){
    ClearChart('month_parent', 'bar-month')
    var user = document.getElementById('slc_user_month').value
    var start_date = document.getElementById('txt_start').value;
    start_date != '' ? start_date = moment(start_date, 'DD-MM-Y').format('Y-MM-DD') : ''
    var end_date = document.getElementById('txt_end').value;
    end_date != '' ? end_date = moment(end_date, 'DD-MM-Y').format('Y-MM-DD') : '';
    var team = document.getElementById('slc_team').value;
    
    let params = {};
    params.pk = user;
    params.start = start_date;
    params.end = end_date;
    params.team = team;

    let data = await getEncargos(params);
    var mes = [];
    var year = [];
    var total= [];
    var colores= [];
    var color = "#8e5ea2";
    data = data.data;    
    data.solicitudes.forEach(element =>  {
        mes.push(monthsName[parseInt(element.mes)-1])
        total.push(element.total_solicitudes)
        colores.push(color)
        if (element.year != null) {
            year.push(element.year)
        }
    });
    new Chart(document.getElementById("bar-month"), {
        type: 'bar',
        data: {
        scaleOverride:true,
            scaleSteps:10,
            scaleStartValue:0,
            scaleStepWidth:1,
        labels: mes,
        datasets: [
            {
            label: "Solicitudes realizadas",
            backgroundColor: colores,
            data: total
            }
        ]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Encargos totales por mes'
            },
            tooltips: {
                mode: 'index',
                intersect: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                    beginAtZero: true,
                    callback: function(value) {if (value % 1 === 0) {return value;}}
                    }
                }]
            }
        }
    });
}


async function EncargosPerZone(_user, _start, _end, _team){
    ClearChart('parent-zone', 'chart-zone', 'zone');
    document.getElementById('alerta_zona').innerHTML = "";
    var ctx = document.getElementById("chart-zone");
    var user = '';
    var team = '';
    var zonas = [];
    var total = [];
    var colores = [];
    var color = "#003798";

    _user != undefined ? user = _user : '';
    _team != undefined ? team = _team : '';
    
    let params = {
        pk: user,
        team: team
    }
    
    let data = await getData(`/solicitudes/api/zone_list/`, params);

    if (_start != undefined  && _end != undefined ){
        params.start = _start;
        params.end = _end;
        data = await getData(`/solicitudes/api/zone_list/`, params)
    }
       
    data.data.forEach(element => {
        zonas.push(element.zona)
        total.push(element.total_solicitudes)
        colores.push(color)
    })
            
    new Chart(ctx, {
        type: 'bar',
        data: {
            scaleOverride:true,
            scaleSteps: 2,
            scaleStartValue:0,
            scaleStepWidth:1,
            labels: zonas,
            datasets: [
                {
                    label: 'Solicitudes',
                    backgroundColor: colores,
                    data: total
                }
        ]},
        options: {
            legend: {display:true}, 
            showTooltips: true,
            title: {
                display:true,
                text: 'Encargos por zona'
            },
            tooltips: {
                mode: 'index',
                intersect: false
            },
            scales: {
                xAxes: [{
                    barPercentage: 0.6
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function(value) {if (value % 1 === 0){return value;}}
                    }
                }]
            }
        }   
    })
}
    
async function ZoneForDeliver(_pk, _start, _end){
    ClearChart('parent-zona', 'chart-zona');

    let params = {
        pk: _pk
    }
    var zonas = [];
    var total= [];
    var colores= [];
    var color = "#8e5ea2";

    let data = await getData(`/solicitudes/api/zone/mensajero/`, params);

    if (_start != '' && _end != ''){
        params.start = _start;
        params.end = _end;
        data = await getData(`/solicitudes/api/zone/mensajero/`, params);
    }

    data.data.forEach(function(element) {
        zonas.push(element.zona)
        total.push(element.total_solicitudes)
        colores.push(color)
    });
    
    new Chart(document.getElementById("chart-zona"), {
        type: 'bar',
        data: {
        scaleOverride:true,
            scaleSteps:2,
            scaleStartValue:0,
            scaleStepWidth:1,
            labels: zonas,
            datasets: [
                {
                label: "Solicitudes realizadas",
                backgroundColor: colores,
                data: total
                }
            ]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Encargos por Zona'
            },
            tooltips: {
                mode: 'index',
                intersect: false
            },
            scales: {
                xAxes: [{
                    barPercentage: 0.6
                }],
                yAxes: [{
                    ticks: {
                    beginAtZero: true,
                    callback: function(value) {if (value % 1 === 0) {return value;}}
                    }
                }]
            }
        }
    });
}

async function PriorityByUser(_user, _start, _end, _team){
    ClearChart('parent_prioridad', 'chart-prioridad');
    document.getElementById('alerta_usuario_prioridad').innerHTML = "";
    
    var ctx = document.getElementById('chart-prioridad')
    var team = '';
    var user = '';
    var prioridad = []
    var prioridades = ['A', 'B', 'C', 'D'];
    var color = '#04B404'
    
    _user != undefined ? user = _user : '';
    _team != undefined ? team = _team : '';

    let params = {
        pk: user,
        team: team
    }

    let data = await getData(`/solicitudes/api/priority-user/`, params);

    if (_start != undefined && _end != undefined){
        params.start = _start;
        params.end = _end;
        data = await getData('/solicitudes/api/priority-user/', params);
    }
        
    var iterar = data.data[0];

    for(var x in iterar){
        prioridad.push(iterar[x])
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            scaleOverride: true,
            scaleStartValue: 0,
            scaleStepWidth: 1,
            labels: prioridades,
            datasets: [
                { 
                label: 'Solicitudes por prioridad',
                backgroundColor: color,
                data: prioridad
                }
            ]           
        },
        options: {
            response: true,
            legend: {display:true},
            title: {
                display: true,
                text: 'Frecuencia de prioridad de usuario ' 
            },
            tooltips: {
                mode: 'index',
                intersect:false
            },
            scales: {
                xAxes: [{
                    barPercentage: 0.4
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function(value){ if(value % 1 === 0) {return value;} }
                    }
                }]
            }
        }
    })
}


async function getEncargosByMensajero(){
    ClearChart('parent_mensajero', 'mensajeros');
    let e = document.getElementById("mensajero_select");
    let mensajero_name= e.options[e.selectedIndex].text; 
    let ctx = document.getElementById("mensajeros");
    var mes = [];
    var total= [];
    var color = "#003798";

    let inicio = document.getElementById("fecha_inicio_mensajero").value;
    inicio != '' ? inicio = moment(inicio, 'DD-MM-Y').format('Y-MM-DD') : '';

    let fin = document.getElementById("fecha_fin_mensajero").value;
    fin != '' ?  fin = moment(fin, 'DD-MM-Y').format('Y-MM-DD') : '';

    let params = {
        pk: e.value
    }

    let data = await getData('/solicitudes/api/mensajero_list/', params);

    if (inicio != '' && fin != ''){
        params.start = inicio;
        params.end = fin;
        data = await getData(`/solicitudes/api/mensajero_list/`, params);
    }

    ZoneForDeliver(e.value, inicio, fin);
    getEncargosByMensajeroTime(e.value, inicio, fin);
    document.getElementById('insert-deliver-encargos').innerHTML = '';

    if (data.data.solicitudes.length > 0) {
        document.getElementById("alerta_mensajero").innerHTML = "";

        data.data.solicitudes.forEach(function(element) {
            mes.push(monthsName[parseInt(element.mes)-1])
            total.push(element.total_solicitudes)
        });
            
        new Chart(ctx, {
            type: 'bar',
            data: {
                scaleOverride:true,
                scaleStartValue:0,
                scaleStepWidth:1,
                labels: mes,
                datasets: [
                    {
                    label: "Solicitudes entregadas",
                    backgroundColor: color,
                    data: total
                    }
                ]
            },
            options: {
                responsive: true, 
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Mensajero seleccionado: '+mensajero_name
                },
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    xAxes: [{
                        barPercentage: 0.4
                    }],
                    yAxes: [{
                        ticks: {
                        beginAtZero: true,
                        callback: function(value) {if (value % 1 === 0) {return value;}}
                        }
                    }]
                }
            }
        });

    } else{
        document.getElementById("alerta_mensajero").innerHTML = "No se encontraron registros en las fechas seleccionadas";   
    }
}  

async function getEncargosByMensajeroTime(_user, _start, _end){
    ClearChart('parent_tiempo', 'encargo_per_user_tiempo');
    var ctx = document.getElementById('encargo_per_user_tiempo')
    var e = document.getElementById('mensajero_select');
    var mensajero_name= e.options[e.selectedIndex].text; 
    
    let params = {
        pk: _user
    }

    let data = await getData('/solicitudes/api/mensajero_list_tiempo/', params);

    if (_start != '' && _end != ''){
        params.start = _start;
        params.end = _end;
        data = await  getData('/solicitudes/api/mensajero_list_tiempo/', params);
    }

    var dataset = [];
    var mes = [];
    var onTime = [];
    var offTime = [];

    if (data.data.solicitudes.length > 0) {
        document.getElementById("alerta_mensajero_tiempo").innerHTML = "";

        data.data.solicitudes.forEach(function(element) {
            mes.push(monthsName[parseInt(element.mes)-1])
            onTime.push(element.onTime)
            offTime.push(element.offTime)
            
        });
            
        var entranceDataset = {
            label: 'A tiempo',
            type: 'bar',
            yAxesID : "y-axis-1",
            data: onTime,
            backgroundColor: 'rgba(0, 204, 0, 0.2)',
            borderColor: 'rgba(0, 204, 0,1)',
            borderWidth: 1
        };

        var exitDataset = {
            label: 'Fuera Tiempo',
            type: 'bar',
            yAxesID : "y-axis-1",
            data: offTime,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        };

        dataset.push(entranceDataset);
        dataset.push(exitDataset);
            
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: mes,
                datasets: dataset
            },
            options: {
                title: {
                    display: true,
                    text: 'Mensajero seleccionado: '+mensajero_name
                },
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    yAxes: [{
                            id:"y-axis-1",
                            position:'left',
                            type: 'linear',
                            ticks: {
                                beginAtZero:true,
                                callback: function(value) {if (value % 1 === 0) {return value;}}
                            },
                            scaleLabel: {
                                display: true,
                                labelString: ''
                            }
                        },
                        {
                        id:"y-axis-2",
                        position:'right',
                        type: 'linear',
                        ticks: {
                            beginAtZero:true,
                            callback: function(value) {if (value % 1 === 0) {return value;}}
                        },
                        scaleLabel: {
                            display: true,
                            labelString: ''
                        }
                    }],
                    xAxes : [{
                        gridLines : {
                            display : false
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Mes'
                        }
                    }]
                },
                    
            }
        });

            var list_time_url = `/solicitudes/api/mensajero/list/time/?pk=${_user}`
            if (_start != '' && _end != ''){
                list_time_url = `/solicitudes/api/mensajero/list/time/?pk=${_user}&start=${_start}&end=${_end}`
            }

            const ListOfEncargosTime = async () => {
                try {
                    return await axios.get(list_time_url);
                }
                catch (error) {
                    console.error(error)
                }
            }
            
            async function ListEncargosTime(){
                let encargo = await ListOfEncargosTime();
                let table = ''
                let estado = ''

                if (encargo.data.length > 0){
                    encargo.data.forEach(element => {
                        table += `<tr>
                                    <td> ${element.mensajeria_enviada} </td>
                                    <td> ${element.solicitante.first_name} </td>
                                    <td> ${moment(element.fecha_realizacion, 'Y-MM-DD').format('DD-MM-Y')} </td>
                                    <td> ${moment(element.fecha_entrega, 'Y-MM-DD').format('DD-MM-Y')} </td>
                                    <td> ${element.razon_tardanza} </td>
                                    </tr>`
                    });
                    document.getElementById('insert-deliver-encargos').innerHTML = table;
                    
                }
            }
            ListEncargosTime();

        }else{
            document.getElementById("alerta_mensajero_tiempo").innerHTML = "No se encontraron registros en las fechas seleccionadas";
            
        }
}  

document.getElementById('btn_reset').addEventListener('click', function(){
    document.getElementById('slc_user_month').value = '-------------------------------'
    document.getElementById('txt_start').value = '';
    document.getElementById('txt_end').value = '';
    ResetChart();
})

        
function EncargoPerUser(_user, _start, _end, _team){
    ClearChart('parent_per_user', 'encargo_per_user');
    document.getElementById('alert_encargo_correct').innerHTML = '';
    var user = '';
    var team = '';

    if(_user != undefined){
        user = _user
    }

    if(_team != undefined){
        team = _team;
    }

    let url = `/solicitudes/api/state/user/?pk=${user}&team=${team}`
   
    if(_start != undefined && _end != undefined){
        url = `/solicitudes/api/state/user/?pk=${user}&start=${_start}&end=${_end}&team=${team}`
    }
    
    axios.get(url)
    .then(response => {
        var correctos = [];
        var incorrectos = [];
        var incidencia = [];
        var total= [];
        
        var color = "#FFBF00";
        response.data.solicitudes.forEach(function(element) {
            correctos.push(element.correctos)
            incorrectos.push(element.rechazados)
            incidencia.push(element.incidencia)
        });
        
        new Chart(document.getElementById("encargo_per_user"), {
            type: 'bar',
            data: {
            scaleOverride:true,
                scaleSteps:10,
                scaleStartValue:0,
                scaleStepWidth:1,
            labels: ['correctos', 'rechazado', 'incidencia'],
            datasets: [
                {
                label: "Solicitudes realizadas",
                backgroundColor: color,
                data: [correctos, incorrectos, incidencia]
                }
            ]
            },
            options: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Encargos por usuario'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    yAxes: [{
                        ticks: {
                        beginAtZero: true,
                        callback: function(value) {if (value % 1 === 0) {return value;}}
                        }
                    }]
                }
            }
        });

        var list = `/solicitudes/api/state/list/?pk=${user}&team=${team}`
            
        if (_start != undefined && _end != undefined){
            list = `/solicitudes/api/state/list/?pk=${_user}&start=${_start}&end=${_end}&team=${team}`
        }
    
        const ListOfEncargos = async () => {
            try{
                return await axios.get(list)
            }
            catch (error){
                console.error(error)
            }
        }
        
        async function ListEncargos(){
            let encargo = await ListOfEncargos();
            let table = ''
            let estado = ''
            // document.getElementById('insert_name').innerHTML = usuario_name;
            if(encargo.data.length > 0){
                encargo.data.forEach((element , index)=> {
                    element.estado == 3 ? estado = 'Correcto': element.estado == 6 ? estado = 'Anulado por incidencia' : element.estado == 7 ? estado = 'Rechazado' : ''
                    table += `<tr> 
                                <td class='small'> ${index + 1 } </td>
                                <td class='small'> ${element.solicitante.first_name} </td>
                                <td class='small'> ${element.mensajeria_enviada } </td>
                                <td class='small'> ${element.empresa} </td>
                                <td class='small'> ${moment(element.fecha_realizacion, 'Y-MM-DD').format('DD-MM-Y')} </td>`

                                if(element.estado == 7){
                                    table += `<td class='small' style='color:red'> ${element.razon_rechazo} </td> 
                                                <td class='small'> ${estado} </td>
                                            </tr>`
                                }
                                if (element.estado == 6 && element.incidencias != null){
                                    table += `<td class='small' style='color:purple'> ${element.incidencias} </td>
                                            <td class='small'> ${estado} </td>
                                            </tr>`
                                }
                })
                document.getElementById('insert-detail-encargos').innerHTML = table;
            }
            
        }
        
        ListEncargos();
    })
    .catch(error => {
        console.log({error})
        
    })

}