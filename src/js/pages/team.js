const dataService = new DataService();
var competitionLadder = [];
var data = [];
var xAxis = "years";
var minYear = Math.min.apply(Math, dataService.getYears());
var maxYear = Math.max.apply(Math, dataService.getYears());

$(function () {
    $("#tabs").tabs();
    loadFilterBar();
    renderPerformanceVisualization();
});

// load cboCountry, cboTeams, cboPart and slider on the filter bar
function loadFilterBar() {
    // cboTeams
    $('#cbo-teams').select2({
        placeholder: "Select teams...",
        width: "580px",
        data: dataService.getCboTeams(),
        allowClear: true
    });
    $('#cbo-teams').on('change', function (e) {
        renderPerformanceVisualization();
    });

    // cboCountry
    $('#cbo-country').select2({
        width: "130px",
        data: dataService.getCboCountries()
    });

    $('#cbo-country').on('change', function (e) {
        $("#cbo-teams").empty().select2({
            placeholder: "Select teams...",
            width: "580px",
            data: dataService.getCboTeams($("#cbo-country").val()),
            allowClear: true
        });

        renderPerformanceVisualization();
    });

    // cboPart
    $('#cbo-part').select2({
        width: "130px",
        data: dataService.getCboParts()
    });
    $('#cbo-part').val("finals").trigger('change');
    $('#cbo-part').on('change', function (e) {
        renderPerformanceVisualization();
    });

    // slider
    $("#slider-range").slider({
        range: true,
        min: minYear,
        max: maxYear,
        values: [minYear, maxYear],
        stop: function(event, ui) {
            // do something on mouseup anywhere
            var fromYear = ui.values[0];
            var toYear = ui.values[1];
            $("#amount").text(fromYear + " - " + toYear);

            if (toYear - fromYear == 0) {
                $("#cbo-part").attr("disabled", true);
                xAxis = "parts";
                renderPerformanceVisualization();
            } else {
                $("#cbo-part").attr("disabled", false);
                xAxis = "years";
                renderPerformanceVisualization();
            }
        }
    });
    $("#amount").text($("#slider-range").slider("values", 0) +
        " - " + $("#slider-range").slider("values", 1));

    // btn extract csv
    var headers1 = {
        year: "Year",
        team: "Team",
        rank: "Rank",
        points: "Points",
        goalsFor: "Goals for",
        goalsAgainst: "Goals against",
        goalsPercentage: "Goals percentage",
    };
    var headers2 = {
        year: "Year",
        team: "Team",
        rank: "Rank",
        points: "Points",
        goalsFor: "Goals for",
        goalsAgainst: "Goals against",
        goalsPercentage: "Goals percentage",
        part: "Part"
    };
    $("#btn-export-csv").click(() => {
        var headers, note, part, fileName;
        
        // get headers, fileName
        if (xAxis == "years") {
            // xAxis == "years"
            headers = headers1;
            part = $("#cbo-part").select2("data")[0].text;
            note = { note: "Note: The Rank in this file is the rank at part \"" + part + "\" of the season." };
            fileName =
                "team-performance_"
                + part + "_"
                + $("#slider-range").slider("values", 0) + "-" + $("#slider-range").slider("values", 1);
        } else {
            // xAxis == "parts"
            headers = headers2;
            part = "all";
            note = null;
            fileName =
                "team-performance_"
                + part + "_"
                + $("#slider-range").slider("values", 0);
        }

        exportCSVFile(headers, this.formatCSVData(data), fileName, note);
    });
}

function renderPerformanceVisualization() {
    // remove existing
    d3.select("#d3-performance").selectAll("*").remove();

    // get data
    competitionLadder = dataService.getCompetitionLadder(
        $("#cbo-country").val(),
        $("#cbo-teams").val(),
        $("#slider-range").slider("values", 0),
        $("#slider-range").slider("values", 1),
        $("#cbo-part").val(),
        xAxis
    );
    data = (xAxis == "years") ? competitionLadder[0].competitionLadder : competitionLadder;

    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 30, left: 50 },
        width = 260 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;
        
    // group the data: I want to draw one line per group
    var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
        .key(function (d) { return d.team; })
        .entries(data);

    // What is the list of groups?
    allKeys = sumstat.map(function (d) { return d.key })

    // Add an svg element for each group. The will be one beside each other and will go on the next row when no more room available
    var svg = d3.select("#d3-performance")
        .selectAll("uniqueChart")
        .data(sumstat)
        .enter()
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
            
    if (xAxis == "years") {
        // xAxis is years
        var yearRange = $("#slider-range").slider("values", 1) - $("#slider-range").slider("values", 0);
        var xTicksNumer =  (yearRange >= 3)
            ? /*3*/ yearRange
            : yearRange;
        var x = d3.scaleLinear()
            .domain(d3.extent(data, function (d) { return d.year; }))
            .range([0, width]);

        svg
            .append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axis-bottom")
            .call(d3.axisBottom(x).ticks(xTicksNumer).tickFormat(d => { return d; }));
    } else {
        // xAxis is parts (early, mid, end, finals)
        var x = d3.scaleLinear()
            .domain(d3.extent(data, function (d) { return d.partNumber; }))
            .range([0, width]);

        svg
            .append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axis-bottom")
            .call(d3.axisBottom(x).ticks(4).tickFormat(d => { return dataService.getPartByPartNumber(d); }));
    }

    //Add Y axis
    var y = d3.scaleLinear()
        .domain([1, d3.max(data, function (d) { return +d.rank; })])
        .range([0, height]);
    svg.append("g")
        .attr("class", "axis-left")
        .call(d3.axisLeft(y).ticks(10));

    // color palette
    var color = d3.scaleOrdinal()
        .domain(allKeys)
        .range([
            '#1f77b4', // blue
            '#d62728', // red
            '#2ca02c'  // green
        ]);

    // Draw the line
    svg
        .append("path")
        .attr("fill", "none")
        .attr("stroke", function (d) { return color(d.key) })
        .attr("stroke-width", 3)
        .attr("d", function (d) {
            return d3.line()
                .x(function (d) { return x((xAxis == "years") ? d.year : d.partNumber); })
                .y(function (d) { return y(+d.rank); })
                (d.values)
        });

    // Add titles
    svg
        .append("text")
        .attr("text-anchor", "start")
        .attr("y", -5)
        .attr("x", 40)
        .text(function (d) { return (d.key) })
        .style("fill", function (d) { return color(d.key) });

    // add icon
    svg
        .append("svg:image")
        .attr("y", -20)
        .attr("x", 10)
        .attr('width', 20)
        .attr('height', 20)
        .attr("xlink:href", function (d) { return "assets/icon/" + dataService.getCountryOfTeam(d.key) + ".png"; });

    svg.append("g")
        .attr("class", "y-axis")
        .call(y)
        .append("text")
        // .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("x", 5)
        .attr("dy", ".71em")
        // .style("text-anchor", "end")
        .text("Rank");
}

function formatCSVData(inputData) {
    var data = JSON.parse(JSON.stringify(inputData));

    data.forEach(item => {
        delete item.finalRank;

        if (xAxis == "parts") {
            delete item.partNumber;
        }
    });

    return data;
}