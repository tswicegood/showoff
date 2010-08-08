var chartHandlers = {
  // This is a helper function that will extract the values from a 'table' element, 
  // generating a list of labels and a number of series.  It then yields the labels and
  // series back to the callback.
  //
  // Note that each series can have its own set of labels so, in both cases, you are
  // getting an array of arrays.  Blank cells, both for labels and values, are ignored.
  extractSeries: function(table, callback) {
    var labels = [], series = [];

    elementHelper = function(a, callback) {
      return function(index, cell) {
        b = (a[index] = a[index] || []);
        text = $(cell).text();
        if (text.length > 0) {
          b.push(callback(text));
        }
      };
    };
    $("tr", table).each(function () {
      $('td', this).each(elementHelper(series, function(text) {
        return parseInt(text, 10);
      }));
      $('th', this).each(elementHelper(labels, function(text) {
        return text;
      }));
    });
    callback(labels, series);
  },

  // Generates a pie chart.
  pie: function(chart, table, options) {
    var labels, series;
    this.extractSeries(table, function(l,v) { labels = l, series = v; });

    options = $.extend(options || {}, {
      legend: labels[0],
      legendpos: 'west'
    });

    // Make sure that the chart scales into the slide
    var minimumDimension = chart.width() < chart.height() ? chart.width() : chart.height();
    var center           = minimumDimension / 2;
    var radius           = (2 * minimumDimension) / 6; // Diameter = 2/3 minimumDimension

    Raphael(chart[0], chart.width(), chart.height()).g.piechart(
      chart.width() / 2, chart.height() / 2, radius, 
      series[0], options
    );
  },

  // Generates a barchart, both single and multi-series versions.
  bar: function(chart, table, options) {
    var labels, series;
    this.extractSeries(table, function(l,v) { labels = l, series = v; });

    options = options || {};

    Raphael(chart[0], chart.width(), chart.height()).g.barchart(
      0, 0, chart.width(), chart.height(),
      series,
      options
    );
  },

  // Generates a stacked barchart.
  stacked: function(chart, table, options) {
    this.bar(chart, table, { stacked: true });
  },

  // Generates a line chart.
  line: function(chart, table, options) {
    var labels, series;
    this.extractSeries(table, function(l,v) { labels = l, series = v; });
    
    options = $.extend(options || { }, {
      axis: "0 0 1 1",
      symbol: 'o',
      smooth: true
    });


    Raphael(chart[0], chart.width(), chart.height()).g.linechart(
      50, 0, chart.width() - 100, chart.height() - 150,
      labels, series, options
    );
  },

  // Generates an area chart.
  area: function(chart, table, options) {
    this.line(chart, table, { shade: true });
  },

  dot: function(chart, table, options) {
    var xlabels = [], ylabels = [], series = [];

    // First row contains the Y axis labels, subsequent rows are the points
    // in the series and the X axis labels.
    $('tr:first-child', table).each(function() {
      $('th', this).each(function(index, cell) {
        ylabels.push($(cell).text());
      });
    });
    $('tr:first-child ~ tr', table).each(function() {
      $('td', this).each(function(index, cell) {
        values = (series[index] = series[index] || []);
        values.push(parseInt($(cell).text(), 10));
      });
      $('th', this).each(function(index, cell) {
        xlabels.push($(cell).text());
      });
    });

    // Flatten the series and then generate the (x,y) coordinates for
    // the labels
    positionHelper = function(callback) {
      return function(e, i) {
        positions = [];
        for (a = 0; a < e.length; ++a) { positions.push(callback(a, i)); }
        return positions;
      };
    };
    data        = $.map(series, function(e, i) { return e; });
    x_positions = $.map(series, positionHelper(function(v, i) { return v; }));
    y_positions = $.map(series, positionHelper(function(v, i) { return i; }));

    // We need to set the maximum value so that it'll scale the dots
    max = -9999999999;
    data.each(function(v) { max = (v > max) ? v : max; });

    options = $.extend(options || {}, {
      axis: '0 0 1 1',
      symbol: 'o',
      heat: true,
      max: max,
      axisxlabels: xlabels, axisxstep: xlabels.length-1, axisxtype: ' ',
      axisylabels: ylabels, axisystep: ylabels.length-1, axisytype: ' '
    });

    Raphael(chart[0], chart.width(), chart.height()).g.dotchart(
      0, 0, chart.width(), chart.height(),
      x_positions, y_positions, data, options
    );
  }
};
