class DataService {
    constructor() {
        // load jsonData
        this.jsonFullData = jsonFullData; // src\data\full-data.js
        this.jsonCountryData = jsonCountryData; // src\data\team-data.js
    }

    // public
    getYears() {
        return [...new Set(this.jsonFullData.map(x => x.year))]; // [2008, 2009, 2010, 2011, 2012, 2013]
    }

    getTeams(country) {
        if (country === undefined || country == "-1" || country == null) {
            // get all teams
            return [...new Set(this.jsonCountryData.map(x => x.team))];
        }
        else {
            // get teams by country
            var teamsByCountry = this.jsonCountryData.filter(m => m.country == country);
            return [...new Set(teamsByCountry.map(x => x.team))];
        }
    }

    getCountries() {
        return [...new Set(this.jsonCountryData.map(x => x.country))]; // ["New Zealand", "Australia"]
    }

    getParts() {
        return this.getPartsWithNumber().map(m => { return m.part }); // ["early", "mid", "end", "finals"]
    }

    getPartsWithNumber() {
        return [
            { part: "early", partNumber: 1 },
            { part: "mid", partNumber: 2 },
            { part: "end", partNumber: 3 },
            { part: "finals", partNumber: 4 }
        ];
    }

    getPartNumberByPart(part) {
        return this.getPartsWithNumber().filter(m => m.part == part)[0].partNumber; // 1
    }

    getPartByPartNumber(partNumber) {
        return this.getPartsWithNumber().filter(m => m.partNumber == partNumber)[0].part; // "early"
    }

    // get country of team
    getCountryOfTeam(team) {
        return this.jsonCountryData.filter(m => m.team == team)[0].country;
    }

    // get data for combobox Teams
    getCboTeams(country) {
        return [...new Set(this.getTeams(country).map(x => {
            return {
                id: x,
                text: x
            }
        }))];
    }

    // get data for combobox Country
    getCboCountries() {
        return [...new Set(this.getCountries().map(x => {
            return {
                id: x,
                text: x
            }
        }))];
    }

    // get data for combobox Parts
    getCboParts() {
        return [...new Set(this.getParts().map(x => {
            return {
                id: x,
                text: x != "finals" ? x + "-regular" : x
            }
        }))];
    }

    // main function, get data for visualization
    getCompetitionLadder(country, teams, fromYear, toYear, part, xAxis) {
        // table competitionLadder cols: year, team, rank, points, goalsFor, goalsAgainst, goalsPercentage, finalRank
        var competitionLadder = [];

        if (xAxis == "parts") {
            // return all parts in case xAxis == "parts", part "finals" will be added later
            this.parts = [ "early", "mid", "end" ];
        }
        else if (part == "finals") {
            this.parts = [ "end" ];
        }
        else if (part != "end") {
            this.parts = [ part, "end" ];
        }
        
        this.years = this.getYears().filter(m => (m >= fromYear && m <= toYear));
        this.teams = this.getTeams();

        this.parts.forEach(part => {
            var competitionLadderPart = [];

            this.years.forEach(year => {
                var competitionLadderYear = [];
                // get data for the current year in loop
                const yearData = this.jsonFullData.filter(item => item.year == year);

                this.teams.forEach(team => {
                    // calculate points, goalsFor, goalsAgainst, goalsPercentage
                    var dataByPart = this._getDataByPart(yearData, team, part);

                    var recordCompetitionLadder = {
                        year,
                        team,
                        rank: 0,
                        points: dataByPart.points,
                        goalsFor: dataByPart.goalsFor,
                        goalsAgainst: dataByPart.goalsAgainst,
                        goalsPercentage: dataByPart.goalsPercentage,
                        finalRank: 0
                    };

                    competitionLadderYear.push(recordCompetitionLadder);
                });

                // ORDER BY points DESC, goalsPercentage DESC
                competitionLadderYear.sort((a, b) =>
                    (a.points < b.points)
                        ? 1
                        : (a.points === b.points)
                            ? ((a.goalsPercentage < b.goalsPercentage)
                                ? 1
                                : -1)
                            : -1);

                // update field rank based on sorted list
                competitionLadderYear.map((item, index) => { item.rank = index + 1; });

                competitionLadderPart.push(...competitionLadderYear);
            });

            competitionLadder.push({ part: part, competitionLadder: competitionLadderPart });
        });

        // create deep copy, not shadow copy of "end-season" part
        // https://medium.com/@gamshan001/javascript-deep-copy-for-array-and-object-97e3d4bc401a
        var competitionLadderFinals = JSON.parse(JSON.stringify(competitionLadder[competitionLadder.length - 1].competitionLadder));

        // update finalRank. Because the rank in ladder and final standing may be not the same.
        // e.g. in 2008, Waikato ranked #1 in the ladder (regular season), but after the finals, the champion is New South Wales
        // https://en.wikipedia.org/wiki/2008_ANZ_Championship_season
        this.years.forEach(year => {
            const yearData = this.jsonFullData.filter(item => item.year == year);

            // get final standings of the year. There are only 4 final standings (#1 - #4)
            var finalStandings = this._getFinalStandings(yearData);

            competitionLadderFinals.filter(m => m.year == year).map((item) => {
                var finalStandingRecords = finalStandings.filter(x => x.team == item.team);
                
                // update final rank
                if (finalStandingRecords.length > 0) {
                    item.rank = item.finalRank = finalStandingRecords[0].finalStanding;
                }
                else {
                    item.finalRank = item.rank;
                }
            });
        });

        competitionLadder.push({ part: "finals", competitionLadder: competitionLadderFinals });

        // set finalRank for every records
        this.parts.forEach((part, index) => {
            var competitionLadderPart = competitionLadder.filter(m => m.part == part)[0].competitionLadder;

            this.years.forEach(year => {
                var competitionLadderYear = competitionLadderPart.filter(m => m.year == year);

                competitionLadderYear.forEach(item => {
                    var finalRank = competitionLadderFinals.filter(m => m.team == item.team && m.year == year)[0].finalRank;
                    item.finalRank = finalRank;
                });
            });
        });

        // ORDER BY year ASC, finalRank ASC
        competitionLadder.forEach(m => {
            var competitionLadderPart = m.competitionLadder;
            
            competitionLadderPart.sort((a, b) =>
                (a.year > b.year)
                    ? 1
                    : (a.year === b.year)
                        ? ((a.finalRank > b.finalRank)
                            ? 1
                            : -1)
                        : -1);
        });

        // filter parts
        if (xAxis != "parts") {
            competitionLadder = competitionLadder.filter(m => m.part == part);
        }

        // filter teams
        this.filteredTeams = (teams == null || teams.length == 0)
            ? this.getTeams(country)
            : teams;
        competitionLadder.forEach(item => {
            item.competitionLadder = item.competitionLadder.filter(m => this.filteredTeams.includes(m.team));
        });

        // return data
        if (xAxis != "parts") {
            return competitionLadder;
        } else {
            // format data in case xAxis == "parts"
            return this._formatPartData(competitionLadder);
        }
    }

    // private
    // calculate points, goalsFor, goalsAgainst, goalsPercentage
    // support main function getCompetitionLadder
    _getDataByPart(yearData, team, part) {
        var endRound = 0;

        switch (part) {
            case "early":
                // early-season is from round 1 to 5
                endRound = 5;
                break;
            case "mid":
                // mid-season is from round 6 to 10
                endRound = 10;
                break;
            case "end":
                // end-season is from round 11 to 14
                endRound = 14;
                break;
            default:
                endRound = 14;
        }
        
        // calculate points
        var points = yearData
            .filter(item => item.homeTeam == team && item.type == "regular" && item.round <= endRound)
            .reduce((prev, current) => {
                return prev + current.htPoints;
            }, 0);
        points += yearData
            .filter(item => item.awayTeam == team && item.type == "regular" && item.round <= endRound)
            .reduce((prev, current) => {
                return prev + current.atPoints;
            }, 0);

        // calculate goalsFor
        var goalsFor = yearData
            .filter(item => item.homeTeam == team && item.type == "regular" && item.round <= endRound)
            .reduce((prev, current) => {
                return prev + current.htScore;
            }, 0);
        goalsFor += yearData
            .filter(item => item.awayTeam == team && item.type == "regular" && item.round <= endRound)
            .reduce((prev, current) => {
                return prev + current.atScore;
            }, 0);

        // calculate goalsAgainst
        var goalsAgainst = yearData
            .filter(item => item.homeTeam == team && item.type == "regular" && item.round <= endRound)
            .reduce((prev, current) => {
                return prev + current.atScore;
            }, 0);
        goalsAgainst += yearData
            .filter(item => item.awayTeam == team && item.type == "regular" && item.round <= endRound)
            .reduce((prev, current) => {
                return prev + current.htScore;
            }, 0);

        // calculate goalsPercentage
        var goalsPercentage = goalsFor / goalsAgainst * 100;

        return {
            points,
            goalsFor,
            goalsAgainst,
            goalsPercentage
        };
    }

    // get final standings of the year. There are only 4 final standings (#1 - #4)
    // support main function getCompetitionLadder
    _getFinalStandings(yearData) {
        // get all finals records of the year
        var finals = yearData.filter(item => item.type == "finals");

        // find the minorSemiLosingTeam which will be placed #4
        var minorSemiRecord = finals.filter(item => item.subType == "minor_semi")[0];     
        var minorSemiLosingTeam = minorSemiRecord.htPoints == 0
            ? minorSemiRecord.homeTeam
            : minorSemiRecord.awayTeam;

        // find the preliminaryLosingTeam which will be placed #3
        var preliminaryRecord = finals.filter(item => item.subType == "major_semi")[0];
        var preliminaryLosingTeam = preliminaryRecord.htPoints == 0
            ? preliminaryRecord.homeTeam
            : preliminaryRecord.awayTeam;

        // find the grandLosingTeam (which will be placed #2) and grandWinningTeam (which will be placed #1)
        var grandRecord = finals.filter(item => item.subType == "grand")[0];
        var grandLosingTeam = grandRecord.htPoints == 0
            ? grandRecord.homeTeam
            : grandRecord.awayTeam;
        var grandWinningTeam = grandRecord.htPoints > 0
            ? grandRecord.homeTeam
            : grandRecord.awayTeam;
            
        var fourthStanding = {
            team: minorSemiLosingTeam,
            finalStanding: 4
        };

        var thirdStanding = {
            team: preliminaryLosingTeam,
            finalStanding: 3
        };

        var secondStanding = {
            team: grandLosingTeam,
            finalStanding: 2
        };

        var firstStanding = {
            team: grandWinningTeam,
            finalStanding: 1
        };

        var finalStanding = [];
        finalStanding.push(firstStanding);
        finalStanding.push(secondStanding);
        finalStanding.push(thirdStanding);
        finalStanding.push(fourthStanding);

        return finalStanding;
    }

    // format data in case xAxis == "parts"
    // support main function getCompetitionLadder
    _formatPartData(competitionLadder) {
        var formattedPartData = [];

        // add fields part and partNumber to every item
        competitionLadder.forEach(part => {
            part.competitionLadder.forEach(item => {
                item.part = part.part;
                item.partNumber = this.getPartNumberByPart(part.part);
            });

            formattedPartData.push(...part.competitionLadder);
        });

        return formattedPartData;
    }
}