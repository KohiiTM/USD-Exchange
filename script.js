document.addEventListener("DOMContentLoaded", function () {
  const svg = d3.select("#chart");
  let currentChartType = "force"; // Track current chart type

  if (svg.empty()) {
    console.error(
      "D3 could not find the SVG element with id #chart. Halting script."
    );
    return;
  }

  const width = +svg.attr("width");
  const height = +svg.attr("height");

  // Create tooltip div
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "8px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");

  const drag = (simulation) => {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  const drawForceGraph = (rates, requestedCurrency) => {
    svg.selectAll("*").remove();

    let currenciesToShow = new Set([
      "JPY",
      "EUR",
      "GBP",
      "CAD",
      "CHF",
      "AUD",
      "CNY",
      "INR",
      "BRL",
      "MXN",
    ]);
    if (requestedCurrency) currenciesToShow.add(requestedCurrency);

    const nodes = [{ id: "USD", value: 1, isBase: true }];
    for (const code of currenciesToShow) {
      if (rates[code] && code !== "USD") {
        nodes.push({ id: code, value: rates[code] });
      }
    }

    const links = nodes
      .filter((d) => !d.isBase)
      .map((d) => ({ source: "USD", target: d.id }));

    const rateValues = nodes.filter((d) => !d.isBase).map((d) => d.value);
    const domain = rateValues.length > 0 ? d3.extent(rateValues) : [1, 1];
    const radiusScale = d3.scaleLog().domain(domain).range([6, 25]);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3
          .forceCollide()
          .radius((d) => (d.isBase ? 12 : radiusScale(d.value)) + 2)
      );

    const link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6);

    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation));

    node
      .append("circle")
      .attr("r", (d) => (d.isBase ? 12 : radiusScale(d.value)))
      .attr("fill", (d) => {
        if (d.isBase) return "#ff4136";
        if (d.id === requestedCurrency) return "orange";
        return "teal";
      })
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `Currency: ${d.id}<br/>` +
              `Rate: 1 USD = ${d.value.toFixed(4)} ${d.id}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    node
      .append("text")
      .text((d) => d.id)
      .attr("x", (d) => (d.isBase ? 16 : radiusScale(d.value) + 4))
      .attr("y", 5)
      .attr("fill", "#333");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });
  };

  const drawHistoricalChart = (historicalData, currency) => {
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleTime()
      .domain(d3.extent(historicalData, (d) => new Date(d.date)))
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(historicalData, (d) => d.rate) * 1.1])
      .range([innerHeight, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis
    g.append("g").call(d3.axisLeft(y));

    // Add line
    const line = d3
      .line()
      .x((d) => x(new Date(d.date)))
      .y((d) => y(d.rate));

    g.append("path")
      .datum(historicalData)
      .attr("fill", "none")
      .attr("stroke", "#2563eb")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(`USD to ${currency} Exchange Rate`);

    // Add dots with tooltips
    g.selectAll("circle")
      .data(historicalData)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(new Date(d.date)))
      .attr("cy", (d) => y(d.rate))
      .attr("r", 4)
      .attr("fill", "#2563eb")
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `Date: ${d.date}<br/>` +
              `Rate: 1 USD = ${d.rate.toFixed(4)} ${currency}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Add vertical line for hover effect
    const focus = g.append("g").attr("class", "focus").style("display", "none");

    focus
      .append("line")
      .attr("class", "x-hover-line")
      .attr("y1", 0)
      .attr("y2", innerHeight);

    // Add hover effect for the entire chart area
    g.append("rect")
      .attr("class", "overlay")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function () {
        focus.style("display", null);
      })
      .on("mouseout", function () {
        focus.style("display", "none");
      })
      .on("mousemove", function (event) {
        const x0 = x.invert(d3.pointer(event)[0]);
        const i = d3
          .bisector((d) => new Date(d.date))
          .left(historicalData, x0, 1);
        const d0 = historicalData[i - 1];
        const d1 = historicalData[i];
        const d = x0 - new Date(d0.date) > new Date(d1.date) - x0 ? d1 : d0;

        focus.attr("transform", `translate(${x(new Date(d.date))},0)`);

        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `Date: ${d.date}<br/>` +
              `Rate: 1 USD = ${d.rate.toFixed(4)} ${currency}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      });
  };

  const fetchHistoricalData = async (currency) => {
    // For demo purposes, we'll generate synthetic data
    // In a real application, you would fetch this from an API
    const today = new Date();
    const data = [];
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      // Generate random rate with some trend
      const baseRate = 1 + Math.random() * 0.5;
      const trend = Math.sin(i / 30) * 0.2;
      data.push({
        date: date.toISOString().split("T")[0],
        rate: baseRate + trend,
      });
    }
    return data;
  };

  // Add chart type toggle handler
  document
    .querySelector("#chart-type")
    .addEventListener("change", function (e) {
      currentChartType = e.target.value;
      const currency = document.querySelector("#currency").value.toUpperCase();
      if (currency) {
        if (currentChartType === "force") {
          fetch(
            "https://v6.exchangerate-api.com/v6/5887d75cfffdf455df15db3a/latest/USD"
          )
            .then((response) => response.json())
            .then((data) => drawForceGraph(data.conversion_rates, currency));
        } else {
          fetchHistoricalData(currency).then((data) =>
            drawHistoricalChart(data, currency)
          );
        }
      }
    });

  document.querySelector("form").onsubmit = function () {
    const usdAmount = parseFloat(document.querySelector("#usd_amount").value);
    const currency = document.querySelector("#currency").value.toUpperCase();

    if (isNaN(usdAmount) || usdAmount <= 0) {
      document.querySelector("#result").innerHTML =
        "Please enter a valid USD amount.";
      return false;
    }

    fetch(`${config.API_BASE_URL}/${config.API_KEY}/latest/USD`)
      .then((response) => response.json())
      .then((data) => {
        const rates = data.conversion_rates;
        const rate = rates[currency];

        if (rate !== undefined) {
          const convertedAmount = (usdAmount * rate).toFixed(2);
          document.querySelector(
            "#result"
          ).innerHTML = `${usdAmount} USD is equal to ${convertedAmount} ${currency}.`;

          if (currentChartType === "force") {
            drawForceGraph(rates, currency);
          } else {
            fetchHistoricalData(currency).then((data) =>
              drawHistoricalChart(data, currency)
            );
          }
        } else {
          document.querySelector("#result").innerHTML =
            "Invalid currency code.";
        }
      })
      .catch((error) => {
        console.log("Error:", error);
        document.querySelector("#result").innerHTML =
          "An error occurred. Please try again.";
      });
    return false;
  };

  const initialRates = {
    JPY: 157.5,
    EUR: 0.93,
    GBP: 0.79,
    CAD: 1.37,
    CHF: 0.89,
    AUD: 1.5,
    CNY: 7.25,
    INR: 83.5,
    BRL: 5.42,
    MXN: 18.45,
    ZAR: 18.4,
    NZD: 1.63,
    SGD: 1.35,
    HKD: 7.81,
    SEK: 10.48,
    KRW: 1380.5,
  };
  drawForceGraph(initialRates);
});
