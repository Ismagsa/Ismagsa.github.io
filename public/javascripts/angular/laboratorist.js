angular.module('appLaboratorist',['ui.router'])
    .config(function($stateProvider, $urlRouterProvider){
        $stateProvider
            .state('examen',{
                url: '/examen',
                templateUrl: 'views/laboratorista/examenes.html',
                controller: 'ctrlCargar'
            })
            .state('resultado',{
                url: '/resultado',
                templateUrl: 'views/laboratorista/resultados.html',
                controller: 'ctrlGo'
            })
        $urlRouterProvider.otherwise('examen');})
    .service('dataService', function() {
      // private variable
      var _dataObj = 0;

      return {
            getProperty: function () {
                return _dataObj;
            },
            setProperty: function(value) {
                _dataObj = value;
            }
        };})

    .controller('ctrlCargar', function($scope, $state, $http, dataService, $compile) {
        $scope.sample = {};
        $scope.exam = [];
        var examenes ='{';
        var samples = [];

        $scope.buildings = '[';
        var months=[];
        var today = new Date();
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();
        if(mm<10) { mm='0'+mm } 
        today = mm+'/'+yyyy;
        var months=[];
        months.push(today);

        $http.get("/samples")
            .then(function (response) {
                samples = response.data;
            });

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


                for(var m=0;m<$scope.buildings.length;m++){
                    for(var n=0;n<$scope.buildings[m].date.length;n++){
                        $scope.buildings[m].y = $scope.buildings[m].y + $scope.buildings[m].date[n].value;
                    }
                }
                
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

        $scope.findSample = function(){
            if($scope.code==undefined) return;
            $( "#mytable_wrapper" ).remove();
            for(var i=0;i<samples.length;i++){
                if($scope.code == samples[i].code){
                    $scope.sample = samples[i];
                    $('#user').removeAttr('style');
                    $('#piechart').attr('style',"display:none");
                    break;
                }
            }
            if(i==samples.length){
                $('#piechart').removeAttr('style');
                $('#user').attr('style',"display:none");
                Materialize.toast('Hey! Esa muestra aun no existe!', 1000,'')
                return;
            }

            dataService.setProperty($scope.code);
            $state.go('resultado', {stateParamKey: null});
        }
    })
    .controller('ctrlGo', function($scope, $state, $http, dataService, $compile) {
        if(dataService.getProperty()==0)
            $state.go('examen', {stateParamKey: null});
        $scope.sample = {};
        $scope.exam = [];
        var examenes ='{';
        var samples = [];
        $scope.code = dataService.getProperty();

        $http.get("/samples")
            .then(function (response) {
                for(var i=0;i<response.data.length;i++){
                    if($scope.code == response.data[i].code){
                        $scope.sample = response.data[i];
                        break;
                    }
                }
                var $el = $('<tr>' +
                    '<td>' + '</td>' +
                    '<td>' + '</td>' +
                    '<td>' + $scope.sample._user.name+" "+$scope.sample._user.last 
                       + " (" +$scope.sample.code + ") / "+$scope.sample.type+'</td>' +
                    '<td>' + '</td>' +
                    '<td>' + '</td>' +
                    '<td>' + '</td></tr>').appendTo('#mytable tbody');
                    $compile($el)($scope);

                for(var i=0;i<$scope.sample.results.length;i++){
                    var $el = $('<tr>' +
                    '<td>' + $scope.sample.results[i].parameter          + '</td>' +
                    '<td>' + $scope.sample.results[i].unit               + '</td>' +
                    '<td>' + $scope.sample.results[i].type               + '</td>' +
                    '<td>' + $scope.sample.results[i].result             + '</td>' +
                    '<td>' + $scope.sample.results[i].ref                + '</td>' +
                    '<td class=\"center-align\">' + 
                        '<i style=\"cursor: pointer\" id=\"'+$scope.sample.results[i]._id+
                        '\" ng-click=\"openEdit($event);\" class=\"blue-text material-icons\">mode_edit</i>'+
                    '</td></tr>').appendTo('#mytable tbody');
                    $compile($el)($scope);
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
                $( ".autocomplete-content" ).remove();
                for(var i=0;i<$scope.sample.etype.length;i++){
                    if(i==$scope.sample.etype.length-1)
                        examenes = examenes + '\"' + $scope.sample.etype[i] + '\" : null}';
                    else
                        examenes = examenes + '\"' + $scope.sample.etype[i] + '\" : null, ';
                }
                examenes = JSON.parse(examenes);
                $('input.autocomplete').autocomplete({data: examenes});
            });


        $scope.openNew = function(){
            $('#post').openModal();
        }

        $scope.openEdit = function(event){
            $scope.exam._id = event.target.id;
            for(var i=0;i<$scope.sample.results.length;i++){
                if($scope.exam._id == $scope.sample.results[i]._id){
                    $scope.exam = $scope.sample.results[i];
                    break;
                }
            }if(i==$scope.sample.results.length){
                return;
            }
            $('#edit').openModal();
        }

        $scope.addExam = function(){
            $scope.exam.type = document.getElementById('autocomplete-input').value;
            for(var i=0;i<$scope.sample.etype.length;i++){
                if($scope.exam.type==$scope.sample.etype[i]){
                    break;
                }
            }if (i==$scope.sample.etype.length){Materialize.toast('Parece que no es un Examen Valido', 500,''); return false;}
            $scope.exam._sample = $scope.sample._id;

            $http.post("/exam",{
                id               : $scope.exam._sample,
                type             : $scope.exam.type,
                parameter        : $scope.exam.parameter,
                unit             : $scope.exam.unit,
                result           : $scope.exam.result,
                ref              : $scope.exam.ref
            }).success(function (response) {
                console.log("I guess this madness worked")
                $('#post').closeModal();
                Materialize.toast('Muestra Agregada ;)', 5000,'')
                $state.reload();
            }, function (error) {
            });
            //angular.element('#submit2').triggerHandler('click');
        }

        $scope.editExam = function(){
            $scope.exam.type = document.getElementById('autocomplete-input2').value;
            for(var i=0;i<$scope.sample.etype.length;i++){
                if($scope.exam.type==$scope.sample.etype[i]){
                    break;
                }
            }if (i==$scope.sample.etype.length){Materialize.toast('Parece que no es un Examen Valido', 500,''); return false;}

            $http.put("/exams/" + $scope.exam._id,{
                type             : $scope.exam.type,
                parameter        : $scope.exam.parameter,
                unit             : $scope.exam.unit,
                result           : $scope.exam.result,
                ref              : $scope.exam.ref
            }).success(function (response) {
                console.log("I guess this madness worked")
                $('#edit').closeModal();
                Materialize.toast('Muestra Agregada ;)', 5000,'')
                $state.reload();
            }, function (error) {
            });
            //angular.element('#submit2').triggerHandler('click');
        }

        $scope.killExam = function () {
            console.log($scope.exam._id)
            $http.delete("/exams/" + $scope.exam._id
            ).success(function (response) {
                console.log("I guess this madness worked")
                Materialize.toast('Muestra Eliminada :\'(', 5000,'')
                $state.reload();
            }, function (error) {
            });
            $('#edit').closeModal();
        };

        $('#addMuestra').mouseenter(function() { Materialize.toast('Agrega un Nuevo Resultado', 500,'') })
    })