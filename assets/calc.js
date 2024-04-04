var activeData;

var age_start;
var age_retire;
var age_end;

var salary_brut;
var cont_retire;
var cont_amount;
var salary_net;

var aportes;
var interest;
var capitalizations;
var initial_capital;
var contributed;

var data = [];


var map_age;
var map_initial_capital;
var map_contributions;
var map_earnings;
var map_fund;

var myChart;

// -------------------
// CHART
// -------------------
var chartInfo;
// COLORS
const colors = {
    orange: {
      fill: '#ffa600',
      stroke: '#ffa600',
    },
    pink: {
      fill: '#f95d6a',
      stroke: '#f95d6a',
    },
    darkBlue: {
      fill: '#2f4b7c',
      stroke: '#2f4b7c',
    },
    purple: {
      fill: '#a05195',
      stroke: '#a05195',
    },
};
// OPTIONS
const options = {
    responsive : true,
    maintainAspectRatio: false,
    plugins: {
        filler: {
            propagate: true,
        },
        legend: {
            display: true,
            position: 'bottom',
        },
        tooltip: {
            padding: 15,
            usePointStyle: true,
            multiKeyBackground: 'transparent',

        },
    },
    interaction: {
        mode: 'index',
        intersect: false,
    },
    layout: {
        padding: 0,
        backgroundColor: 'rgb(33,37,41)',
    },
    elements:{
        bar: {
            borderWidth: 0,
        },
        point:{
            radius: 1,
            hitRadius: 7,
            borderWidth: 0,
            hoverBorderWidth: 4,
        },
    },
    scales: {
        x: {
            stacked: true,
            display: true,
            grid: {
                display: true,
                drawBorder: false,
                color: '#333333',
            },
            ticks: {
                font: {
                    size: 11,
                },
            },
        },
        y: {
            min: 0,
            stacked: true,
            display: true,
            position: 'right',
            title: {
                display: false,
                text: 'Fondo',
                font: {
                    size: 12,
                    weight: 'bold',
                },
            },
            grid: {
                display: true,
                drawBorder: false,
                color: '#333333',
            },
            ticks: {
                font: {
                    size: 11,
                },
                callback: function(value, index, values) {
                    return '$' + Math.floor(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                },
            },
        }
    },
};

var ctx = document.getElementById('retire_chart').getContext('2d');

function renderChart( data ) {
    myChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options,
    });
}

var table = $('table tbody');

function calculations() {
    data = [];
    table.html('');

    age_start = +$('#age_start').val();
    age_retire = +$('#age_retire').val();
    age_end = +$('#age_end').val();

    salary_brut = +$('#salary_brut').val();
    cont_retire = +$('#cont_retire').val();
    cont_amount = +$('#cont_amount').val();
    pension = +$('#pension').val();

    aportes = +$('#aportes').val();
    interest = +$('#interest').val() / 100;
    capitalizations = +$('#capitalizations').val();
    initial_capital = +$('#initial_capital').val();

    // RETIREMENT SLIDER
    var new_age_retire = age_start;
    if (age_start > age_retire) {
        $('#age_retire').val(age_start).change();
    }
    $('#age_retire').attr({ 'min': new_age_retire });
    age_retire = +$('#age_retire').val();
    // end RETIREMENT SLIDER
    
    var calc_year = age_end - age_start;    

    $('.ecuacion').html(`
        <span class="inicial">$${initial_capital}</span> × 
        <span class="parentesis l"></span> 
            1 + <div class="division">
                    <span class="interes">${(interest*100).toFixed(1)}%</span>
                    <span class="capitalizaciones">${capitalizations}</span>
                </div>
        <span class="parentesis r"></span>
        <sup class="elevado">${capitalizations}×${age_retire - age_start}</sup>
        + 
        $${cont_amount} × 
        <span class="parentesis l"></span>
            <div class="division">
                <span>
                    ( 1 + <div class="division small">
                            <span>${(interest*100).toFixed(1)}%</span>
                            <span>${capitalizations}</span>
                          </div>
                    )
                    <sup class="elevado">${capitalizations}×${age_retire - age_start}</sup> - 1
                </span>
                <span>
                    ( 1 + <div class="division small">
                            <span>${(interest*100).toFixed(1)}%</span>
                            <span>${capitalizations}</span>
                          </div>
                    )
                    <sup class="elevado">${capitalizations}/${aportes}</sup> - 1
                </span>
            </div>
        <span class="parentesis r"></span>
        = <span class="fondo"></span>
    `);
    
    var year = 1;
    var earnings = 0;
    var fondo = 0;
    var retirement = 0;

    while (year <= calc_year) {
        var currentAge = age_start + year;
        if (currentAge <= age_retire) {
            contributed = cont_amount * aportes * year;
            earnings = (
                initial_capital * Math.pow( 1 + ( interest / capitalizations ), capitalizations * year )
                +
                cont_amount * (
                    ( Math.pow( 1 + interest / capitalizations, capitalizations * year ) - 1 ) 
                    / 
                    ( Math.pow( 1 + interest / capitalizations, capitalizations / aportes ) - 1 )
                )
                - initial_capital - contributed
            ).toFixed(0);
        } else {
            var Ryear = currentAge - age_retire;
            if (retirement == 0) {
                fondo = initial_capital + +earnings + +contributed;
            }
            retirement = (
                fondo * Math.pow( 1 + ( interest / capitalizations ), capitalizations * Ryear )
                -
                pension * (
                    ( Math.pow( 1 + interest / capitalizations, capitalizations * Ryear ) - 1 ) 
                    / 
                    ( Math.pow( 1 + interest / capitalizations, capitalizations / 12 ) - 1 )
                )
            ).toFixed(0);
            initial_capital = 0;
            contributed = 0;
            earnings = 0;
        }

        $('.fondo').html('$'+fondo);

        data.push({
            'year': year,
            'age': currentAge,
            'initial_capital': initial_capital,
            'contributed': contributed,
            'earnings': earnings,
            'retirement': retirement,
        });

        var total = initial_capital + +contributed + +earnings;
        
        table.append(`
            <tr>
                <td>${year}</td>
                <td>${currentAge}</td>
                <td>$ ${contributed}</td>
                <td>$ ${earnings}</td>
                <td>$ ${total}</td>
                <td>$ ${retirement}</td>
            </tr>
        `);

        year++;
    }

    map_age = data.map(function(item) { return item.age });
    map_initial_capital = data.map(function(item) { return item.initial_capital });
    map_contributions = data.map(function(item) { return item.contributed });
    map_earnings = data.map(function(item) { return item.earnings });
    map_fund = data.map(function(item) { return item.retirement });

    if (myChart) {
        chartInfo.labels = map_age;
        chartInfo.datasets[0].data = map_initial_capital;
        chartInfo.datasets[1].data = map_contributions;
        chartInfo.datasets[2].data = map_earnings;
        chartInfo.datasets[3].data = map_fund;
        myChart.update();
    }
}

// SALARY CHANGE
$('#cont_amount, #pension').on('input change', function () {
    calculations();
})

// ON CHANGE
$('input[type="range"]').each(function () {
    var range = $(this);
    var parent = range.parent();

    range.on('input change', function () {
        $('.range-value', parent).html(range.val());
        calculations();
    })
})

// ON LOAD
$('input[type="range"]').each(function () {
    var range = $(this);
    var parent = range.parent();
    $('.range-value', parent).html(range.val());
})

calculations();

// SERIES
chartInfo = {
    labels: map_age,
    datasets: [
        {
            label: "Initial capital",
            fill: true,
            backgroundColor: colors.orange.fill,
            pointBackgroundColor: colors.orange.stroke,
            borderColor: colors.orange.stroke,
            pointHighlightStroke: colors.orange.stroke,
            borderCapStyle: 'butt',
            data: map_initial_capital,
        },
        {
            label: "Contributed",
            fill: true,
            backgroundColor: colors.pink.fill,
            pointBackgroundColor: colors.pink.stroke,
            borderColor: colors.pink.stroke,
            pointHighlightStroke: colors.pink.stroke,
            borderCapStyle: 'butt',
            data: map_contributions,
        },
        {
            label: "Interests",
            fill: true,
            backgroundColor: colors.darkBlue.fill,
            pointBackgroundColor: colors.darkBlue.stroke,
            borderColor: colors.darkBlue.stroke,
            pointHighlightStroke: colors.darkBlue.stroke,
            borderCapStyle: 'butt',
            data: map_earnings,
        },{
            label: "Retirement",
            fill: true,
            backgroundColor: colors.purple.fill,
            pointBackgroundColor: colors.purple.stroke,
            borderColor: colors.purple.stroke,
            pointHighlightStroke: colors.purple.stroke,
            borderCapStyle: 'butt',
            data: map_fund,
        }
    ]
};
renderChart( chartInfo );