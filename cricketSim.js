//initializing global variables
var numOfBattersPerTeam = 10, // the number of batters per team is 10 but can be changed if desired
    numOfSidesOnDice = 6, // the dice as six sides - this can be changed but may cause errors
    hasRun = false, // has run is initially false
    container, runButton, rankingBox, recordBox, hoverDetails; // declaring but not defining element references (cannot be defined until page has loaded)

// Team object holds array for each team and functions to manipulate them to pull out statistics such as averages and totals
var Teams = {
	list: new Array(),
	addTeam: function(teamName, numOfBatters) {
        this.list.push(new Team(teamName, numOfBatters, this.list.length)); // the addTeam function push a new Team objet into the list array
    },
	bat: function() {
        for (var t = 0; t < this.list.length; t++)
            this.list[t].bat(); // calls all bat functions for each team
    },
	calculateStats: function() {
        for (var t = 0; t < this.list.length; t++)
            this.list[t].calculateStats(); // calculates the stats for each teams by calling internal function
    },
    reset: function() {
        for (var t = 0; t < this.list.length; t++)
            this.list[t].reset();
    },
    sortList: function() {
		this.list.sort(function(a, b) {
			var teamARuns = a.totalRuns,
				teamBRuns = b.totalRuns;
			return (teamARuns > teamBRuns? -1 : (teamARuns < teamBRuns? 1 : 0));
		}); // comparison functions sorts array by property (of each index) of totalRuns
        this.list[0].rank = 1; // the first player in the array will have a rank of 1
        for (var t = 0; t < this.list.length; t++) {
            for (var r = 1; r <= this.list.length - t - 1; r++) { // this loop (r) iterates through all of the positinos below the current iteration t
                if (this.list[t].totalRuns == this.list[t + r].totalRuns) { // the runs below are compared to t, and if they're the same
                    this.list[t + r].rank = this.list[t].rank; // they're given the same rank as t
                    continue; // reruns the loop
                }
                this.list[t + r].rank = this.list[t].rank + 1; // otherwise, we set the rank of t to one lower than t + r
                break;
            }
        }
	},
    getTeamWithHighestRuns: function() {
        var tempList = this.list.slice();
        tempList.sort(function(a, b) { // comparison function inside the sort function will sort by inner object properties of the teams
			var teamARuns = a.highestRuns,
				teamBRuns = b.highestRuns;
			return (teamARuns > teamBRuns? -1 : (teamARuns < teamBRuns? 1 : 0));
		});
        return tempList[0];
    }
}

var Batter = function(batterName) { // this batter object's constructor just takes in the name of the batter
    this.name = batterName;
    this.totalRuns = 0; // on creation, a batter initially has no runs
    this.history = new Array(); // this array will hold a record of runs for each ball
}

var Team = function(teamName, numOfBatters, id) {
    this.teamName = teamName;
	this.color = generateRGBValue(60, 170);
    this.batters = new Array(numOfBatters);
    for (var b = 0; b < this.batters.length; b++) this.batters[b] = new Batter("Batter " + (b + 1));
    this.id = id;
    this.totalRuns = 0;
    this.averageRunsPerBatter = 0;
    this.highestRuns = 0;
    this.rank = null;
    this.bat = function() {
        for (var b = 0; b < this.batters.length; b++) {
            var isIn = true;
            while (isIn) {
                var firstRoll = rollDice(numOfSidesOnDice), // first roll is cached
                    result = firstRoll - rollDice(numOfSidesOnDice), // second roll is subtracted from the first roll but not cached (no need)
                    runs = 0; // runs is initially zero
                switch (result) { // switch statement handles logic for getting the number of runs based on the die
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        runs = result; // for cases 1, 2, 3 and 4, the runs is the result
                        break;
                    case 5:
                        runs = 6; // for case 5, the runs need to be 6
                        break;
                    case 0: // case 0 means the two die were the same value
                        isIn = firstRoll != 6? false : isIn; // inline if statement checks if the first roll wasn't 6 (which means the second wasn't 6), which means isIn is set to false
                        break;
                    default: break; // the default case is when the result is negative, which mean zero runs. no need to set this, as the default value of runs above is zero
                }
                this.batters[b].history.push(isIn? runs : null); // each step of the while loop (each ball), the individial number of runs is recorded
                this.batters[b].totalRuns += runs; // the total runs is added onto as well
            }
        }
    }
    this.calculateStats = function() {
        for (var b = 0; b < this.batters.length; b++) this.totalRuns += this.batters[b].totalRuns;
        this.averageRunsPerBatter = this.totalRuns / this.batters.length;
        this.highestRuns = this.highestRuns > this.totalRuns? this.highestRuns:this.totalRuns;
    }
    this.reset = function(batterIndex) {
        for (var b = 0; b < this.batters.length; b++) {
            this.batters[b].totalRuns = 0;
            this.batters[b].history = new Array();
        }
        this.averageRunsPerBatter = 0;
        this.totalRuns = 0;
    }
    this.getData = function(func) {
        return {
            teamName: this.teamName, // this function returns a package (in the form of an object literal) with all the data
			batters: this.batters,
			totalRuns: this.totalRuns,
			averageRunsPerBatter: this.averageRunsPerBatter,
			highestRuns: this.highestRuns
		};
    }
}

function isInt(value) { // this function checks if a number is an integer and returns true or false
	if (value) {
		if (!isNaN(value)) return (parseInt(value) == value);
		else return false;
	} else return false;
}

function generateRGBValue(min, max) { // generate a RGB value
	var matrix = new Array(3); // create an array with three indexes to hold each value
	for (var i = 0; i < matrix.length; i++) {
		matrix[i] = min + Math.round(Math.random() * (max - min)); // set value between min and max
	}
	return matrix;
}

function getPosition(num) { // this function concats the correct suffix to each rank number (purely for formatting)
    var str = num.toString();
    switch (str.substring(str.length - 2, str.length)) { // check for numbers with 11, 12 or 13 at the end
        case "13":
        case "12":
        case "11":
            return str + "th"; // and give them 'th' as the suffix
        default: break;
    }
    switch (str.charAt(str.length - 1)) { // if not 11, 12 or 13, look through the last char of each number
        case "1": return str + "st"; // and return it with the appropriate suffix
        case "2": return str + "nd";
        case "3": return str + "rd";
        default: return str + "th";
    }
}

function rollDice(numOfSides) {
    return Math.ceil(Math.random() * numOfSides); // this function simply generates a random number from 1 to a specified number (6 in this program)
}

function init() {
    container = document.getElementById("container");
    runButton = document.getElementById("run-button");
    rankingBox = document.getElementById("ranking-box");
    recordBox = document.getElementById("record-box");
    hoverDetails = document.getElementById("hover-details"); // referencing all dynamic elements
    
    do {
    	var numOfTeams = prompt("How many teams? (Enter an integer value)", "");
    } while (!isInt(numOfTeams));
	
    var doNameTeams = confirm("Would you like to name all teams?\n(if not click 'Cancel')"); // we can choose to name teams or have them generated
	
	for (var t = 0; t < numOfTeams; t++) {
		var teamName = new String();
		if (doNameTeams) {
			do {
				teamName = prompt("Enter the team name for Team " + (t + 1) + ".\nMust be at least 3 characters long.", ""); // set the team name if doNameTeams is true
			} while (teamName.length < 3); // this loop continues if the team name is less than 3 characters long
		} else {
			teamName = "Team " + (t + 1); // otherwise we generate a team name based on the current iteration t
		}
		Teams.addTeam(
            teamName, numOfBattersPerTeam // globally defined number of batters per team
        );
	}
}

function displayTeamCards() { // this function displays a table for each team (right column)
    container.innerHTML = "";
	for (var t = 0; t < Teams.list.length; t++) {
		var team = Teams.list[t];
		var bgColor = "style='background-color: rgb(" + team.color.join(", ") + ");'";
        var content = "";
		content +=
            "<div class='team-card'>" +
            "<h5 " + bgColor + ">" + (hasRun? getPosition(team.rank).toUpperCase() + " PLACE" : "UNRANKED") + "</h5>" +
            "<h2>" + team.teamName.toUpperCase() + "</h2>" +
            "<div class='data-row heading'>" +
                "<span class='data-key'>NAME</span>" +
                "<span class='data-value'>RUNS</span>" + // modifying markup through JavaScript by concatinating strings with tags inside
            "</div>" +
            "<hr " + bgColor + "/>";
        for (var b = 0; b < team.batters.length; b++) {
            var batter = team.batters[b];
            content +=
                "<div class='data-row'>" +
                    "<span onmouseout='displayDetails(null, null);' onmouseover='displayDetails(" + t + ", " + b +");' class='data-key'>" + batter.name.toUpperCase() + "</span>" +
                    "<span onmouseout='displayDetails(null, null);' onmouseover='displayDetails(" + t + ", " + b +");'class='data-value'>" + batter.totalRuns + "</span>" + // span tags call displayDetails() when hovered into and out of. When the cursor moves away, null parameters are input to signify that it needs to be hidden
                "</div>";

        }
        content +=
            "<hr " + bgColor + "/>" +
            "<div class='data-row'>" +
                "<span class='data-key'>AVERAGE RUNS PER BATTER</span>" +
                "<span class='data-value'>" + team.averageRunsPerBatter + "</span>" +
            "</div>" +
            "<div class='data-row'>" +
                "<span class='data-key'>HIGHEST TOTAL RUNS RECORD</span>" +
                "<span class='data-value'>" + team.highestRuns + "</span>" + // modifying markup through JavaScript by concatinating strings with tags inside
            "</div>" +
            "<div class='data-row'>" +
                "<span class='data-key'>TOTAL RUNS</span>" +
                "<span class='data-value' " + bgColor + ">" + team.totalRuns + "</span>" +
            "</div>" +
            "<hr " + bgColor + "/>";

        content += "</div>";
        container.innerHTML += content;
	}
}

function displayDetails(t, b) { // this function handles the pop-up window on the cursor when hovering over a batter
    if (t == null || b == null) {
        hoverDetails.style.display = "none";
    } else {
        var team = Teams.list[t];
        var history = team.batters[b].history;
        hoverDetails.style.borderColor = "rgb(" + team.color.join(", ") + ");";
        hoverDetails.style.display = "block";
        hoverDetails.innerHTML = "";
        if (history.length) {
            for (var h = 0; h < history.length; h++) {
                hoverDetails.innerHTML += "BALL " + (h + 1) + "&nbsp;&nbsp;-&nbsp;&nbsp;";
                if (history[h] != null) {
                     hoverDetails.innerHTML +=
                        (history[h] == 0? "NO" : history[h]) +
                        (history[h] != 1? " RUNS" : " RUN") + "<hr/>";
                } else {
                    hoverDetails.innerHTML += "OUT";
                }
            }
        } else {
            hoverDetails.innerHTML += "RUN SIMULATION TO SEE DETAILS";
        }
    }
}

window.onmousemove = function(e) { // this function makes the hoverDetails element follow the cursor by updates its left and top css properties (it has position: fixed)
    var mouseX = e.clientX, mouseY = e.clientY;
    hoverDetails.style.top = (mouseY + 10) + "px";
    hoverDetails.style.left = (mouseX + 10) + "px"; // there is a 10 pixel offset so it isnt' directly on the cursor
};

function displayResults() { // this function displays the results into the left column of the interface
    recordBox.innerHTML = "<h3>TEAM TOTAL RUN RECORD</h3>";
    var team = Teams.getTeamWithHighestRuns();
    var bgColorGradient = "style='background: linear-gradient(to right, rgba(" + team.color.join(", ") + ", 0.7), transparent);'";
	var bgColor = "style='background: rgb(" + team.color.join(", ") + ");'";
    recordBox.innerHTML += // the recordBox element holds the highest team total runs recorded
        "<div class='row' " + bgColorGradient + ">" +
        team.teamName.toUpperCase() + "<span class='value'>" + team.highestRuns + " RUNS</span>" + "<br/>" +
        "</div>";

    rankingBox.innerHTML = "<h3>GLOBAL TEAM RANKING</h3>"; // the rankingBox element holds all of the player ranks (like a scoreboard)
    for (var r = 1; r <= Teams.list[Teams.list.length - 1].rank; r++) { // this loop iterates through all existing ranks
        for (var t = 0; t < Teams.list.length; t++) {
            if (Teams.list[t].rank == r) {
                var bgColor = "style='background: linear-gradient(to right, rgba(" + Teams.list[t].color.join(", ") + ", 0.7), transparent);'";
                rankingBox.innerHTML +=
                    "<div class='row' " + bgColor + ">" +
                    "<span class='rank'>" + getPosition(Teams.list[t].rank).toUpperCase() + "</span>" +
					"&nbsp;&nbsp;&nbsp;" + Teams.list[t].teamName.toUpperCase() + "<span class='value'>" + Teams.list[t].totalRuns + " RUNS</span>" + "<br/>" +
                    "</div>";
            }
        }
    }
}

function main() { // this is the first function to run
	init(); // and then we initialize 
	displayTeamCards(); // and display the team card for each team
}

function simulate(el) {
    if (!hasRun) {
        hasRun = true;
        el.value = "RERUN SIMULATION";
    }
    Teams.reset();
    Teams.bat();
    Teams.calculateStats();
    Teams.sortList(); // 'Teams' object functions are called during simulation for bats, calculating stats, and sorting the scoreboard
    displayTeamCards();
    displayResults(); // once processing is complete, the data is outputted

}

function reset() { // this function simply refreshes the page
    var c = confirm("Are you sure you want to reset the simulation?");
    if (c) location.reload
	(true);
}
