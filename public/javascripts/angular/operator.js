angular.module('appOperator',['ui.router'])
	.config(function($stateProvider, $urlRouterProvider){
		$stateProvider
			.state('RegistrarPaciente',{
				url: '/RegistrarPaciente',
				templateUrl: 'views/operario/registrarPaciente.html',
				controller:'ctrlRegp'
			})
			.state('RegistrarMuestra',{
				url: '/RegistrarMuestra',
				templateUrl: 'views/operario/registrarMuestra.html',
                controller:'ctrlRegm'
			})
			.state('Reportes',{
				url: '/Reportes',
				templateUrl: 'views/operario/reportes.html',
                controller:'ctrlRep'
			});
		$urlRouterProvider.otherwise('RegistrarPaciente');
	})
	.controller('ctrlRegp',function($scope, $state, $http, $compile){
        $scope.pacientes = [];
        $scope.paciente;

        $http.get("/users")
            .then(function (response) {
                for(var i=0;i<response.data.length;i++){
                    if (response.data[i].type=="paciente"){
                        var $el = $('<tr>' +
                        '<td>' + response.data[i]["name"] + ' ' + response.data[i].last + '</td>' +
                        '<td>' + response.data[i].local.email                     + '</td>' +
                        '<td>' + response.data[i].info.ci                         + '</td>' +
                        '<td>' + response.data[i].info.address                    + '</td>' +
                        '<td>' + response.data[i].info.phone                      + '</td>' +
                        '<td class=\"center-align\">' + 
                            '<i style=\"cursor: pointer\" id=\"'+response.data[i]._id+
                            '\" ng-click=\"openEdit($event);\" class=\"blue-text material-icons\">mode_edit</i>'+
                        '</td></tr>').appendTo('#mytable tbody');
                        $compile($el)($scope);
                        $scope.pacientes.push(response.data[i]);
                    }
                }
                $('#mytable').DataTable();
            }
        );

        $scope.openEdit = function(event){
            for(var i=0;i<$scope.pacientes.length;i++){
                if($scope.pacientes[i]._id==event.target.id){
                    $scope.paciente = $scope.pacientes[i];
                }
            }
            $('#edit').openModal();
        }

        $scope.putPaciente = function () {
            $http.put("/users/" + $scope.paciente._id, { 
                name    : $scope.paciente.name,
                last    : $scope.paciente.last,
                email   : $scope.paciente.local.email,
                ci      : $scope.paciente.info.ci,
                address : $scope.paciente.info.address,
                phone   : $scope.paciente.info.phone,
            }
            ).success(function (response) {
                console.log("I guess this madness worked")
                $state.reload();
                Materialize.toast('Usuario editado ;)', 5000,'')
            }, function (error) {
            });
            $('#edit').closeModal();
        };

        $scope.killPaciente = function () {
            $http.delete("/users/" + $scope.paciente._id
            ).success(function (response) {
                console.log("I guess this madness worked")
                $state.reload();
                Materialize.toast('Usuario eliminado :\'(', 5000,'')
            }, function (error) {
            });
            $('#edit').closeModal();
        };

        $('#addpaciente')
        .mouseenter(function() {
          Materialize.toast('Agrega un Nuevo Paciente', 500,'')
        });
        $('input#cedula, input#phone').characterCounter();
	})
	.controller('ctrlRegm',function($scope, $state, $http, $compile){

        $scope.pacientes='{';
        $scope.labs='{';
        $scope.mails = [];
        $scope.ids = [];
        $scope.sample = {};
        $scope.samples = [];
        $scope.laboratorios=[];

        $http.get("/users")
            .then(function (response) {
                for(var i=0;i<response.data.length;i++){
                    if (response.data[i].type=="paciente"){
                        $scope.pacientes =  $scope.pacientes + 
                                            '\"' + response.data[i].name+' '+response.data[i].last+
                                            ' ('+response.data[i].local.email+')\": null, ';
                        $scope.mails.push(response.data[i].local.email);
                        $scope.ids.push(response.data[i]._id);
                    }
                }
                $scope.pacientes = $scope.pacientes + '"@easter-egg": "http://vignette3.wikia.nocookie.net/undertale-fanon/images/5/50/Wiki-background/revision/latest?cb=20160404121656"}';
                $scope.pacientes = JSON.parse($scope.pacientes);
                $('input.autocomplete').autocomplete({
                    data: $scope.pacientes
                  });
            }
        );

        $http.get("/buildings")
            .then(function (response) {
                for(var i=0;i<response.data.length;i++){
                    if ((response.data[i].type).toLowerCase()=="laboratorio"){
                        $scope.labs =  $scope.labs + '\"'+response.data[i].name+'\": null, ';
                        $scope.laboratorios.push(response.data[i].name);
                    }
                }
                $scope.labs = $scope.labs + '"@easter-egg": "http://vignette3.wikia.nocookie.net/undertale-fanon/images/5/50/Wiki-background/revision/latest?cb=20160404121656"}';
                $scope.labs = JSON.parse($scope.labs);
                $('input.lab').autocomplete({
                    data: $scope.labs
                  });
            }
        );

        $http.get("/samples")
            .then(function (response) {
                for(var i=0;i<response.data.length;i++){
                    if(response.data[i]._user!=undefined){
                        var $el = $('<tr>' +
                        '<td>' + response.data[i].type                            + '</td>' +
                        '<td>' + response.data[i].code                            + '</td>' +
                        '<td>' + response.data[i]._user.name + " "
                               + response.data[i]._user.last + " " 
                               + "(" + response.data[i]._user.local.email + ")"   + '</td>' +
                        '<td>' + response.data[i].date                            + '</td>' +
                        '<td>' + response.data[i].etype                           + '</td>' +
                        '<td>' + response.data[i].meta                            + '</td>' +
                        '<td class=\"center-align\">' + 
                            '<i style=\"cursor: pointer\" id=\"'+response.data[i]._id+
                            '\" ng-click=\"openEdit($event);\" class=\"blue-text material-icons\">mode_edit</i>'+
                        '</td></tr>').appendTo('#mytable tbody');
                        $compile($el)($scope);
                        $scope.samples.push(response.data[i]);
                    }
                }
                var table = $('#mytable').DataTable({
                    "columnDefs": [
                        { "visible": false, "targets": 2 }
                    ],
                    "order": [[ 2, 'asc' ]],
                    "displayLength": 25,
                    "drawCallback": function ( settings ) {
                        var api = this.api();
                        var rows = api.rows( {page:'current'} ).nodes();
                        var last=null;
             
                        api.column(2, {page:'current'} ).data().each( function ( group, i ) {
                            if ( last !== group ) {
                                $(rows).eq( i ).before(
                                    '<tr class="group"><td style="background-color:gray;color:white" colspan="6">'+group+'</td></tr>'
                                );
             
                                last = group;
                            }
                        } );
                    }
                });
             
                // Order by the grouping
                $('#mytable').on( 'click', 'tr.group', function () {
                    var currentOrder = table.order()[0];
                    if ( currentOrder[0] === 2 && currentOrder[1] === 'asc' ) {
                        table.order( [ 2, 'desc' ] ).draw();
                    }
                    else {
                        table.order( [ 2, 'asc' ] ).draw();
                    }
                } );
            }
        );


        $scope.openNew = function(){
            $scope.sample.code = ""+$scope.getRandom();
            $scope.sample.date = $scope.superDate();
            $scope.sample.meta = "En Proceso"
            $scope.sample.type = "sangre";
            $scope.sample.id   = null;
            $scope.sample.lab   = null;
            $scope.sample.medic   = null;
            $scope.openSangre();
            $('#post').openModal();
        }

        $scope.openEdit = function(event){
            for(var i=0;i<$scope.samples.length;i++){
                if($scope.samples[i]._id==event.target.id){
                    $scope.sample = $scope.samples[i];
                }
            }
            $scope.sample.id = $scope.sample._user.name + " " + $scope.sample._user.last + " (" + $scope.sample._user.local.email + ")";
            $('#edit1').attr('checked', " ");
            $('#edit2').attr('checked', " ");
            $('#edit3').attr('checked', " ");
            if($scope.sample.type=="orina"){
                $scope.openOrina();
            }else if($scope.sample.type=="heces"){
                $scope.openHeces();
            }else{
                $scope.openSangre();
                if($scope.sample.etype.length==3){
                    $('#edit1').attr('checked', true);
                    $('#edit2').attr('checked', true);
                    $('#edit3').attr('checked', true);
                }else if($scope.sample.etype.length==2){
                    if($scope.sample.etype[0]=="Bioquimica"){
                        $('#edit2').attr('checked', true);
                        $('#edit3').attr('checked', true);
                    }else if($scope.sample.etype[0]=="Hemograma"){
                        $('#edit1').attr('checked', true);
                        if($scope.sample.etype[1]=="Bioquimica")
                            $('#edit2').attr('checked', true);
                        else $('#edit3').attr('checked', true);
                    }
                }else{
                    if($scope.sample.etype[0]=="Hemograma")
                        $('#edit1').attr('checked', true);
                    if($scope.sample.etype[0]=="Bioquimica")
                        $('#edit2').attr('checked', true);
                    else $('#edit3').attr('checked', true);
                }
            }
            $('#edit').openModal();
        }

        $scope.addSample = function(){
            var val=false;
            val = $scope.findSelected();
            if (val){
                $http.post("/sample",{
                    id               : $scope.sample.id,
                    type             : $scope.sample.type,
                    code             : $scope.sample.code,
                    date             : $scope.sample.date,
                    etype            : $scope.sample.etype,
                    medic            : $scope.sample.medic,
                    lab              : $scope.sample.lab,
                    meta             : $scope.sample.meta,
                    results          : $scope.sample.results
                }).success(function (response) {
                    console.log("I guess this madness worked")
                    $('#post').closeModal();
                    $state.reload();
                    Materialize.toast('Muestra Agregada ;)', 5000,'')
                }, function (error) {
                });
            }else{
                $scope.openNew();
            }
        }

        $scope.putSample = function () {
            var val=false;
            val = $scope.findSelected();
            if (val){
                $http.put("/samples/" + $scope.sample._id, { 
                    id               : $scope.sample.id,
                    type             : $scope.sample.type,
                    code             : $scope.sample.code,
                    date             : $scope.sample.date,
                    etype            : $scope.sample.etype,
                    medic            : $scope.sample.medic,
                    lab              : $scope.sample.lab,
                    meta             : $scope.sample.meta,
                    results          : $scope.sample.results
                }).success(function (response) {
                    console.log("I guess this madness worked")
                    $('#edit').closeModal();
                    $state.reload();
                    Materialize.toast('Muestra editada ;)', 5000,'')
                }, function (error) {
                });
            }else{
                $scope.openEdit();
            }
        };

        $scope.killSample = function () {
            $http.delete("/samples/" + $scope.sample._id
            ).success(function (response) {
                console.log("I guess this madness worked")
                $state.reload();
                Materialize.toast('Muestra Eliminada :\'(', 5000,'')
            }, function (error) {
            });
            $('#edit').closeModal();
        };

        $('#addMuestra')
        .mouseenter(function() {
          Materialize.toast('Agrega una Nueva Muestra Medica', 500,'')
        });
        $('input#cedula, input#phone').characterCounter();
        $('select').material_select();

	    $scope.getRandom = function () {
            var array = [];
            for (var i=0;i<$scope.samples.length;i++){
                array.push(parseInt($scope.samples[i].code));
            }
            array.sort(function(a, b){return a-b});
            if(array[0]!=900000000000001){
                return 900000000000001;
            }
            for (var i=0;i<array.length;i++){
                if (array[i]+1!=array[i+1]){
                    return array[i]+1;
                }
            }
            return array[array.length-1]+1;
            //return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1));
        }
        $scope.openSangre = function () {
            $('#heces, #orina, #pee, #poo').attr('style',"display:none");
            $('#sangre, #blood').attr('style',"display:true");
            $scope.sample.type = "sangre";
        }
        $scope.openOrina = function () {
            $('#sangre, #heces, #blood, #poo').attr('style',"display:none");
            $('#orina, #pee').attr('style',"display:true");
            $scope.sample.type = "orina";
        }
        $scope.openHeces = function () {
            $('#sangre, #orina, #blood, #pee').attr('style',"display:none");
            $('#heces, #poo').attr('style',"display:true");
            $scope.sample.type = "heces";
        }
        $scope.superDate = function(){
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();
            if(dd<10) { dd='0'+dd } 
            if(mm<10) { mm='0'+mm } 
            return today = mm+'/'+dd+'/'+yyyy;
        }
        $scope.findSelected = function(){
            $scope.sample.etype = [];

            if ($scope.sample.id == null)
                $scope.sample.id = document.getElementById('autocomplete-input').value;
            else $scope.sample.id = document.getElementById('edit-input').value;
            $scope.sample.id = $scope.sample.id.substring($scope.sample.id.indexOf("(")+1,$scope.sample.id.indexOf(")"));
            for (var i=0;i<$scope.mails.length;i++){
                if ($scope.sample.id == $scope.mails[i]){
                    break;
                }
            }

            if ($scope.sample.lab == null){
                $scope.sample.lab = document.getElementById('autocomplete-lab').value;
            }
            else $scope.sample.lab = document.getElementById('lab2').value;
            for (var j=0;j<$scope.laboratorios.length;j++){
                if ($scope.sample.lab == $scope.laboratorios[j]){
                    console.log(j)
                    break;
                }
            }
            
            if (i==$scope.mails.length){
                Materialize.toast('Ese usuario esta incorrecto', 2000,'')
                return false
            }if (j==$scope.laboratorios.length){
                Materialize.toast('Ese laboratorio no existe', 2000,'')
                return false
            }if (document.getElementById('medic').value==""){
                Materialize.toast('Ese centro medico no existe', 2000,'')
                return false
            }

            $scope.sample.id = $scope.ids[i];
            $scope.sample.lab = $scope.laboratorios[j];

            var test1 = document.getElementById('test1');
            var test2 = document.getElementById('test2');
            var test3 = document.getElementById('test3');
            var edit1 = document.getElementById('edit1');
            var edit2 = document.getElementById('edit2');
            var edit3 = document.getElementById('edit3');
            if($scope.sample.type == "orina"){
                $scope.sample.etype.push("Uroanalisis");
            }else if($scope.sample.type == "heces"){
                $scope.sample.etype.push("Coprocultivo");
            }else{
                $scope.sample.type = "sangre";
                if(test1.checked || edit1.checked){
                    $scope.sample.etype.push("Hemograma");
                }if(test2.checked || edit2.checked){
                    $scope.sample.etype.push("Bioquimica");
                }if(test3.checked || edit3.checked){
                    $scope.sample.etype.push("Serologia");
                }
            }
            return true;
        }
	})
    .controller('ctrlRep',function($scope, $state, $http, $compile){
        $scope.buildings = '[';
        var months=[];
        var today = new Date();
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();
        if(mm<10) { mm='0'+mm } 
        today = mm+'/'+yyyy;
        var months=[];
        months.push(today);

        $http.get("/buildings")
            .then(function (response) {
                var $el = $("<tr></tr>");
                $el.append("<th></th>");
                for(var i=0;i<response.data.length;i++){
                    $el.append('<th>' + response.data[i].name + '</th>');
                    if(i==response.data.length-1){
                        $scope.buildings = $scope.buildings + '{\"name\" : \"' + response.data[i].name + 
                        '\" , \"y\" : '+0+', \"date\" : []}] '
                    }else{
                        $scope.buildings = $scope.buildings + '{\"name\" : \"' + response.data[i].name + 
                        '\" , \"y\" : '+0+', \"date\" : [] }, '
                    }
                }
                $scope.buildings = JSON.parse($scope.buildings);
                $compile($el)($scope);
                ($el).appendTo('#datatable thead');
            }
        );

        $http.get("/samples")
            .then(function (response) {
                for(var i=0;i<response.data.length;i++){
                    for(var j=0;j<$scope.buildings.length;j++){
                        if($scope.buildings[j].name == response.data[i].lab){
                            var helper1 = response.data[i].date;
                            var helper2 = response.data[i].date;
                            helper1 = helper1.substring(0, helper1.indexOf('/')+1);
                            helper2 = helper2.substring(6);
                            var helper = helper1 + helper2;
                            if($scope.buildings[j].date.length == 0){
                                var damn = '{\"month\" : \"' + helper + '\", \"value\" :' + 1 + '}';
                                damn = JSON.parse(damn);
                                $scope.buildings[j].date.push(damn);
                            }else{
                                for(var k=0;k<$scope.buildings[j].date.length;k++){
                                    if($scope.buildings[j].date[k].month == helper){
                                        $scope.buildings[j].date[k].value = $scope.buildings[j].date[k].value + 1;
                                    }else{
                                        var damn = '{\"month\" : \"' + helper + '\", \"value\" :' + 1 + '}';
                                        damn = JSON.parse(damn);
                                    }
                                }
                            }
                        }
                    }
                }

                for(var k=0;k<months.length;k++){
                    var $el = $("<tr></tr>");
                    $el.append("<th>"+months[k]+"</th>");
                    for(var i=0;i<$scope.buildings.length;i++){
                        for(var j=0;j<$scope.buildings[i].date.length;j++){
                            if($scope.buildings[i].date[j].month==months[k]){
                                $el.append("<td>"+$scope.buildings[i].date[j].value+"</td>");
                            }else{
                                $el.append("<td>"+ 0 +"</td>");
                            }
                        }
                    }
                    $compile($el)($scope);
                    ($el).appendTo('#datatable tbody');
                }

                for(var m=0;m<$scope.buildings.length;m++){
                    for(var n=0;n<$scope.buildings[m].date.length;n++){
                        $scope.buildings[m].y = $scope.buildings[m].y + $scope.buildings[m].date[n].value;
                    }
                }

                $('#contenedor').highcharts({
                    data: {
                        table: 'datatable'
                    },
                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: 'Muestras Mensuales por Laboratorio'
                    },
                    yAxis: {
                        allowDecimals: false,
                        title: {
                            text: 'Muestras'
                        }
                    },
                    tooltip: {
                        formatter: function () {
                            return '<b>' + this.series.name + '</b><br/>' +
                                this.point.y + ' ' + this.point.name.toLowerCase();
                        }
                    }
                });

                $('#piechart').highcharts({
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: 'Muestras Medicas por Laboratorio'
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.y}',
                                style: {
                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                }
                            }
                        }
                    },
                    series: [{
                        name: 'Muestras',
                        colorByPoint: true,
                        data: $scope.buildings
                    }]
                });
            }
        );
        
        $scope.generar = function(){
            var months = [];
            if($scope.start != undefined && $scope.end != undefined){
                helper11 = parseInt($scope.start.substring(0, $scope.start.indexOf('/')));
                helper12 = parseInt($scope.start.substring(3));
                helper21 = parseInt($scope.end.substring(0, $scope.end.indexOf('/')));
                helper22 = parseInt($scope.end.substring(3));
                if(helper12>=2016){
                    if(helper22-helper12>=2){
                        Materialize.toast('No mas de un año de diferencia', 5000,'')
                        return;
                    }else if(helper12==helper22-1){
                        if((helper21+12)-helper11<=6){
                            for(helper11;helper11<=12;helper11++){
                                var cas = '' + helper11;
                                if (helper11<10){cas = '0'+ helper11 }
                                if (helper11>helper21&&helper12==helper22){break}
                                cas = cas + "/" + helper12;
                                months.push(cas);
                                if (helper11==12){helper11=0;helper12=helper12+1;}
                            }
                        }else{
                            Materialize.toast('No mas de 6 meses de diferencia', 5000,'')
                            return;
                        }
                    }else if(helper12==helper22 && helper11<=helper21){
                        if(helper21-helper11<=6){
                            for(helper11;helper11<=12;helper11++){
                                var cas = '' + helper11;
                                if (helper11<10){cas = '0'+ helper11 }
                                if (helper11>helper21){break}
                                cas = cas + "/" + helper12;
                                months.push(cas);
                            }
                        }else{
                            Materialize.toast('No mas de 6 meses de diferencia', 5000,'')
                            return;
                        }
                    }else{
                        Materialize.toast('Fecha inicial no puede ser mayor a la final', 5000,'')
                        return;
                    }
                }else{
                    Materialize.toast('No se existia antes del 2016...', 5000,'')
                    return;
                }

                $( "tbody" ).remove();
                var $ela = $("<tbody></tbody>");
                $compile($ela)($scope);
                ($ela).appendTo('#datatable');

                $http.get("/")
                    .then(function (response) {
                        for(var k=0;k<months.length;k++){
                            var $el = $("<tr></tr>");
                            $el.append("<th>"+months[k]+"</th>");
                            for(var i=0;i<$scope.buildings.length;i++){
                                for(var j=0;j<$scope.buildings[i].date.length;j++){
                                    if($scope.buildings[i].date[j].month==months[k]){
                                        $el.append("<td>"+$scope.buildings[i].date[j].value+"</td>");
                                    }else{
                                        $el.append("<td>"+ 0 +"</td>");
                                    }
                                }
                            }
                            $compile($el)($scope);
                            ($el).appendTo('#datatable tbody');
                        }

                        $('#contenedor').highcharts({
                            data: {
                                table: 'datatable'
                            },
                            chart: {
                                type: 'column'
                            },
                            title: {
                                text: 'Muestras Mensuales por Laboratorio'
                            },
                            yAxis: {
                                allowDecimals: false,
                                title: {
                                    text: 'Muestras'
                                }
                            },
                            tooltip: {
                                formatter: function () {
                                    return '<b>' + this.series.name + '</b><br/>' +
                                        this.point.y + ' ' + this.point.name.toLowerCase();
                                }
                            }
                        });

                        $('#piechart').highcharts({
                            chart: {
                                plotBackgroundColor: null,
                                plotBorderWidth: null,
                                plotShadow: false,
                                type: 'pie'
                            },
                            title: {
                                text: 'Muestras Medicas por Laboratorio'
                            },
                            tooltip: {
                                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                            },
                            plotOptions: {
                                pie: {
                                    allowPointSelect: true,
                                    cursor: 'pointer',
                                    dataLabels: {
                                        enabled: true,
                                        format: '<b>{point.name}</b>: {point.y}',
                                        style: {
                                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                        }
                                    }
                                }
                            },
                            series: [{
                                name: 'Muestras',
                                colorByPoint: true,
                                data: $scope.buildings
                            }]
                        });
                    }
                );
            }
        }
    
    })