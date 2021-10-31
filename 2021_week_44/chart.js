const drawChart = async () => {
  const dataset = await d3.csv("week_44_data.csv", (d) => ({
    event_race: d.event_race,
    event: d.event,
    race: d.race,
    year: +d.year,
    time: +d.time_in_seconds,
  }));

  const races = [...new Set(dataset.map((d) => d.event_race))];

  const xAccessor = (d) => d.year;
  const yAccessor = (d) => d.time;

  const axisPadding = 10;

  let dimensions = {
    width: window.innerWidth * 0.8,
    height: 400,
    margin: { top: 10, right: 20, bottom: 30, left: 70 },
  };

  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;

  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const bounds = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth]);

  let counter = 0;

  let singleRace = dataset.filter((d) => d.event_race === races[counter]);

  const t = () => d3.transition().duration(800);

  const line = bounds.append("g").attr("class", "line").append("path");

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(singleRace, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  const subTitleEvent = d3.select("#event").text(singleRace[0].event);
  const subTitleRace = d3.select("#race").text(singleRace[0].race);

  const setupChart = () => {
    const lineGenerator = d3
      .line()
      .x((d) => xScale(xAccessor(d)))
      .y((d) => yScale(yAccessor(d)));

    line.data([null]).join(
      (enter) =>
        enter
          .attr("fill", "transparent")
          .attr("stroke", "#2a9d8f")
          .attr("stroke-width", 2)
          .attr("d", lineGenerator(singleRace)),
      (update) =>
        update
          .attr("fill", "transparent")
          .attr("stroke", "#2a9d8f")
          .attr("stroke-width", 2)
          .call((update) =>
            update.transition(t()).attr("d", lineGenerator(singleRace))
          )
    );

    const points = bounds
      .selectAll("circle")
      .data(singleRace)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("cx", (d) => xScale(xAccessor(d)))
            .attr("cy", (d) => yScale(yAccessor(d)))
            .attr("fill", "#264653")
            .attr("r", 0)
            .call((enter) => enter.transition(t()).attr("r", 5)),
        (update) =>
          update.call((update) =>
            update
              .transition(t())
              .attr("cx", (d) => xScale(xAccessor(d)))
              .attr("cy", (d) => yScale(yAccessor(d)))
          ),
        (exit) =>
          exit.call((exit) => exit.transition(t()).attr("r", 0).remove())
      );

    bounds.select(".y-axis").transition(t()).call(yAxisGenerator);
  };

  const timeFormat = (d) => {
    const timeHours = d / 60 ** 2;
    const hours = Math.floor(timeHours);
    const minutes = Math.round((timeHours - hours) * 60);
    return `${hours}H ${minutes < 10 ? "0" + minutes : minutes}M`;
  };

  const xAxisGenerator = d3
    .axisBottom()
    .scale(xScale)
    .tickFormat(d3.format(""));

  const xAxis = bounds
    .append("g")
    .attr("class", "x-axis")
    .call(xAxisGenerator)
    .style(
      "transform",
      `translateY(${dimensions.boundedHeight + axisPadding}px)`
    );

  const yAxisGenerator = d3
    .axisLeft()
    .scale(yScale)
    .tickFormat((d) => timeFormat(d))
    .ticks(6);

  const yAxis = bounds
    .append("g")
    .attr("class", "y-axis")
    .call(yAxisGenerator)
    .style("transform", `translateX(${-axisPadding}px)`);

  setupChart();

  const caption = d3
    .select("#wrapper")
    .append("p")
    .html("<strong>Data:</strong> ITRA | <strong>Plot:</strong> Kaustav Sen");

  const button = d3.select("#wrapper").append("button").html("Change Race");

  button.on("click", changeRace);

  function changeRace() {
    counter++;
    singleRace = dataset.filter((d) => d.event_race === races[counter % 10]);
    yScale.domain(d3.extent(singleRace, yAccessor));
    yAxisGenerator.scale(yScale);
    setupChart();
    subTitleEvent.text(singleRace[0].event);
    subTitleRace.text(singleRace[0].race);
  }
};
drawChart();
