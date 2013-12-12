(function() {
		var init = function($)	
		{

		/* Check to see if the browser is IE 6,7,8 - ie, no SVG support */
		/* Hides the table and shows the SVG if javascript is enabled */
		$(".outer-wrapper .info-table-wrapper").css({"display":"none"});
		$(".outer-wrapper .salary-table-wrapper").css({"display":"none"});
		$(".outer-wrapper .info-chart").css({"display":"block"});
		$(".outer-wrapper .info-menu").css({"display":"block"});
		$(".outer-wrapper .nav-tabs").css({"display":"block"});

		/* Load D3 */
		/* All of the D3/svg code is contained within the call back function */
		/* Loading D3 into ie6-8 seems to cause a runtime error */		
		$.getScript("http://d3js.org/d3.v3.min.js", function() {

			/* Width and height */
			var w = 625,
			h = 300,
			/* Space between the bars */
			barPadding = 5,
			/* Padding used throughout the SVF */
			padding = 60,
			/* Delay used for transitions */
			delayLength = 500,
			infoTableArray = [],
			maleTableArray = [],
			femaleTableArray = [],
			/* An array to store the data from the ths within the tables head */
			headingRowArray = [],
			/* initial values for the selections on page load */
			selectedPosition = "all-positions",
			selectedSex = "both-sexes",
			maleSelected = "male",
			femaleSelected = "female",
			selectedField = "all-fields",
			adjustScaleCheck = false,
			maleObjectArray = [],
			femaleObjectArray = [],
			dataset = [],
			salarySelected = "all-occupations",
			degreeField = "all-degrees",
			ageSelected = "all-ages",
			genderRowArray = [],
			salaryTableArray = [],
			maxSalaryArray = []
			thousandFormat =  d3.format(",.0f"),
			stack = d3.layout.stack();


			/* get the relevent row of male data */
			function getMaleTableData(x, y) {
				/* First remove the existing data from the arrays */
				while (maleObjectArray.length > 0) {
					maleObjectArray.shift();
					} 

				while (maleTableArray.length > 0) {
					maleTableArray.shift();
					} 

				$(".outer-wrapper table.info-table." + x + " .male ." + y).each( function() {
					var sometext = parseFloat($(this).text());
					maleTableArray.push(sometext);
				});

				/* Construct objects in the form { x:index, y:data } for each */
				/* and push these objects into the array maleObjectArray  */
				for (var i = 0; i < headingRowArray.length; i++) {
					var newObject = {};
					newObject.x = i;
					newObject.y = maleTableArray[i];
					maleObjectArray.push(newObject);
				};

			}

			/* get the relevent row of female data */
			function getFemaleTableData(x, y) {
				/* First remove the existing data from the arrays */
				while (femaleObjectArray.length > 0) {
					femaleObjectArray.shift();
					} 

				while (femaleTableArray.length > 0) {
					femaleTableArray.shift();
					} 

				$(".outer-wrapper table.info-table." + x + " .female ." + y ).each( function() {
					var sometext = parseFloat($(this).text());
					femaleTableArray.push(sometext);
				});

				/* As above in getMaleTableData */
				for (var i = 0; i < headingRowArray.length; i++) {
					var newObject = {};
					newObject.x = i;
					newObject.y = femaleTableArray[i];
					femaleObjectArray.push(newObject);
				};

			}

			/* The original function that gets the data from the total row */
			/* Maybe only needed for the pop up box now? */
			function getNewTableData(x, y) {
				/* First remove the existing data from the array */
				infoTableArray = [];
				$(".outer-wrapper table.info-table." + x + " .both-sexes ." + y).each( function() {
					var sometext = parseFloat($(this).text());
					infoTableArray.push(sometext);
				});
			};

			/* A function to transiont the height of the bars and recalcuate the ticks of the yAxis */
			/* Called when the user chooses a new combination of options */
			function updateBars() {

					/* We pass new our array of arrays of objects into D3's stack function */
					stack(dataset);

					if(adjustScaleCheck) {
						/* Redefine Y scale with the new dataset */
						yScale.domain([0,				
								d3.max(dataset, function(d) {
									return d3.max(d, function(d) {
										return d.y0 + d.y;
									});
								})
							]);

						/* Call the Y axis again to adjust it to the new scale */
						d3.select(".outer-wrapper .info-chart .y")
							.transition()
							.duration(delayLength)
							.call(yAxis);
					} else {
						/* Redefine Y scale with the maximum values */
						yScale.domain([0, d3.max(maximumTableValue)]);

						/* Call the Y axis again to adjust it to the new scale */
						d3.select(".outer-wrapper .info-chart .y")
							.transition()
							.duration(delayLength)
							.call(yAxis);

					}

					/* Add a rect for each data value */
					groups.selectAll("rect")
					.data(function(d) { return d; })
					.transition()
					.duration(delayLength)
					.attr("y", function(d) {
						return yScale(d.y) + yScale(d.y0) - h;
					})
					.attr("height", function(d) {
						return h - yScale(d.y);
					});

			};

			/* A function to retrieve every data point from the table to set the scale */
			function getMaxSalaryData() {
				$(".outer-wrapper table.salary-table td").each( function() {
					var sometext = parseFloat($(this).text());
					maxSalaryArray.push(sometext);
				});
			};

			/* The original function that gets the data from the first row */
			function getSalaryTableData(x, y, z) {
				/* First remove the existing data from the array */
				salaryTableArray = [];
				$(".outer-wrapper table.salary-table." + x + " ." + y + "." + z + " td").each( function() {
					var sometext = parseFloat($(this).text());
					salaryTableArray.push(sometext);
				});
			};

			function updateSalaryBars() {

				svgSalary.selectAll("rect")
					.data(salaryTableArray)
					.transition()
					.attr("opacity", function (d) {
						if ( d === 0 ) {
							return 0;
						} else {
							return 1;
						}
					})
					.transition()
					.duration(delayLength)
					.attr("y", function(d){
						if ( d === 0 ) {
							return h/2;
						} else {
							return ySalaryScale(d);
						}
					})
					.attr("height", function(d){
						if ( d === 0 ) {
							return h - (h/2);
						} else {
							return h - ySalaryScale(d);
						}
					});

				salaryWhiteTextGroup.selectAll("text")
					.data(salaryTableArray)
					.transition()
					.attr("fill", function (d) {
						if ( d === 0 ) {
							return "black";
						} else {
							return "white";
						}
					})					
					.transition()
					.duration(delayLength)
					.text(function(d) {
						if ( d === 0 ) {
							return "Data not available";
						} else {
							return "$" + thousandFormat(d);
						}
					})
					.attr("y", function(d){
						if ( d === 0 ) {
							return (h/2) + 20;
						} else {
							return ySalaryScale(d) + 20;
						}					
					});

			};



			/* Event listeners for the two tabs to switch views */
			$('.outer-wrapper .nav-tabs a:first').click(function (e) {
				
				if (!$(this).parent("li").hasClass("active")) {
					$('.outer-wrapper .nav-tabs a:not(:first)').parent("li").removeClass("active");
					$(this).parent("li").addClass("active");
					$(".outer-wrapper .info-chart").css({"display":"block"});
					$(".outer-wrapper .salary-chart").css({"display":"none"});
					$(".outer-wrapper .info-menu").css({"display":"block"});
					$(".outer-wrapper .salary-menu").css({"display":"none"});
				}
				e.preventDefault();
				return false;
			});

			$('.outer-wrapper .nav-tabs a:not(:first)').click(function (e) {
				
				if (!$(this).parent("li").hasClass("active")) {
					$('.outer-wrapper .nav-tabs a:first').parent("li").removeClass("active");
					$(this).parent("li").addClass("active");
					$(".outer-wrapper .info-chart").css({"display":"none"});
					$(".outer-wrapper .salary-chart").css({"display":"block"});
					$(".outer-wrapper .info-menu").css({"display":"none"});
					$(".outer-wrapper .salary-menu").css({"display":"block"});
				}
				e.preventDefault();
				return false;

			});		

			/* get the data from the first heading row containing all the years */
			/* only needs to happen once */
			$(".outer-wrapper table.info-table.all-positions thead tr th:not(:first)").each(function() {
				var headingData = $(this).text();
				headingRowArray.push(headingData);
			});

			/* An initial call of the function to populate the graph on page load */
			getNewTableData(selectedPosition, selectedField);
			getMaleTableData(selectedPosition, selectedField);
			getFemaleTableData(selectedPosition, selectedField);

			/* store a copy of the top row, i.e. the one with the highest values for use when adjusting/reseting scale */
			var maximumTableValue = infoTableArray.concat();

			/* At this point all our arrays are populated with data as arrays of objects */
			/* We push those arrays of objects inside the master 'dataset' inorder to make use of the stack function */
			dataset.push(femaleObjectArray);
			dataset.push(maleObjectArray);

			/* We pass our array of arrays of objects into D3's stack function */
			stack(dataset);

			/* Define X scale */
			var xScale = d3.scale.linear()
				.domain([padding, w ])
				.range([padding, w  ]);		 

			/* Define Y scale */
			var yScale = d3.scale.linear()
				.domain([0,				
					d3.max(dataset, function(d) {
						return d3.max(d, function(d) {
							return d.y0 + d.y;
						});
					})
				])
				.range([h, padding]);

			/* Define X axis */
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom")
				.tickSize(0, 0)
				.ticks(0);

			/* Define Y axis */
			var yAxis = d3.svg.axis()
				.scale(yScale)
				.orient("left")
				.tickSize(6, 0)
				.ticks(7);	

			/* Create SVG element */
			var svg = d3.select(".outer-wrapper .info-chart")
						.append("svg")
						.attr("width", w)
						.attr("height", h + (padding / 2));

			/* Add a group for each row of data */
			var groups = svg.selectAll("g")
				.data(dataset)
				.enter()
				.append("g")
				.style("fill", function(d, i) {
					return	i === 0 ? "#E53524" : "#F8B436"; 
				});

			/* Add a rect for each data value */
			var rects = groups.selectAll("rect")
				.data(function(d) { return d; })
				.enter()
				.append("rect")
				.attr("x", function(d, i) {
					return i * ((w - padding) / dataset[0].length) + padding;;
				})
				.attr("y", function(d) {
					return yScale(d.y) + yScale(d.y0) - h;
				})
				.attr("height", function(d) {
					return h - yScale(d.y);
				})
				.attr("width", (w - padding) / dataset[0].length - barPadding )
				/* When the user mouses over a bar show the tooltip div and fill it with the relevant data */
				/* Not such a great solution for touchscreens? */
				.on("mouseover", function(d) {

					/* Get this bar's x/y values, then augment for the tooltip */
					var xPosition;
					var toolTipHeight = parseInt($(".outer-wrapper .infobox").css("height"));
					var yPosition = parseInt(d3.select(this).attr("y") ) + (parseInt(d3.select(this).attr("height")) / 2) - toolTipHeight;
					

					if ( d3.select(this).attr("x") < 350) {
						xPosition = parseFloat(d3.select(this).attr("x")) + 27;
						d3.select(".outer-wrapper .infobox").classed("infobox-left", false).classed("infobox-right", true);
					} else {
						xPosition = parseFloat(d3.select(this).attr("x")) -140;
						d3.select(".outer-wrapper .infobox").classed("infobox-left", true).classed("infobox-right", false);;
					}

					/* Update the tooltip position and value */
					d3.select(".outer-wrapper .infobox")
						.style("left", xPosition + "px")
						.style("top", yPosition + "px")
						.select(".value")
						.text(d.y);

					/* Show the tooltip */
					d3.select(".outer-wrapper .infobox").classed("hidden", false);

				})
				.on("mouseout", function() {
					/* Hide the tooltip */
					d3.select(".outer-wrapper .infobox").classed("hidden", true);
					
				});		


			/* Take the headingRowArray and use it lable the x axis */
			svg.selectAll("text")
				.data(headingRowArray)
				.enter()
				.append("text")
				.text(function(d) {
					return d;
				})
				.attr("x", function(d, i){
					return i * ((w - padding) / headingRowArray.length) + (((w - padding) / headingRowArray.length - barPadding) / 2) + padding; 
				 })
				.attr("y", function(d){
					return h + 12;
				})
				.attr("font-family", "sans-serif")
				.attr("font-size", "11px")
				.attr("fill", "black")
				.attr("text-anchor", "middle");	

			/* Create X axis */
			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + h +  ")")
				.call(xAxis);

			/* Create Y axis */
			svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(" +  padding + ", 0)")
				.call(yAxis)
				/* Add some extra text for the unit alongside the axis */ 
				.append("text")
				.attr("transform", "rotate(-90)") 
				.attr("y", -padding +12) /* magic number just to stop the top of the T being cut off */
				.attr("x", -(h / 2))
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Thousands");

			/* Event listner for when the user chooses a new option from the drop down menu */
			/* The values returned by the dropdown menus correspond to the classes of the relevant rows in the table */
			/* Calls getNewTableData, getMaleTableData and getFemaleTableData wutg these values */ 
			/* Finally calls the update bars function with chosenRow's new value  */
			d3.selectAll(".outer-wrapper .info-menu select")
				.on("change", function () {

					selectedPosition = d3.select(".outer-wrapper .info-menu .position-dropdown").property("value"),
					selectedField = d3.select(".outer-wrapper .info-menu .field-dropdown").property("value");

					/* Grab the table data that coresponds to the users choice */
					getNewTableData(selectedPosition, selectedField);
					getMaleTableData(selectedPosition, selectedField);
					getFemaleTableData(selectedPosition, selectedField);
					   
					/* Redraw the graph - taking into account the new data  selection */
					updateBars();

				});

			/* Event listner for when the user changes the adjust scale checkbox */
			d3.selectAll(".outer-wrapper .info-menu input").on("change", function() {
				adjustScaleCheck = d3.select(this).property("checked");

				/* Redraw the graph - taking into account the adjust scale choice */
				updateBars();
			});

			/* Start of the Salary table code */

			/* get the data from the first heading row containing the genders */
			/* only needs to happen once */
			$(".outer-wrapper table.salary-table.all-occupations thead tr th:not(:first)").each(function() {
				var genderData = $(this).text();
				genderRowArray.push(genderData);
			});

			/* An initial call of the function to populate the graph on page load */
			getSalaryTableData(salarySelected, degreeField, ageSelected);
			getMaxSalaryData();

			/* Define X scale */
			var xSalaryScale = d3.scale.linear()
				.domain([ 12 * barPadding, w ])
				.range([ 12 * barPadding, w ]);		 

			/* Define Y scale */
			var ySalaryScale = d3.scale.linear()
				.domain([0,	d3.max(maxSalaryArray) ])
				.range([h, padding]);

			/* Define X axis */
			var xSalaryAxis = d3.svg.axis()
				.scale(xSalaryScale)
				.orient("bottom")
				.tickSize(0, 0)
				.ticks(0);

			/* Define Y axis */
			var ySalaryAxis = d3.svg.axis()
				.scale(ySalaryScale)
				.orient("left")
				.tickSize(-w, 0)
				.ticks(7)
				.tickFormat(d3.format(",.0f"));

			/* Create 2nd SVG element for salary graph */
			var svgSalary = d3.select(".outer-wrapper .salary-chart")
						.append("svg")
						.attr("width", w)
						.attr("height", h + (padding / 2));

			/* Create Y axis early so that it is behind the bars */
			svgSalary.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(" +  12 * barPadding + ", 0)")
				.call(ySalaryAxis);				

			svgSalary.selectAll("rect")
					.data(salaryTableArray)
					.enter()
					.append("rect")
					.attr("x", function(d, i){
						return i * ( (w - 2 * barPadding) / salaryTableArray.length) + (14 * barPadding); 
					})
					.attr("y", function(d){
						return ySalaryScale(d);
					})
					.attr("width", (w - 2 * barPadding) / salaryTableArray.length - (14 * barPadding) )
					.attr("height", function(d){
						return h - ySalaryScale(d);
					})
					.attr("opacity", 1)
					.style("fill", function(d, i) {
					return	i === 0 ? "#E53524" : "#F8B436"; 
					});

			/* Add a group for the white text */
			var salaryWhiteTextGroup = svgSalary.append("g");     

			salaryWhiteTextGroup.selectAll("text")
					.data(salaryTableArray)
					.enter()
					.append("text")
					.text(function(d) {
						return "$" + thousandFormat(d); 
					})
					.attr("x", function(d, i){
						return i * ((w - 2 * barPadding) / salaryTableArray.length) + (((w - 2 * barPadding) / salaryTableArray.length - (14 * barPadding)) / 2) + (14 * barPadding); 
					})
					.attr("y", function(d){
						return ySalaryScale(d) + 20;
					})
					.attr("font-family", "sans-serif")
					.attr("font-size", "18px")
					.attr("fill", "white")
					.attr("text-anchor", "middle");

			var salaryBlackTextGroup = svgSalary.append("g"); 

		    /* Take the genderRowArray and use it lable the x axis */
			salaryBlackTextGroup.selectAll("text")
				.data(genderRowArray)
				.enter()
				.append("text")
				.text(function(d) {
					return d;
				})
				.attr("x", function(d, i){
					return i * ((w - 2 * barPadding) / salaryTableArray.length) + (((w - 2 * barPadding) / salaryTableArray.length - (14 * barPadding)) / 2) + (14 * barPadding);
				 })
				.attr("y", function(d){
					return h + 18;
				})
				.attr("font-family", "sans-serif")
				.attr("font-size", "14px")
				.attr("fill", "black")
				.attr("text-anchor", "middle");

			/* Create X axis */
			svgSalary.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + h +  ")")
				.call(xSalaryAxis);

				d3.selectAll(".outer-wrapper .salary-menu select")
				.on("change", function () {

					salarySelected = d3.select(".outer-wrapper .salary-menu .occupation-dropdown").property("value"),
					degreeField = d3.select(".outer-wrapper .salary-menu .age-dropdown").property("value");
					ageSelected = d3.select(".outer-wrapper .salary-menu .degree-dropdown").property("value");

					/* Grab the table data that coresponds to the users choice */
					getSalaryTableData(salarySelected, degreeField, ageSelected);

					/* Redraw the graph - taking into account the new data  selection */
					updateSalaryBars();

				});

		}); /* End of getScript callback function */			



		/* End of active code */
		};		

	setTimeout(function()
	{
	if (typeof jQuery !== 'undefined')
	{
		init(jQuery);
	} else
	{
		setTimeout(arguments.callee, 60);
	}
	}, 60);

})();