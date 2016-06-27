$.getJSON("https://data.cincinnati-oh.gov/resource/5tnh-jksf.json", function (json) {  
  /* Populate Table */
  var aggregateCrimeData = { districts: {}, neighborhoods: {}, totalRecords: json.length };
  
  function incrementCount(jsonObject, property, propertyValue) {
    jsonObject[property] = jsonObject[property] || {};
    jsonObject[property][propertyValue] = jsonObject[property][propertyValue] || 0;
    jsonObject[property][propertyValue]++;
  }
  
  function addTableRow(record) {
    var tr;
        tr = $('<tr>')
        .append( '<td>' + json[i].neighborhood + '</td>')
        .append('<td>' + json[i].district + '</td>')
        .append('<td>' + json[i].description + '</td></tr>')
        .append( '<td>' + json[i].complainant_sex + '</td>')
        .append('<td>' + json[i].complainant_race + '</td>')
        .append('<td>' + json[i].officer_sex + '</td>')
        .append('<td>' + json[i].officer_race + '</td>')
        .append('</tr>')
        
        $('#complaint-records').append(tr);    
  }
  
  function initializeDistrict(aggregateCrimeData, record) {
    aggregateCrimeData.districts[json[i].district] = aggregateCrimeData.districts[json[i].district] || {};
  }
  
  function initializeNeighborhood(aggregateCrimeData, record) {
    aggregateCrimeData.neighborhoods[json[i].neighborhood] = aggregateCrimeData.neighborhoods[json[i].neighborhood] || {};
  }
  
  function tallyProperties(aggregateCrimeData, record) {
    for (var propertyIndex in (Object.keys(json[i]))) {
      var property = Object.keys(json[i])[propertyIndex];
      incrementCount(aggregateCrimeData, property, json[i][property]);
      incrementCount(aggregateCrimeData.districts[json[i].district], property, json[i][property]);
      incrementCount(aggregateCrimeData.neighborhoods[json[i].neighborhood], property, json[i][property]);
    }
  }
  
  function showGlobalTotals(aggregateCrimeData) {
    $('#total-complaints').html('Total: ' + aggregateCrimeData.totalRecords);
    $('#black-complaints').html('Black: ' + aggregateCrimeData.complainant_race.Black); 
    $('#white-complaints').html('White: ' + aggregateCrimeData.complainant_race.White); 
    $('#hispanic-complaints').html('Hispanic: ' + aggregateCrimeData.complainant_race.Hispanic); 
    $('#other-complaints').html('Other: ' + aggregateCrimeData.complainant_race.Other );
    $('#na-complaints').html('Unknown: ' + aggregateCrimeData.complainant_race.Unknown );
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
  
  function generateChart(aggregateCrimeData, p, t) {    
    var propertiesToChart = [];
    propertiesToChart.push(p);
    for (var propertyIndex in propertiesToChart) {
      var property = propertiesToChart[propertyIndex];
      showChart(chartBuilder(aggregateCrimeData[property]), p, t);
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
  
  function showChart(data, p, t) { 
    if (t == 'doughnut') {
      // Create canvas for each new chart
      $('#global-charts').append('<div><canvas id="' + p + '" width="100px" height="100px"></canvas>'
                                + '<br><p>' + p + '</p></div>');
      var ctx = $('#' + p).get(0).getContext('2d');
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
          fillColor: '#AF4034',
          data: values
        }]
      }
      
      $('#global-charts').append('<hr><canvas id="' + p + '"></canvas>' +
                                 '<br><p>By ' + p.charAt(0).toUpperCase() + p.slice(1) + '</p></div>');
      var ctx = $('#' + p).get(0).getContext('2d');
      new Chart(ctx).Bar(barData, {
        tooltipTemplate: "<%if (label){%>Distric <%=label%>: <%}%><%= value %> complaints"
      });
    }
  }
  
  // Main loop that constructs the necessary data for each record in the json response.
  for (i=0; i < json.length; i++) {
    addTableRow(json[i]);
    initializeDistrict(aggregateCrimeData, json[i]);
    initializeNeighborhood(aggregateCrimeData, json[i]);
    tallyProperties(aggregateCrimeData, json[i]);
  } // end loop
  
  // Overview
  showGlobalTotals(aggregateCrimeData);
  generateChart(aggregateCrimeData, 'complainant_sex', 'doughnut');
  generateChart(aggregateCrimeData, 'complainant_race', 'doughnut');
  generateChart(aggregateCrimeData, 'officer_race', 'doughnut');
  
  // Bar charts
  generateChart(aggregateCrimeData, 'district', 'bar');
  generateChart(aggregateCrimeData, 'neighborhood', 'horizontalBar');

});


$('#D1').click(function(){
  $('#complaint-records').html('')
})