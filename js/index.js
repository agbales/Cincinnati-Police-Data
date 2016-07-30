var aggregateComplaintRecords = {};
var allComplaintRecords = {};

function incrementCount(data, property, propertyValue) {
  data[property] = data[property] || {};
  data[property][propertyValue] = data[property][propertyValue] || 0;
  data[property][propertyValue]++;
}

function addTableRow(record) {
  var tr;
      tr = $('<tr>')
      .append( '<td>' + record.neighborhood + '</td>')
      .append('<td>' + record.district + '</td>')
      .append('<td>' + record.description + '</td></tr>')
      .append( '<td>' + record.complainant_sex + '</td>')
      .append('<td>' + record.complainant_race + '</td>')
      .append('<td>' + record.officer_sex + '</td>')
      .append('<td>' + record.officer_race + '</td>')
      .append('</tr>')

      $('#complaint-records').append(tr);
}

function initializeDistrict(record) {
  aggregateComplaintRecords.districts[record.district] = aggregateComplaintRecords.districts[record.district] || {};
}

function initializeNeighborhood(record) {
  aggregateComplaintRecords.neighborhoods[record.neighborhood] = aggregateComplaintRecords.neighborhoods[record.neighborhood] || {};
}

function tallyProperties(record) {
  for (var propertyIndex in (Object.keys(record))) {
    var property = Object.keys(record)[propertyIndex];
    incrementCount(aggregateComplaintRecords, property, record[property]);
    incrementCount(aggregateComplaintRecords.districts[record.district], property, record[property]);
    incrementCount(aggregateComplaintRecords.neighborhoods[record.neighborhood], property, record[property]);
  }
}

function showGlobalTotals() {
  $('#total-complaints').html('Total: ' + aggregateComplaintRecords.totalRecords);
  $('#black-complaints').html('Black: ' + aggregateComplaintRecords.complainant_race.Black);
  $('#white-complaints').html('White: ' + aggregateComplaintRecords.complainant_race.White);
  $('#hispanic-complaints').html('Hispanic: ' + aggregateComplaintRecords.complainant_race.Hispanic);
  $('#other-complaints').html('Other: ' + aggregateComplaintRecords.complainant_race.Other );
  $('#na-complaints').html('Unknown: ' + aggregateComplaintRecords.complainant_race.Unknown );
}

var colorPicker = function(num) {
  var comboOne =  {
      color: "#E08283",
      highlight: "#EC6A5C"
  }
  var comboTwo = {
      color: "#3E4348",
      highlight: "#6E7783"
  }
  var comboThree = {
      color: "#6AAFE6",
      highlight: "#E3E36A"
  }

  if (num % 2) {
    return comboTwo
  } else if (num % 3) {
    return comboThree
  } else {
    return comboOne
  }
}

function generateChart(property, type, data, appendId) {
  var propertiesToChart = [];
  propertiesToChart.push(property);
  for (var propertyIndex in propertiesToChart) {
    var property = propertiesToChart[propertyIndex];
    showChart(chartBuilder(data[property]), property, type, appendId);
  }
}

function chartBuilder(chartData) {
  var data = [];

  for (var propertyIndex in (Object.keys(chartData))) {
    var chartProperty = Object.keys(chartData)[propertyIndex];
    var chartValue = chartData[chartProperty];

    data.push(
      {
        value: chartValue,
        color: colorPicker(propertyIndex).color,
        highlight: colorPicker(propertyIndex).highlight,
        label: chartProperty
      }
    )
  }
  return data;
}

function showChart(data, p, t, a) {
  var id = p + parseInt(Math.random() * 1000);

  if (t == 'doughnut') {
    // Create canvas for each new chart
    $('#' + a).append('<div><canvas id="' + id + '" width="150px" height="150px"></canvas>'
                              + '<br><p>' + p.charAt(0).toUpperCase() + p.slice(1) + '</p></div>');
    var ctx = $('#' + id).get(0).getContext('2d');
    new Chart(ctx).Doughnut(data, {
      animateScale: false,
      animateRotate : true,
      animationSteps : 70,
      percentageInnerCutout : 50,
      legendTemplate : "",
      customTooltips: true,
      tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>"
    });
  } else if (t == 'bar' || 'horizontalBar') {

    // Still needs support for horizontalbar
    var labels = [];
    var values = [];
    var colors = [];
    for (var i = 0; i < data.length; i++){
      labels.push(data[i].label);
      values.push(data[i].value);
      colors.push(data[i].color)
    }

    var barData = {
      labels: labels,
      datasets: [{
        fillColor: '#E08283',
        data: values
      }]
    }

    $('#' + a).append('<hr><canvas id="' + id + '" width="700px" height="400px"></canvas>' +
                               '<br><p>By ' + p.charAt(0).toUpperCase() + p.slice(1) + '</p></div>');
    var ctx = $('#' + id).get(0).getContext('2d');
    new Chart(ctx).Bar(barData, {
      tooltipTemplate: "<%if (label){%>Distric <%=label%>: <%}%><%= value %> complaints"
    });
  }
}

$.getJSON("https://data.cincinnati-oh.gov/resource/5tnh-jksf.json", function (json) {
  // Global object updates
  aggregateComplaintRecords = { districts: {}, neighborhoods: {}, totalRecords: json.length };
  allComplaintRecords = json;

  // Main loop that constructs the necessary data for each record in the json response.
  for (i=0; i < json.length; i++) {
    var record = json[i]
    addTableRow(record);
    initializeDistrict(record);
    initializeNeighborhood(record);
    tallyProperties(record);
  }

  // Overview
  showGlobalTotals();
  generateChart('complainant_sex', 'doughnut', aggregateComplaintRecords, 'global-charts');
  generateChart('complainant_race', 'doughnut', aggregateComplaintRecords, 'global-charts');
  generateChart('officer_race', 'doughnut', aggregateComplaintRecords, 'global-charts');

  // District Charts
  for (var distIndex in aggregateComplaintRecords.districts) {
    generateChart('complainant_sex', 'doughnut', aggregateComplaintRecords.districts[distIndex], 'district-charts')
    generateChart('complainant_race', 'doughnut', aggregateComplaintRecords.districts[distIndex],'district-charts');
    generateChart('officer_race', 'doughnut', aggregateComplaintRecords.districts[distIndex], 'district-charts');
  }

  // Bar charts
  generateChart('district', 'bar', aggregateComplaintRecords);
  generateChart('neighborhood', 'horizontalBar', aggregateComplaintRecords);

  // Console log global variables
  console.log(aggregateComplaintRecords);
  console.log(allComplaintRecords);
});

function populateTable(district) {
  // Clear Table
  $('#complaint-records').html('')
  // Populate table with district records
  for (var i=0; i < allComplaintRecords.length; i++) {
    var record = allComplaintRecords[i];
    if (record.district == district) {
      addTableRow(record);
    }
  }
}

$('.svg-district').click(function(){
  var district = this.id.slice(-1);
  populateTable(district);
});

$('ul.sidebar-nav li a').click(function(){
  var district = $(this).text().slice(-1);
  populateTable(district);
});